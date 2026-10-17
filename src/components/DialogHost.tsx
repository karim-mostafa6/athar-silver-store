"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Info, MessageSquareText } from "lucide-react";
import { registerDialogHandler, type DialogRequest } from "@/lib/dialog";

export function DialogHost() {
  const [queue, setQueue] = useState<DialogRequest[]>([]);
  const [text, setText] = useState("");
  const confirmRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const current = queue[0];

  useEffect(
    () =>
      registerDialogHandler((r) => {
        setQueue((q) => [...q, r]);
      }),
    []
  );

  useEffect(() => {
    if (!current) return;
    setText(current.kind === "prompt" ? current.defaultValue : "");
    const t = setTimeout(() => (current.kind === "prompt" ? inputRef.current : confirmRef.current)?.focus(), 30);
    return () => clearTimeout(t);
  }, [current]);

  const close = useCallback(
    (result: "ok" | "cancel") => {
      if (!current) return;
      if (current.kind === "confirm") current.resolve(result === "ok");
      else if (current.kind === "alert") current.resolve();
      else current.resolve(result === "ok" ? text : null);
      setQueue((q) => q.slice(1));
    },
    [current, text]
  );

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close("cancel");
      } else if (e.key === "Enter" && !(current.kind === "prompt" && e.shiftKey) && document.activeElement?.tagName !== "BUTTON") {
        e.preventDefault();
        close("ok");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, close]);

  if (!current) return null;

  const danger = current.kind === "confirm" && current.danger;
  const Icon = danger ? AlertTriangle : current.kind === "prompt" ? MessageSquareText : Info;
  const title =
    current.title || (danger ? "تأكيد الحذف" : current.kind === "alert" ? "تنبيه" : current.kind === "prompt" ? "اكتب هنا" : "تأكيد الإجراء");

  return (
    <div
      role="dialog"
      aria-modal="true"
      dir="rtl"
      onClick={() => close("cancel")}
      className="fixed inset-0 z-[100000] flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-[2px] p-0 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-[#F5F0E7] border border-[#d8c8b4] shadow-2xl rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 font-cairo text-right"
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-start gap-3">
          <span
            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              danger ? "bg-rose-100 text-rose-700" : "bg-[#ece2d1] text-[#8c6f4a]"
            }`}
          >
            <Icon className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-[#292722] leading-7">{title}</h3>
            <p className="mt-1 text-sm text-[#524436] leading-7 whitespace-pre-line break-words">{current.message}</p>
          </div>
        </div>

        {current.kind === "prompt" && (
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={current.placeholder || ""}
            rows={3}
            className="mt-4 w-full bg-white border border-[#ded2c0] rounded-xl px-3 py-2.5 text-sm text-[#292722] focus:outline-none focus:border-[#c5a880] resize-none"
          />
        )}

        <div className={`mt-5 flex gap-2.5 ${current.kind === "alert" ? "" : "flex-row-reverse"}`}>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => close("ok")}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${
              danger ? "bg-rose-700 hover:bg-rose-800 text-white" : "bg-[#292722] hover:bg-[#3a352f] text-[#F5F0E7]"
            }`}
          >
            {current.confirmText || (danger ? "احذف" : current.kind === "alert" ? "تمام" : "تأكيد")}
          </button>
          {current.kind !== "alert" && (
            <button
              type="button"
              onClick={() => close("cancel")}
              className="flex-1 py-3 rounded-xl text-sm font-bold bg-white border border-[#ded2c0] text-[#292722] hover:bg-[#f7f1e8] transition-colors"
            >
              {current.cancelText || "إلغاء"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
