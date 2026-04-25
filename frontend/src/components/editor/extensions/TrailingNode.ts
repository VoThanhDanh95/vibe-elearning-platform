import { Extension } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";

const key = new PluginKey("trailingNode");

export const TrailingNode = Extension.create({
  name: "trailingNode",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key,
        appendTransaction(_, __, state) {
          const { doc, tr, schema } = state;
          const shouldInsert = (() => {
            const last = doc.lastChild;
            if (!last) return true;
            if (last.type.name !== "paragraph") return true;
            if (last.childCount > 0) return true;
            return false;
          })();
          if (!shouldInsert) return null;
          return tr.insert(doc.content.size, schema.nodes.paragraph.create());
        },
      }),
    ];
  },
});
