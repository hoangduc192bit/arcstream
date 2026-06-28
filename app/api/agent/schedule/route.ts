import { NextResponse } from "next/server";
import { generateStructured } from "@/lib/gemini";

interface ScheduleResponse {
  isSchedule: boolean;
  cronExpression?: string;
  subject?: string;
  destinations?: string[];
  humanReadable?: string;
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const systemPrompt = `You are an AI scheduling intent parser for ArcStream.
Analyze the user's natural language request and check if they want to schedule a recurring/future report or task.

User request: "${prompt}"

If the request is a scheduling command (e.g. "cứ vào 5h UTC...", "every Monday at 9am...", "hàng ngày lúc..."), extract:
1. isSchedule: true
2. cronExpression: standard cron format string (e.g. "0 5 * * *" for 5:00 UTC daily, "0 9 * * 1" for Monday 9:00 UTC, etc.)
3. subject: short descriptive title of the task (in Vietnamese if the user asked in Vietnamese, e.g. "Phân tích tài chính Mỹ")
4. destinations: array of notification channels mentioned (e.g. ["Gmail", "Telegram", "Discord", "Email"])
5. humanReadable: a clear Vietnamese description of the schedule (e.g. "Hàng ngày vào lúc 5:00 UTC")

If the request is NOT a scheduling command (e.g. "hãy phân tích...", "tóm tắt bài viết này...", "swot...", one-off analysis requests), return exactly:
{
  "isSchedule": false
}

Respond with valid JSON only.`;

    const result = await generateStructured<ScheduleResponse>(systemPrompt, {
      isSchedule: false,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in schedule parser route:", error);
    return NextResponse.json({ isSchedule: false, error: String(error) }, { status: 500 });
  }
}
