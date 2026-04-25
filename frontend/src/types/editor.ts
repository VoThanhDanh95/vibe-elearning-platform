export interface TiptapJSON {
  type: "doc";
  content: TiptapNode[];
}

export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  text?: string;
}

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  command: (editor: import("@tiptap/react").Editor) => void;
}
