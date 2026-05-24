import { NextResponse } from "next/server";

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="18" fill="#16a34a"/>
  <path d="M33 13c8 0 15 7 15 15v9c0 8-7 14-15 14h-3c-8 0-14-6-14-14v-9c0-8 6-15 14-15h3Zm-2 12c-3 0-5 2-5 5v8c0 3 2 5 5 5h1c3 0 6-2 6-5v-8c0-3-3-5-6-5h-1Z" fill="#fff"/>
</svg>`;

export function GET() {
  return new NextResponse(favicon, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
