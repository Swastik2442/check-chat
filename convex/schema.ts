import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { StreamIdValidator } from "@convex-dev/persistent-text-streaming";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string()
  }).index("by_token", ["tokenIdentifier"]),
  chats: defineTable({
    user: v.id("users"),
    title: v.string()
  }),
  messages: defineTable({
    chat: v.id("chats"),
    bodyOrStreamId: v.union(v.string(), StreamIdValidator),
    by: v.union(v.literal("user"), v.literal("llm"))
  })
});
