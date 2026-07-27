import { User } from "../types";
import { httpClient } from "../core/api/client";

export const AuthService = {
  async login(username: string, password: string): Promise<{ success: boolean; user: User }> {
    return httpClient<{ success: boolean; user: User }>("/api/auth/login", {
      method: "POST",
      body: { username, password },
    });
  },

  async updateProfile(
    userId: string,
    payload: { name: string; email: string; avatar?: string; password?: string },
    user: User
  ): Promise<{ success: boolean; user: User }> {
    return httpClient<{ success: boolean; user: User }>(
      "/api/auth/profile",
      {
        method: "PUT",
        body: { userId, ...payload },
      },
      user
    );
  },
};
