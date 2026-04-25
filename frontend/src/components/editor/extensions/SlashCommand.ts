import { Extension, type Editor } from "@tiptap/react";
import Suggestion, { type SuggestionProps } from "@tiptap/suggestion";
import type { SlashCommandItem } from "@/types/editor";

export const SLASH_COMMANDS: SlashCommandItem[] = [
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: "H1",
    command: (editor) =>
      editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: "H2",
    command: (editor) =>
      editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: "H3",
    command: (editor) =>
      editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: "Bullet List",
    description: "Unordered list of items",
    icon: "•",
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: "Ordered List",
    description: "Numbered list of items",
    icon: "1.",
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: "Code Block",
    description: "Block of code with syntax highlighting",
    icon: "</>",
    command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    title: "Blockquote",
    description: "Highlighted quote",
    icon: "❝",
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: "Divider",
    description: "Horizontal separator line",
    icon: "—",
    command: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    title: "Image",
    description: "Upload an image",
    icon: "🖼",
    command: (_editor) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        const { uploadImage } = await import("@/lib/uploadApi");
        try {
          const url = await uploadImage(file);
          _editor.chain().focus().setImage({ src: url, alt: file.name }).run();
        } catch {
          // upload failed — no-op
        }
      };
      input.click();
    },
  },
];

export type SlashCommandSuggestion = SuggestionProps<SlashCommandItem>;

export interface SlashCommandState {
  props: SlashCommandSuggestion | null;
}

// Module-level ref shared with SlashCommandMenu component
export let slashMenuState: SlashCommandState = { props: null };
export let slashMenuListeners: Array<(s: SlashCommandState) => void> = [];

export function subscribeSlashMenu(fn: (s: SlashCommandState) => void) {
  slashMenuListeners.push(fn);
  return () => {
    slashMenuListeners = slashMenuListeners.filter((l) => l !== fn);
  };
}

function notifyListeners() {
  slashMenuListeners.forEach((fn) => fn({ ...slashMenuState }));
}

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: false,
        command({ editor, range, props }: { editor: Editor; range: { from: number; to: number }; props: SlashCommandItem }) {
          editor.chain().focus().deleteRange(range).run();
          props.command(editor);
        },
        items({ query }: { query: string }): SlashCommandItem[] {
          const q = query.toLowerCase();
          return SLASH_COMMANDS.filter(
            (c) =>
              c.title.toLowerCase().includes(q) ||
              c.description.toLowerCase().includes(q)
          );
        },
        onStart(props: SlashCommandSuggestion) {
          slashMenuState.props = props;
          notifyListeners();
        },
        onUpdate(props: SlashCommandSuggestion) {
          slashMenuState.props = props;
          notifyListeners();
        },
        onExit() {
          slashMenuState.props = null;
          notifyListeners();
        },
        onKeyDown({ event }: { event: KeyboardEvent }) {
          // Forward keyboard navigation to the menu component
          if (["ArrowUp", "ArrowDown", "Enter", "Escape"].includes(event.key)) {
            const customEvent = new CustomEvent("slashMenuKeydown", {
              detail: event.key,
            });
            document.dispatchEvent(customEvent);
            return true;
          }
          return false;
        },
        render() {
          return {
            onStart: () => {},
            onUpdate: () => {},
            onExit: () => {},
            onKeyDown: () => false,
          };
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
