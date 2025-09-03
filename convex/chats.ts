import { GoogleGenAI, ApiError } from "@google/genai";
import { ConvexError, v } from "convex/values";
import type { StreamId } from "@convex-dev/persistent-text-streaming";
import { query, mutation, httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { streamingComponent } from "./streaming";
import { rateLimiter } from "./ratelimiting";
import { getCurrentUser } from "./utils";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const get = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const chatId = ctx.db.normalizeId("chats", args.chatId);
    if (!chatId) {
      throw new ConvexError("Invalid chatId");
    }

    const user = await getCurrentUser(ctx);
    const chat = await ctx.db.get(chatId);
    if (!chat || chat.user !== user.tokenIdentifier) {
      throw new ConvexError("Chat not found");
    }
    return chat;
  }
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("user"), user.tokenIdentifier))
      .order("desc")
      .collect();
  }
});

export const startChat = mutation({
  args: { body: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    await rateLimiter.limit(ctx, "sendMessage", { key: user.tokenIdentifier, throws: true });

    const chatId = await ctx.db.insert("chats", {
      user: user.tokenIdentifier,
      title: "New Chat"
    });

    await ctx.db.insert("messages", {
      bodyOrStreamId: args.body,
      by: "user",
      chat: chatId
    });

    const responseStreamId = await streamingComponent.createStream(ctx);
    await ctx.db.insert("messages", {
      bodyOrStreamId: responseStreamId,
      by: "llm",
      chat: chatId
    });

    return { chatId, responseStreamId };
  }
});

export const continueChat = mutation({
  args: { body: v.string(), chat: v.id("chats") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    await rateLimiter.limit(ctx, "sendMessage", { key: user.tokenIdentifier, throws: true });

    const chat = await ctx.db.get(args.chat);
    if (!chat || chat.user !== user.tokenIdentifier) {
      throw new ConvexError("Chat not found");
    }

    await ctx.db.insert("messages", {
      bodyOrStreamId: args.body,
      by: "user",
      chat: chat._id
    });

    const responseStreamId = await streamingComponent.createStream(ctx);
    await ctx.db.insert("messages", {
      bodyOrStreamId: responseStreamId,
      by: "llm",
      chat: chat._id
    });
    return { responseStreamId };
  }
});

export const deleteChat = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.user !== user.tokenIdentifier) {
      throw new ConvexError("Chat not found");
    }

    const chatMessages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("chat"), chat._id))
      .collect();

    for (const msg of chatMessages) {
      // TODO: Add a way to stop any ongoing streams
      await ctx.db.delete(msg._id);
    }
    await ctx.db.delete(chat._id);
  }
});

export const streamChat = httpAction(async (ctx, request) => {
  const body = (await request.json()) as { streamId: string; chatId: string; };

  const response = await streamingComponent.stream(
    ctx,
    request,
    body.streamId as StreamId,
    async (ctx, _request, _streamId, append) => {
      const chat = await ctx.runQuery(api.chats.get, { chatId: body.chatId });
      const history = await ctx.runQuery(internal.messages.getHistory, { chatId: chat._id });

      try {
        const stream = await ai.models.generateContentStream({
          model: "gemini-2.5-flash",
          config: {
            systemInstruction: `You are a helpful assistant that can answer questions and help with tasks.
  If possible, provide your response in Markdown format.
  ${history.length > 1 ? '' : "\nYou are continuing a conversation. The conversation so far is in the following content:"}`
          },
          contents: [
            ...history
          ]
        });

        for await (const chunk of stream) {
          if (chunk.text)
            await append(chunk.text);
        }
      } catch (err) {
        if (err instanceof ApiError) {
          await append(err.message);
          return;
        }
        throw new ConvexError(`Failed to get response from LLM: ${err}`);
      }
    }
  );

  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Vary", "Origin");

  return response;
});
