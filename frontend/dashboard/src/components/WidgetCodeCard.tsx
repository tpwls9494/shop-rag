import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function WidgetCodeCard({ widgetId }: { widgetId: string }) {
  const [copied, setCopied] = useState(false);
  const code = `<script src="http://localhost:8000/widget.js" data-id="${widgetId}"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">위젯 코드</CardTitle>
        <p className="text-sm text-muted-foreground">아래 코드를 쇼핑몰 HTML에 붙여넣으세요.</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono truncate">
            {code}
          </code>
          <Button variant="outline" size="icon" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
