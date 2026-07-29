import { httpClient } from "../core/api/client";
import { ForumPost, ForumReply } from "../types";

export const ForumService = {
  async getPosts(): Promise<ForumPost[]> {
    return httpClient<ForumPost[]>("/forum");
  },

  async createPost(payload: Record<string, unknown>): Promise<{ success: boolean; post: ForumPost }> {
    return httpClient<{ success: boolean; post: ForumPost }>("/forum", {
      method: "POST",
      body: payload,
    });
  },

  async addReply(postId: string, payload: Record<string, unknown>): Promise<{ success: boolean; reply: ForumReply }> {
    return httpClient<{ success: boolean; reply: ForumReply }>(`/forum/${postId}/reply`, {
      method: "POST",
      body: payload,
    });
  },

  async toggleUpvote(postId: string, userId: string): Promise<{ success: boolean; upvotes: string[] }> {
    return httpClient<{ success: boolean; upvotes: string[] }>(`/forum/${postId}/upvote`, {
      method: "POST",
      body: { userId },
    });
  },

  async deletePost(postId: string, userId: string, userRole: string): Promise<{ success: boolean }> {
    return httpClient<{ success: boolean }>(`/forum/${postId}`, {
      method: "DELETE",
      headers: {
        "x-user-id": userId,
        "x-user-role": userRole,
      },
    });
  },
};
