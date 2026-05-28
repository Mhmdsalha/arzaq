import { NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { getNavigationSummaryFresh } from "@/services/navigation.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const STREAM_INTERVAL_MS = 5_000;

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let lastPayload = "";

  const stream = new ReadableStream({
    async start(controller) {
      async function pushSummary(force = false) {
        try {
          const summary = await getNavigationSummaryFresh(userId);
          const payload = JSON.stringify(summary);

          if (!force && payload === lastPayload) {
            return;
          }

          lastPayload = payload;
          controller.enqueue(encoder.encode(`event: summary\ndata: ${payload}\n\n`));
        } catch {
          controller.enqueue(encoder.encode(`event: error\ndata: {}\n\n`));
        }
      }

      await pushSummary(true);
      intervalId = setInterval(() => {
        void pushSummary();
      }, STREAM_INTERVAL_MS);

      request.signal.addEventListener("abort", () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
        controller.close();
      });
    },
    cancel() {
      if (intervalId) {
        clearInterval(intervalId);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
