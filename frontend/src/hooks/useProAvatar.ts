import { useEffect, useState } from "react";

const STORAGE_KEY = "gigkraft.pro_avatar";
const EVENT_NAME = "pro-avatar-updated";
const MAX_DIMENSION = 400; // resize to 400×400 max before storing
const JPEG_QUALITY = 0.85;

export function loadAvatar(): string | null {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

export function clearAvatar() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

/** Read a File as a data URL preserving original resolution and format. */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Resize + JPEG-compress a File to a data URL small enough for localStorage. */
export function compressToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas unavailable")); return; }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}

export function saveAvatar(dataUrlOrHttpUrl: string) {
  try { localStorage.setItem(STORAGE_KEY, dataUrlOrHttpUrl); } catch (e) {
    console.warn("localStorage quota exceeded — avatar not stored locally.", e);
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

/** Reactive hook — re-renders whenever the avatar changes (same tab or another). */
export function useProAvatar(): string | null {
  const [src, setSrc] = useState<string | null>(loadAvatar);

  useEffect(() => {
    const refresh = () => setSrc(loadAvatar());
    window.addEventListener(EVENT_NAME, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT_NAME, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return src;
}
