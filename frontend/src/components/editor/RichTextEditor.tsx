import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { buildExtensions } from "./extensions";
import { SlashCommandMenu } from "./SlashCommandMenu";
import { DragHandle } from "./DragHandle";
import { useAnswerDraft } from "@/hooks/useAnswerDraft";
import { cn } from "@/lib/utils";

interface Props {
  questionId: number;
  readOnly?: boolean;
  className?: string;
}

export function RichTextEditor({ questionId, readOnly = false, className }: Props) {
  const editor = useEditor({
    extensions: buildExtensions(),
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: "tiptap-editor prose prose-sm max-w-none focus:outline-none px-4 py-3 min-h-[240px]",
      },
    },
  });

  const { isSaving, lastSavedAt, isSubmitted, initialContent, submitAnswer } =
    useAnswerDraft(questionId, editor ?? null);

  // Populate editor once the draft content is fetched
  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  // Reflect submitted state in editability
  useEffect(() => {
    if (editor && isSubmitted) {
      editor.setEditable(false);
    }
  }, [editor, isSubmitted]);

  return (
    <div className={cn("relative", className)}>
      {/* Save status */}
      <div className="flex items-center justify-between border-b px-4 py-2 text-xs text-gray-400">
        <span>
          {isSubmitted
            ? "Submitted"
            : isSaving
            ? "Saving…"
            : lastSavedAt
            ? `Saved ${lastSavedAt.toLocaleTimeString()}`
            : "Draft"}
        </span>
        {!isSubmitted && (
          <button
            onClick={submitAnswer}
            className="rounded bg-purple-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
            disabled={isSaving}
          >
            Submit Answer
          </button>
        )}
      </div>

      {/* Drag handle (positioned fixed via its own logic) */}
      <DragHandle editor={editor ?? null} />

      {/* Editor surface */}
      <div className="relative">
        <EditorContent editor={editor} />
      </div>

      {/* Slash command popup (portal to body) */}
      <SlashCommandMenu />
    </div>
  );
}
