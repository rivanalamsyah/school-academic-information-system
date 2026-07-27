import { httpClient } from "../core/api/client";
import { ForumPost, ForumReply } from "../types";

export const ForumService = {
  async getPosts(): Promise<ForumPost[]> {
    return httpClient<ForumPost[]>("/api/forum");
  },

  async createPost(payload: Record<string, unknown>): Promise<{ success: boolean; post: ForumPost }> {
    return httpClient<{ success: boolean; post: ForumPost }>("/api/forum", {
      method: "POST",
      body: payload,
    });
  },

  async addReply(postId: string, payload: Record<string, unknown>): Promise<{ success: boolean; reply: ForumReply }> {
    return httpClient<{ success: boolean; reply: ForumReply }>(`/api/forum/${postId}/reply`, {
      method: "POST",
      body: payload,
    });
  },

  async toggleUpvote(postId: string, userId: string): Promise<{ success: boolean; upvotes: string[] }> {
    return httpClient<{ success: boolean; upvotes: string[] }>(`/api/forum/${postId}/upvote`, {
      method: "POST",
      body: { userId },
    });
  },

  async deletePost(postId: string, userId: string, userRole: string): Promise<{ success: boolean }> {
    return httpClient<{ success: boolean }>(`/api/forum/${postId}`, {
      method: "DELETE",
      headers: {
        "x-user-id": userId,
        "x-user-role": userRole,
      },
    });
  },
};
