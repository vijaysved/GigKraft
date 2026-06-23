"""Manages a local `stripe listen` process for dev webhook forwarding."""
import os
import platform
import re
import subprocess
import threading


class _StripeCliManager:
    def __init__(self):
        self._proc: subprocess.Popen | None = None
        self._secret: str | None = None
        self._lock = threading.Lock()

    # ── public API ────────────────────────────────────────────────────────────

    def status(self) -> dict:
        running = self._proc_alive() or self._system_check()
        with self._lock:
            secret = self._secret
        return {"running": running, "secret": secret}

    def start(self, forward_to: str) -> dict:
        if self._proc_alive():
            with self._lock:
                return {"running": True, "secret": self._secret, "error": None}

        try:
            proc = subprocess.Popen(
                ["stripe", "listen", "--forward-to", forward_to],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
            )
        except FileNotFoundError:
            return {
                "running": False,
                "secret": None,
                "error": "Stripe CLI not found. Install it from https://stripe.com/docs/stripe-cli",
            }
        except Exception as exc:
            return {"running": False, "secret": None, "error": str(exc)}

        captured: list[str] = []
        errors: list[str] = []
        found = threading.Event()

        def _reader():
            try:
                for line in proc.stdout:  # type: ignore[union-attr]
                    stripped = line.strip()
                    if "whsec_" in stripped:
                        m = re.search(r"whsec_\S+", stripped)
                        if m:
                            captured.append(m.group(0))
                            found.set()
                            # keep draining stdout in background so the process doesn't block
                            threading.Thread(
                                target=lambda: [_ for _ in proc.stdout],  # type: ignore[union-attr]
                                daemon=True,
                            ).start()
                            return
                    else:
                        errors.append(stripped)
                    if proc.poll() is not None:
                        break
            finally:
                found.set()

        threading.Thread(target=_reader, daemon=True).start()
        found.wait(timeout=12)

        secret = captured[0] if captured else None
        if secret:
            os.environ["STRIPE_WEBHOOK_SECRET"] = secret

        with self._lock:
            self._proc = proc
            self._secret = secret

        if proc.poll() is not None:
            hint = " ".join(errors[-3:]) if errors else "Run `stripe login` and try again."
            return {"running": False, "secret": None, "error": f"Stripe CLI exited: {hint}"}

        if not secret:
            return {
                "running": True,
                "secret": None,
                "error": "Listener started but webhook secret not captured yet — refresh status in a moment.",
            }

        return {"running": True, "secret": secret, "error": None}

    # ── internals ─────────────────────────────────────────────────────────────

    def _proc_alive(self) -> bool:
        with self._lock:
            return self._proc is not None and self._proc.poll() is None

    def _system_check(self) -> bool:
        """Fallback: check the OS process list for an existing stripe listener."""
        try:
            if platform.system() == "Windows":
                r = subprocess.run(
                    ["tasklist", "/fo", "csv", "/nh"],
                    capture_output=True, text=True, timeout=3,
                )
                return "stripe" in r.stdout.lower()
            else:
                r = subprocess.run(
                    ["pgrep", "-f", "stripe listen"],
                    capture_output=True, timeout=3,
                )
                return r.returncode == 0
        except Exception:
            return False


stripe_cli = _StripeCliManager()
