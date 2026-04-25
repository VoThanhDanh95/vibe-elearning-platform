import { useCallback, useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { getAnswer, saveDraft, submitAnswer } from "@/lib/answerApi";
import type { TiptapJSON } from "@/types/editor";

const DEBOUNCE_MS = 1500;

export interface AnswerDraftState {
  answerId: string | undefined;
  isSaving: boolean;
  lastSavedAt: Date | undefined;
  isSubmitted: boolean;
  initialContent: TiptapJSON | undefined;
  submitAnswer: () => Promise<void>;
}

export function useAnswerDraft(
  questionId: number,
  editor: Editor | null
): AnswerDraftState {
  const [answerId, setAnswerId] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | undefined>(undefined);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [initialContent, setInitialContent] = useState<TiptapJSON | undefined>(undefined);

  const answerIdRef = useRef<string | undefined>(undefined);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Load existing draft on mount
  useEffect(() => {
    getAnswer(questionId).then((answer) => {
      if (!isMounted.current || !answer) return;
      setAnswerId(answer.id);
      answerIdRef.current = answer.id;
      setIsSubmitted(answer.status === "submitted");
      if (answer.content && Object.keys(answer.content).length > 0) {
        setInitialContent(answer.content as TiptapJSON);
      }
    });
  }, [questionId]);

  // Auto-save on editor content change
  useEffect(() => {
    if (!editor || isSubmitted) return;

    const save = async () => {
      setIsSaving(true);
      try {
        const content = editor.getJSON() as TiptapJSON;
        const answer = await saveDraft(questionId, content, answerIdRef.current);
        if (!isMounted.current) return;
        setAnswerId(answer.id);
        answerIdRef.current = answer.id;
        setLastSavedAt(new Date());
      } finally {
        if (isMounted.current) setIsSaving(false);
      }
    };

    const onUpdate = () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(save, DEBOUNCE_MS);
    };

    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [editor, questionId, isSubmitted]);

  const handleSubmit = useCallback(async () => {
    if (!answerIdRef.current) return;
    // Flush any pending save first
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      const content = editor?.getJSON() as TiptapJSON;
      await saveDraft(questionId, content, answerIdRef.current);
    }
    await submitAnswer(answerIdRef.current);
    if (!isMounted.current) return;
    setIsSubmitted(true);
    editor?.setEditable(false);
  }, [editor, questionId]);

  return {
    answerId,
    isSaving,
    lastSavedAt,
    isSubmitted,
    initialContent,
    submitAnswer: handleSubmit,
  };
}
