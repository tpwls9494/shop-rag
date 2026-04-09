import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uploadFile, uploadUrl, uploadFaq } from "@/lib/api";

interface Props {
  sellerId: string;
  onUploaded: () => void;
}

export default function DocumentUpload({ sellerId, onUploaded }: Props) {
  const [tab, setTab] = useState<"file" | "url" | "faq">("file");
  const [url, setUrl] = useState("");
  const [faq, setFaq] = useState({ question: "", answer: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const wrap = async (fn: () => Promise<unknown>) => {
    setError("");
    setLoading(true);
    try {
      await fn();
      onUploaded();
    } catch (e: any) {
      setError(e.response?.data?.detail ?? "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) wrap(() => uploadFile(sellerId, file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) wrap(() => uploadFile(sellerId, file));
  };

  const tabs = [
    { key: "file", label: "파일 업로드" },
    { key: "url", label: "URL" },
    { key: "faq", label: "FAQ" },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">지식 베이스</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 탭 */}
        <div className="flex gap-1 rounded-md bg-muted p-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded px-3 py-1 text-sm transition-colors ${
                tab === t.key ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 파일 업로드 탭 */}
        {tab === "file" && (
          <div
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 p-10 cursor-pointer hover:border-primary/50 transition-colors"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">PDF / TXT 파일을 끌어다 놓거나 클릭하세요</p>
            <input ref={fileRef} type="file" accept=".pdf,.txt" className="hidden" onChange={handleFileChange} />
          </div>
        )}

        {/* URL 탭 */}
        {tab === "url" && (
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/policy"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button
              onClick={() => wrap(() => uploadUrl(sellerId, url).then(() => setUrl("")))}
              disabled={loading || !url}
            >
              크롤링
            </Button>
          </div>
        )}

        {/* FAQ 탭 */}
        {tab === "faq" && (
          <div className="space-y-2">
            <div className="space-y-1">
              <Input
                placeholder="질문 (최대 200자)"
                value={faq.question}
                maxLength={200}
                onChange={(e) => setFaq({ ...faq, question: e.target.value })}
              />
              <p className="text-xs text-muted-foreground text-right">{faq.question.length} / 200</p>
            </div>
            <Textarea
              placeholder="답변"
              value={faq.answer}
              onChange={(e) => setFaq({ ...faq, answer: e.target.value })}
            />
            <Button
              onClick={() =>
                wrap(() =>
                  uploadFaq(sellerId, faq.question, faq.answer).then(() =>
                    setFaq({ question: "", answer: "" })
                  )
                )
              }
              disabled={loading || !faq.question || !faq.answer}
            >
              추가
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
        {loading && <p className="text-sm text-muted-foreground">처리 중...</p>}
      </CardContent>
    </Card>
  );
}
