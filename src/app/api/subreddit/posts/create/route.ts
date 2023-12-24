import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostValidator } from "@/lib/validators/post";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { subredditId, title, content } = PostValidator.parse(body);

    const existingSubscription = await db.subscription.findFirst({
      where: {
        subredditId,
        userId: session.user.id
      }
    });

    if (!existingSubscription) {
      return new Response("Must be subscribed to post", { status: 400 });
    }

    await db.post.create({
      data: {
        authorId: session.user.id,
        subredditId,
        title,
        content
      }
    });

    return new Response("OK");
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(err.message, { status: 422 });
    }

    return new Response("Could not post to subreddit, try again later", { status: 500 });
  }
}
