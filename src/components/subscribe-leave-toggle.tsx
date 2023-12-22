"use client";

import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { SubscribeToSubredditPayload } from "@/lib/validators/subreddit";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { FC, startTransition } from "react";

interface SubscribeLeaveToggleProps {
  subredditId: string;
  isSubscribed: boolean;
  subredditName: string;
}

export const SubscribeLeaveToggle: FC<SubscribeLeaveToggleProps> = ({ subredditId, isSubscribed, subredditName }) => {
  const { loginToast } = useCustomToast();
  const router = useRouter();

  const { mutate: subscribe, isLoading: isSubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubredditPayload = {
        subredditId
      };

      const { data } = await axios.post("/api/subreddit/subscribe", payload);

      return data as string;
    },
    onError: err => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "There was a problem",
        description: "Something went wrong, please try again",
        variant: "destructive"
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });

      return toast({
        title: "Subscribed",
        description: `You are now subscribed to r/${subredditName}`
      });
    }
  });

  const { mutate: unsubscribe, isLoading: isUnsubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubredditPayload = {
        subredditId
      };

      const { data } = await axios.post("/api/subreddit/unsubscribe", payload);

      return data as string;
    },
    onError: err => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "There was a problem",
        description: "Something went wrong, please try again",
        variant: "destructive"
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });

      return toast({
        title: "Unsubscribed",
        description: `You are now unsubscribed from r/${subredditName}`
      });
    }
  });

  return !isSubscribed ? (
    <Button onClick={() => subscribe()} isLoading={isSubLoading} className="w-full mt-1 mb-4">
      Join to post
    </Button>
  ) : (
    <Button onClick={() => unsubscribe()} isLoading={isUnsubLoading} className="w-full mt-1 mb-4">
      Leave community
    </Button>
  );
};
