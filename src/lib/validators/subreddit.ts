import { z } from "zod";

export const SubbredditValidator = z.object({
  name: z.string().min(3).max(31)
});

export const SubredditSubscriptionValidator = z.object({
  subredditId: z.string()
});

export type CreateSubredditPayload = z.infer<typeof SubbredditValidator>;
export type SubscribeToSubredditPayload = z.infer<typeof SubredditSubscriptionValidator>;
