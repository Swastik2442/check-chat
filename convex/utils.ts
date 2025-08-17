import { ConvexError } from "convex/values";
import type { GenericQueryCtx, GenericMutationCtx, GenericDataModel } from "convex/server";

export const getCurrentUser =  async <T extends GenericDataModel>(ctx: GenericQueryCtx<T> | GenericMutationCtx<T>) => {
  const user = await ctx.auth.getUserIdentity();
  if (user === null) {
    throw new ConvexError("Not authenticated");
  }
  return user;
};
