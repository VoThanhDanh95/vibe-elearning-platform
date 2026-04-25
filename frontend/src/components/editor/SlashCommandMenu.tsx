import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  subscribeSlashMenu,
  type SlashCommandState,
  SLASH_COMMANDS,
} from "./extensions/SlashCommand";
import type { SlashCommandItem } from "@/types/editor";
import { cn } from "@/lib/utils";

export function SlashCommandMenu() {
  const [state, setState] = useState<SlashCommandState>({ props: null });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeSlashMenu(setState), []);

  // Reset selection when items change
  useEffect(() => setSelectedIndex(0), [state.props?.items]);

  // Keyboard navigation forwarded from the Tiptap extension
  useEffect(() => {
    const handler = (e: Event) => {
      const key = (e as CustomEvent<string>).detail;
      const items: SlashCommandItem[] = state.props?.items ?? SLASH_COMMANDS;
      if (key === "ArrowUp") {
        setSelectedIndex((i) => (i <= 0 ? items.length - 1 : i - 1));
      } else if (key === "ArrowDown") {
        setSelectedIndex((i) => (i >= items.length - 1 ? 0 : i + 1));
      } else if (key === "Enter") {
        const item = items[selectedIndex];
        if (item && state.props) {
          state.props.command(item);
        }
      } else if (key === "Escape") {
        state.props?.editor.commands.focus();
      }
    };
    document.addEventListener("slashMenuKeydown", handler);
    return () => document.removeEventListener("slashMenuKeydown", handler);
  }, [state.props, selectedIndex]);

  if (!state.props) return null;

  const { clientRect } = state.props;
  const rect = clientRect?.();
  if (!rect) return null;

  const items: SlashCommandItem[] = state.props.items ?? SLASH_COMMANDS;

  const style: React.CSSProperties = {
    position: "fixed",
    top: rect.bottom + 8,
    left: rect.left,
    zIndex: 9999,
  };

  return createPortal(
    <div
      ref={menuRef}
      style={style}
      className="w-64 rounded-lg border bg-white shadow-lg overflow-hidden"
      onMouseDown={(e) => e.preventDefault()}
    >
      {items.length === 0 ? (
        <p className="px-3 py-2 text-sm text-gray-500">No results</p>
      ) : (
        <ul className="py-1">
          {items.map((item, i) => (
            <li key={item.title}>
              <button
                className={cn(
                  "flex w-full items-start gap-3 px-3 py-2 text-left transition-colors",
                  i === selectedIndex
                    ? "bg-purple-50 text-purple-700"
                    : "hover:bg-gray-50"
                )}
                onMouseEnter={() => setSelectedIndex(i)}
                onClick={() => {
                  if (state.props) state.props.command(item);
                }}
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded border bg-white text-sm font-medium">
                  {item.icon}
                </span>
                <span>
                  <span className="block text-sm font-medium">{item.title}</span>
                  <span className="block text-xs text-gray-500">
                    {item.description}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>,
    document.body
  );
}
