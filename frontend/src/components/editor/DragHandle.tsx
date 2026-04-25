import { useEffect, useRef } from "react";
import type { Editor } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { EditorView } from "@tiptap/pm/view";

const DRAG_HANDLE_CLASS = "drag-handle";
const dragHandleKey = new PluginKey("dragHandle");

interface Props {
  editor: Editor | null;
}

export function DragHandle({ editor }: Props) {
  const handleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor) return;

    const handle = handleRef.current;
    if (!handle) return;

    const plugin = new Plugin({
      key: dragHandleKey,
      view(view: EditorView) {
        const onMouseMove = (event: MouseEvent) => {
          const target = document.elementFromPoint(event.clientX, event.clientY);
          if (!target) return;

          const editorEl = view.dom;
          const blockEl = target.closest(
            "p, h1, h2, h3, li, blockquote, pre, hr, img"
          ) as HTMLElement | null;

          if (!blockEl || !editorEl.contains(blockEl)) {
            handle.style.display = "none";
            return;
          }

          const rect = blockEl.getBoundingClientRect();
          handle.style.display = "flex";
          handle.style.position = "fixed";
          handle.style.top = `${rect.top + 4}px`;
          handle.style.left = `${rect.left - 28}px`;
        };

        document.addEventListener("mousemove", onMouseMove);

        return {
          destroy() {
            document.removeEventListener("mousemove", onMouseMove);
          },
        };
      },
    });

    const existingPlugins = editor.state.plugins;
    editor.view.updateState(
      editor.state.reconfigure({ plugins: [...existingPlugins, plugin] })
    );

    return () => {
      editor.view.updateState(
        editor.state.reconfigure({ plugins: existingPlugins })
      );
    };
  }, [editor]);

  return (
    <div
      ref={handleRef}
      className={DRAG_HANDLE_CLASS}
      style={{ display: "none", zIndex: 50 }}
      title="Drag to reorder"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
      >
        <circle cx="5" cy="4" r="1.5" />
        <circle cx="5" cy="8" r="1.5" />
        <circle cx="5" cy="12" r="1.5" />
        <circle cx="11" cy="4" r="1.5" />
        <circle cx="11" cy="8" r="1.5" />
        <circle cx="11" cy="12" r="1.5" />
      </svg>
    </div>
  );
}
