// Admin-side image helpers: compress in the browser, upload to Supabase Storage, return a public URL.
import { getAdminAuthHeaders } from "@/lib/clientAdmin";

// Uploads a (already compressed) image to Supabase Storage and returns its public URL, so the
// database only ever stores a short link instead of ~100KB of base64. Falls back to the inline
// data URL if the upload fails; the server then moves it to storage when the form is saved.
export const uploadImageToStorage = async (dataUrl: string): Promise<string> => {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const form = new FormData();
    form.append("file", new File([blob], "image.jpg", { type: blob.type || "image/jpeg" }));
    form.append("type", "product");
    const headers = getAdminAuthHeaders();
    delete headers["Content-Type"]; // let the browser set the multipart boundary
    const res = await fetch("/api/upload", { method: "POST", headers, body: form });
    const data = await res.json().catch(() => ({}));
    if (res.ok && typeof data.url === "string" && data.url) return data.url;
  } catch {}
  return dataUrl;
};

// Fast Client-Side Image Compression & Reader (100% resilient on Vercel, localhost & mobile)
export const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
          uploadImageToStorage(dataUrl).then(resolve);
        } else {
          resolve((e.target?.result as string) || "");
        }
      };
      img.onerror = () => resolve((e.target?.result as string) || "");
      img.src = (e.target?.result as string) || "";
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
};
