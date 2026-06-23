/**
 * Vercel Edge Middleware — OG tag injection for social crawlers.
 *
 * WhatsApp, Telegram, Slack, etc. do not execute JavaScript, so they never
 * see the OG meta tags set dynamically by the React app. When a crawler
 * requests /pros/:handle, this middleware fetches OG HTML from the backend
 * and returns it directly — the URL the visitor shares stays unchanged.
 */

const BOT_UA =
  /WhatsApp|Twitterbot|facebookexternalhit|Slackbot|Googlebot|Telegram|LinkedInBot|Discordbot|Applebot|iMessage/i;

const BACKEND = "https://gigkraft-backend-production.up.railway.app";

export default async function middleware(request: Request): Promise<Response | undefined> {
  const ua = request.headers.get("user-agent") ?? "";
  if (!BOT_UA.test(ua)) return undefined; // real browser — serve the SPA normally

  const url = new URL(request.url);
  const match = url.pathname.match(/^\/pros\/([^/]+)$/);
  if (!match) return undefined;

  const handle = match[1];
  try {
    const res = await fetch(`${BACKEND}/api/pros/og/${handle}`);
    const html = await res.text();
    return new Response(html, {
      status: res.status,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  } catch {
    // Network error — fall through and let Vercel serve index.html
    return undefined;
  }
}

export const config = {
  matcher: ["/pros/:path*"],
};
