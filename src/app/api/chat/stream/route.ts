import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: NextRequest) {
    const body = await request.json();
    if (!body.message) return Response.json({ error: "Invalid Request Body" }, { status: 400 });

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: JSON.stringify(body.message),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
        async start(controller) {
            for await (const chunk of stream) {
                if (chunk.text)
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk.text)}\n\n`));
            }
            controller.close();
        },
    });

    return new Response(readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }
    });
}
