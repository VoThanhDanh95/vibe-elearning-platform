import api from "./api";
import type { TiptapJSON } from "@/types/editor";
import type { UserAnswer } from "@/types/api";

export async function getAnswer(questionId: number): Promise<UserAnswer | null> {
  const { data } = await api.get<UserAnswer[]>("/answers/", {
    params: { question: questionId },
  });
  return data[0] ?? null;
}

export async function saveDraft(
  questionId: number,
  content: TiptapJSON,
  answerId?: string
): Promise<UserAnswer> {
  if (answerId) {
    const { data } = await api.patch<UserAnswer>(`/answers/${answerId}/`, {
      content,
    });
    return data;
  }
  const { data } = await api.post<UserAnswer>("/answers/", {
    question: questionId,
    content,
  });
  return data;
}

export async function submitAnswer(answerId: string): Promise<UserAnswer> {
  const { data } = await api.post<UserAnswer>(`/answers/${answerId}/submit/`);
  return data;
}
