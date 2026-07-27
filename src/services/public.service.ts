import { httpClient } from "../core/api/client";
import { SchoolSettings, News, Gallery, Document, Teacher } from "../types";

export interface PublicData {
  settings: SchoolSettings | null;
  news: News[];
  gallery: Gallery[];
  documents: Document[];
  teachers: Teacher[];
}

export const PublicService = {
  /** Fetch all public website resources concurrently */
  async fetchAll(): Promise<PublicData> {
    const [settings, news, gallery, documents, teachers] = await Promise.all([
      httpClient<SchoolSettings | null>("/api/public/settings").catch(() => null),
      httpClient<News[]>("/api/public/news").catch(() => []),
      httpClient<Gallery[]>("/api/public/gallery").catch(() => []),
      httpClient<Document[]>("/api/public/documents").catch(() => []),
      httpClient<Teacher[]>("/api/teachers").catch(() => []),
    ]);

    return {
      settings,
      news: news || [],
      gallery: gallery || [],
      documents: documents || [],
      teachers: teachers || [],
    };
  },

  async submitPPDB(formData: Record<string, unknown>): Promise<{ success: boolean; registrationNo?: string; error?: string }> {
    return httpClient<{ success: boolean; registrationNo?: string; error?: string }>("/api/public/ppdb", {
      method: "POST",
      body: formData,
    });
  },

  async submitMessage(formData: Record<string, unknown>): Promise<{ success: boolean }> {
    return httpClient<{ success: boolean }>("/api/public/messages", {
      method: "POST",
      body: formData,
    });
  },
};
