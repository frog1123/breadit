import { EditorOutput } from "@/components/editor-output";
import { formatTimeToNow } from "@/lib/utils";
import { Post as PrismaPost, User, Vote } from "@prisma/client";
import { Dot, MessageSquare } from "lucide-react";
import { FC, useRef } from "react";

interface PostProps {
  subredditName: string;
  post: PrismaPost & {
    author: User;
    botes: Vote[];
  };
  commentsAmount: number;
}

export const Post: FC<PostProps> = ({ subredditName, post, commentsAmount }) => {
  const postRef = useRef<HTMLDivElement>(null);

  return (
    <div className="rounded-md bg-white shadow">
      <div className="px-6 py-4 flex justify-between">
        {/* TODO post votes */}

        <div className="w-0 flex-1">
          <div className="max-h-40 mt-1 text-xs text-gray-500 flex place-items-center">
            {subredditName && (
              <>
                <a href={`/r/${subredditName}`} className="underline text-zinc-900 text-sm underline-offset-2">
                  r/{subredditName}
                </a>
                <span className="px-1">
                  <Dot />
                </span>
              </>
            )}
            <span>Posted by u/{post.author.name}</span>&nbsp;{formatTimeToNow(new Date(post.createdAt))}
          </div>
          <a href={`/r/${subredditName}/post/${post.id}`}>
            <h1 className="text-lg font-semibold py-2 leading-6 text-gray-900">{post.title}</h1>
          </a>
          <div className="relative text-sm max-h-40 w-full overflow-clip" ref={postRef}>
            <EditorOutput content={post.content} />
            {postRef.current?.clientHeight === 160 && <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent"></div>}
          </div>
        </div>
      </div>
      <div className="bg-gray-50 z-20 text-sm p-4 sm:px-6">
        <a href={`/r/${subredditName}`} className="w-fit flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> {commentsAmount} comments
        </a>
      </div>
    </div>
  );
};
