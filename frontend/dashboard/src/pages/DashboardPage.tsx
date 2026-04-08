import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getDocuments } from "@/lib/api";
import WidgetCodeCard from "@/components/WidgetCodeCard";
import DocumentUpload from "@/components/DocumentUpload";
import DocumentTable from "@/components/DocumentTable";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const sellerId = localStorage.getItem("seller_id") ?? "";
  const widgetId = localStorage.getItem("widget_id") ?? "";
  const shopName = localStorage.getItem("shop_name") ?? "";

  const { data: documents = [] } = useQuery({
    queryKey: ["documents", sellerId],
    queryFn: () => getDocuments(sellerId),
    refetchInterval: 5000,
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["documents", sellerId] });

  return (
    <div className="min-h-screen bg-muted/40">
      {/* 헤더 */}
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-semibold">shop-rag</h1>
          <p className="text-sm text-muted-foreground">안녕하세요, {shopName} 님</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          로그아웃
        </Button>
      </header>

      {/* 본문 */}
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <WidgetCodeCard widgetId={widgetId} />
        <DocumentUpload sellerId={sellerId} onUploaded={refresh} />
        <DocumentTable documents={documents} onDeleted={refresh} />
      </main>
    </div>
  );
}
