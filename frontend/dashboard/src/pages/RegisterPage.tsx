import { useState } from "react";
import { registerSeller, loginSeller } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode = "login" | "register";

interface Props {
  onLogin: (id: string, widgetId: string, shopName: string) => void;
}

export default function RegisterPage({ onLogin }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState({ name: "", shop_name: "", email: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const seller = mode === "login"
        ? await loginSeller(form.email)
        : await registerSeller(form);
      onLogin(seller.id, seller.widget_id, seller.shop_name);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">shop-rag</CardTitle>
          <p className="text-sm text-muted-foreground">이커머스 AI 챗봇 플랫폼</p>
        </CardHeader>
        <CardContent>
          <div className="flex mb-6 border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === "login" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === "register" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              회원가입
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium">이름</label>
                  <Input
                    placeholder="홍길동"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">상호명</label>
                  <Input
                    placeholder="홍길동 쇼핑몰"
                    value={form.shop_name}
                    onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
                    required
                  />
                </div>
              </>
            )}
            <div className="space-y-1">
              <label className="text-sm font-medium">이메일</label>
              <Input
                type="email"
                placeholder="hello@shop.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? mode === "login" ? "로그인 중..." : "등록 중..."
                : mode === "login" ? "로그인" : "시작하기"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
