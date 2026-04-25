import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { TrailingNode } from "./TrailingNode";
import { CustomImage } from "./CustomImage";
import { SlashCommand } from "./SlashCommand";

const lowlight = createLowlight(common);

export function buildExtensions() {
  return [
    StarterKit.configure({
      codeBlock: false, // replaced by CodeBlockLowlight
      heading: { levels: [1, 2, 3] },
    }),
    CodeBlockLowlight.configure({ lowlight }),
    CustomImage,
    Placeholder.configure({
      placeholder: "Type '/' for commands, or start writing…",
      emptyEditorClass: "is-editor-empty",
    }),
    TrailingNode,
    SlashCommand,
  ];
}
