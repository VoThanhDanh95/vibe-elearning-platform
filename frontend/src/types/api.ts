import type { TiptapJSON } from "./editor";

export type AnswerStatus = "draft" | "submitted";

export interface UserAnswer {
  id: string;
  question: number;
  content: TiptapJSON | Record<string, never>;
  status: AnswerStatus;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
}

export interface MediaUploadResponse {
  url: string;
  id: string;
}

export interface Question {
  id: number;
  prompt: string;
  question_type: "rich_text" | "multiple_choice" | "short_answer";
  order: number;
}

export interface Exercise {
  id: number;
  title: string;
  description: string;
  questions: Question[];
  created_at: string;
}
