import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerSeller } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", shop_name: "", email: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const seller = await registerSeller(form);
      localStorage.setItem("seller_id", seller.id);
      localStorage.setItem("widget_id", seller.widget_id);
      localStorage.setItem("shop_name", seller.shop_name);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "등록 중 오류가 발생했습니다.");
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
          <form onSubmit={handleSubmit} className="space-y-4">
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
              {loading ? "등록 중..." : "시작하기"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
