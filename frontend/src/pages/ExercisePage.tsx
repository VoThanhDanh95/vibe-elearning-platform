import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Exercise } from "@/types/api";
import { RichTextEditor } from "@/components/editor/RichTextEditor";

interface Props {
  exerciseId: number;
}

export function ExercisePage({ exerciseId }: Props) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Exercise>(`/exercises/${exerciseId}/`)
      .then(({ data }) => setExercise(data))
      .catch(() => setError("Failed to load exercise."))
      .finally(() => setLoading(false));
  }, [exerciseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading…
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        {error ?? "Exercise not found."}
      </div>
    );
  }

  const richTextQuestions = exercise.questions.filter(
    (q) => q.question_type === "rich_text"
  );

  return (
    <div className="mx-auto max-w-3xl py-10 px-4">
      <h1 className="mb-2 text-2xl font-semibold">{exercise.title}</h1>
      {exercise.description && (
        <p className="mb-8 text-gray-500">{exercise.description}</p>
      )}

      <div className="space-y-10">
        {richTextQuestions.map((question, idx) => (
          <section key={question.id} className="rounded-xl border shadow-sm">
            <div className="border-b px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Question {idx + 1}
              </p>
              <p className="mt-1 text-base text-gray-800">{question.prompt}</p>
            </div>
            <RichTextEditor questionId={question.id} />
          </section>
        ))}
      </div>
    </div>
  );
}
