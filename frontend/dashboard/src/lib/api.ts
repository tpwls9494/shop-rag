import axios from "axios";

const api = axios.create({ baseURL: (import.meta.env.VITE_API_URL ?? "") + "/api" });

export interface Seller {
  id: string;
  name: string;
  shop_name: string;
  email: string;
  widget_id: string;
  created_at: string;
}

export interface Document {
  id: string;
  seller_id: string;
  filename: string | null;
  doc_type: string;
  status: string;
  created_at: string;
}

export const registerSeller = (data: { name: string; shop_name: string; email: string }) =>
  api.post<Seller>("/seller/register", data).then((r) => r.data);

export const getDocuments = (seller_id: string) =>
  api.get<Document[]>(`/documents/${seller_id}`).then((r) => r.data);

export const uploadFile = (seller_id: string, file: File) => {
  const form = new FormData();
  form.append("seller_id", seller_id);
  form.append("file", file);
  return api.post<Document>("/documents/upload", form).then((r) => r.data);
};

export const uploadUrl = (seller_id: string, url: string) =>
  api.post<Document>("/documents/url", { seller_id, url }).then((r) => r.data);

export const uploadFaq = (seller_id: string, question: string, answer: string) =>
  api.post<Document>("/documents/faq", { seller_id, question, answer }).then((r) => r.data);

export const deleteDocument = (doc_id: string) =>
  api.delete(`/documents/${doc_id}`);
