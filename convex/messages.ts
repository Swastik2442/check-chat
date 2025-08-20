import type { Content } from "@google/genai";
import { ConvexError, v } from "convex/values";
import type { StreamId } from "@convex-dev/persistent-text-streaming";
import { internalQuery, query } from "./_generated/server";
import { streamingComponent } from "./streaming";
import { getCurrentUser } from "./utils";

export const getAll = query({
  args: { chat: v.id("chats") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const chat = await ctx.db.get(args.chat);
    if (!chat || chat.user !== user.tokenIdentifier) {
      return [];
    }

    return await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("chat"), chat._id))
      .collect();
  }
});

export const getHistory = internalQuery({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const chatMessages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("chat"), args.chatId))
      .order("asc")
      .collect();

    const joinedResponses: Content[] = await Promise.all(
      chatMessages.map(async (msg) => {
        if (msg.by === "user") return {
          role: "user" as const,
          parts: [{ text: msg.bodyOrStreamId }]
        };
        else if (msg.by === "llm") {
          // NOTE: also returns status, what happens when status is either pending, error, or timeout?
          const { text } = await streamingComponent.getStreamBody(
            ctx, msg.bodyOrStreamId as StreamId
          );
          return { role: "model" as const, parts: [{ text }] };
        }

        throw new ConvexError("Unknown message.by value");
      })
    );

    return joinedResponses;
  }
});
