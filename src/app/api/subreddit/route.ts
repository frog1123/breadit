import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubbredditValidator } from "@/lib/validators/subreddit";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name } = SubbredditValidator.parse(body);

    const existingSubreddit = await db.subreddit.findFirst({
      where: {
        name
      }
    });

    if (existingSubreddit) {
      return new Response("Subreddit already exists", { status: 409 });
    }

    const newSubreddit = await db.subreddit.create({
      data: {
        name,
        creatorId: session.user.id
      }
    });

    await db.subscription.create({
      data: {
        userId: session.user.id,
        subredditId: newSubreddit.id
      }
    });

    return new Response(newSubreddit.name);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(err.message, { status: 422 });
    }

    return new Response("Could not create new subreddit", { status: 500 });
  }
}
