/**
 * In-site replacements for window.confirm / alert / prompt.
 * The browser's native dialogs look foreign ("orma-silver.vercel.app says"), differ per browser and
 * are awkward on phones. <DialogHost /> (mounted once in the root layout) renders branded modals;
 * these helpers can be called from anywhere, including non-React code. If the host is not mounted
 * (e.g. during SSR) they fall back to the native dialog so an action is never silently skipped.
 */
export interface DialogOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  placeholder?: string;
}

export type DialogRequest =
  | ({ kind: "confirm"; message: string; resolve: (v: boolean) => void } & DialogOptions)
  | ({ kind: "alert"; message: string; resolve: () => void } & DialogOptions)
  | ({ kind: "prompt"; message: string; defaultValue: string; resolve: (v: string | null) => void } & DialogOptions);

let handler: ((r: DialogRequest) => void) | null = null;

export function registerDialogHandler(h: (r: DialogRequest) => void) {
  handler = h;
  return () => {
    if (handler === h) handler = null;
  };
}

export function confirmDialog(message: string, opts: DialogOptions = {}): Promise<boolean> {
  if (!handler) return Promise.resolve(typeof window !== "undefined" ? window.confirm(message) : false);
  return new Promise((resolve) => handler!({ kind: "confirm", message, resolve, ...opts }));
}

export function alertDialog(message: string, opts: DialogOptions = {}): Promise<void> {
  if (!handler) {
    if (typeof window !== "undefined") window.alert(message);
    return Promise.resolve();
  }
  return new Promise((resolve) => handler!({ kind: "alert", message, resolve, ...opts }));
}

export function promptDialog(message: string, defaultValue = "", opts: DialogOptions = {}): Promise<string | null> {
  if (!handler) return Promise.resolve(typeof window !== "undefined" ? window.prompt(message, defaultValue) : null);
  return new Promise((resolve) => handler!({ kind: "prompt", message, defaultValue, resolve, ...opts }));
}
