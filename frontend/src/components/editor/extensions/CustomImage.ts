import Image from "@tiptap/extension-image";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { uploadImage } from "@/lib/uploadApi";

const PLACEHOLDER_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='60'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='12' fill='%2394a3b8'%3EUploading…%3C/text%3E%3C/svg%3E";

async function handleFileUpload(
  file: File,
  editor: import("@tiptap/react").Editor
) {
  if (!file.type.startsWith("image/")) return;

  // Insert placeholder at current selection
  editor
    .chain()
    .focus()
    .setImage({ src: PLACEHOLDER_SRC, alt: file.name })
    .run();

  // Find the placeholder position
  let placeholderPos = -1;
  editor.state.doc.descendants((node, pos) => {
    if (
      node.type.name === "image" &&
      node.attrs.src === PLACEHOLDER_SRC
    ) {
      placeholderPos = pos;
    }
  });

  try {
    const url = await uploadImage(file);
    if (placeholderPos >= 0) {
      editor
        .chain()
        .focus()
        .command(({ tr }) => {
          tr.setNodeMarkup(placeholderPos, undefined, {
            src: url,
            alt: file.name,
          });
          return true;
        })
        .run();
    }
  } catch {
    // Remove the placeholder on failure
    if (placeholderPos >= 0) {
      editor
        .chain()
        .focus()
        .command(({ tr }) => {
          tr.delete(placeholderPos, placeholderPos + 1);
          return true;
        })
        .run();
    }
  }
}

export const CustomImage = Image.extend({
  addProseMirrorPlugins() {
    const editor = this.editor;
    return [
      new Plugin({
        key: new PluginKey("customImage"),
        props: {
          handlePaste(_, event) {
            const items = Array.from(event.clipboardData?.items ?? []);
            const imageItem = items.find((i) => i.type.startsWith("image/"));
            if (!imageItem) return false;
            const file = imageItem.getAsFile();
            if (!file) return false;
            handleFileUpload(file, editor);
            return true;
          },
          handleDrop(_, event) {
            const files = Array.from(event.dataTransfer?.files ?? []);
            const imageFile = files.find((f) => f.type.startsWith("image/"));
            if (!imageFile) return false;
            handleFileUpload(imageFile, editor);
            return true;
          },
        },
      }),
    ];
  },
}).configure({
  HTMLAttributes: { class: "rounded-md max-w-full" },
  allowBase64: false,
});
