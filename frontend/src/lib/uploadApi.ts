import api from "./api";
import type { MediaUploadResponse } from "@/types/api";

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<MediaUploadResponse>("/uploads/images/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
}
