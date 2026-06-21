import { AlertTriangle } from "lucide-react";
import { API_BASE } from "../api";

export default function ApiError({ error }) {
  return (
    <div className="bg-card border border-down/40 rounded-md p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="size-5 text-down shrink-0 mt-0.5" />
        <div className="text-sm">
          <div className="font-semibold mb-1">Couldn't reach the backend</div>
          <div className="text-muted-foreground mb-2">
            Tried <span className="font-mono">{API_BASE}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Make sure your FastAPI server is running (<span className="font-mono">uvicorn main:app --reload</span>)
            and CORS allows this origin. Override the URL by setting{" "}
            <span className="font-mono">VITE_API_BASE_URL</span> in <span className="font-mono">.env</span>.
          </div>
          {error?.message && (
            <pre className="mt-3 text-[11px] font-mono text-down/80 whitespace-pre-wrap">{error.message}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
