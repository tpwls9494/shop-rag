import { Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteDocument, type Document } from "@/lib/api";

interface Props {
  documents: Document[];
  onDeleted: () => void;
}

const STATUS_MAP: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "default" }> = {
  done: { label: "완료", variant: "success" },
  processing: { label: "처리중", variant: "warning" },
  pending: { label: "대기중", variant: "default" },
  error: { label: "오류", variant: "destructive" },
};

const TYPE_MAP: Record<string, string> = {
  pdf: "PDF",
  text: "텍스트",
  url: "URL",
  faq: "FAQ",
};

export default function DocumentTable({ documents, onDeleted }: Props) {
  const handleDelete = async (id: string) => {
    await deleteDocument(id);
    onDeleted();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">문서 목록</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">업로드된 문서가 없습니다.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-2 text-left font-medium">파일명</th>
                <th className="pb-2 text-left font-medium">유형</th>
                <th className="pb-2 text-left font-medium">상태</th>
                <th className="pb-2 text-left font-medium">날짜</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => {
                const status = STATUS_MAP[doc.status] ?? { label: doc.status, variant: "default" as const };
                return (
                  <tr key={doc.id} className="border-b last:border-0">
                    <td className="py-2 max-w-[200px] truncate">
                      {doc.filename ?? (doc.doc_type === "faq" ? "FAQ" : "-")}
                    </td>
                    <td className="py-2">{TYPE_MAP[doc.doc_type] ?? doc.doc_type}</td>
                    <td className="py-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="py-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
