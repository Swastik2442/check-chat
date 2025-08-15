import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: NextRequest) {
    const body = await request.json();
    if (!body.message) return Response.json({ error: "Invalid Request Body" }, { status: 400 });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: JSON.stringify(body.message),
    });

    return Response.json({ response: response.text });
}
