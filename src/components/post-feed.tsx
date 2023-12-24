"use client";

import { ExtendedPost } from "@/types/db";
import { FC, useRef } from "react";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import axios from "axios";
import { VoteType } from "@prisma/client";
import { useSession } from "next-auth/react";
import { Post } from "@/components/post";

interface PostFeedProps {
  initialPosts: ExtendedPost[];
  subredditName?: string;
}

export const PostFeed: FC<PostFeedProps> = ({ initialPosts, subredditName }) => {
  const lastPostRef = useRef<HTMLElement>(null);

  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1
  });

  const { data: session } = useSession();

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ["infinite-query"],
    async ({ pageParam = 1 }) => {
      // parenthesis needed
      const query = `/api/posts?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=${pageParam}` + (!!subredditName ? `&subredditName=${subredditName}` : "");

      const { data } = await axios.get(query);
      return data as ExtendedPost[];
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
      initialData: { pages: [initialPosts], pageParams: [1] }
    }
  );

  const posts = data?.pages.flatMap(page => page) ?? initialPosts;

  return (
    <ul className="flex flex-col col-span-2 space-y-6">
      {posts.map((post, index) => {
        const votesAmount = post.votes.reduce((acc, vote) => {
          if (vote.type === VoteType.UP) return acc + 1;
          if (vote.type === VoteType.DOWN) return acc - 1;
          return acc;
        }, 0);

        const currentVote = post.votes.find(vote => vote.userId === session?.user.id);

        if (index === posts.length - 1) {
          return (
            <li key={`post-${post.id}`} ref={ref}>
              {/* @ts-ignore */}
              <Post subredditName={post.subreddit.name} post={post} commentsAmount={post.comments.length} />
            </li>
          );
          // @ts-ignore
        } else return <Post subredditName={post.subreddit.name} post={post} commentsAmount={post.comments.length} />;
      })}
    </ul>
  );
};
