import { AlertTriangle } from "lucide-react";
// AlertTriangle This is the name of a React component provided by the lucide-react library. and React will draw a warning triangle icon.
// "lucide-react" This is the name of the installed npm package (library).
import { API_BASE } from "../api";
// API_BASE stores your backend's base URL.

export default function ApiError({ error }) {
  // default Means:"This is the main thing this file exports." So another file can import this function wihtput using {} for specifying what to import 
  // This is the name of the function. Since it starts with a capital letter, React knows:"This is a React Component." Later you can use it like: <ApiError />
  // function ApiError({ error }) means:"Take the "object" React gives me and immediately extract its "error property" into a variable called error."
  return (
    // When another component (like Dashboard) detects that the API request failed, instead of trying to display products, it renders the ApiError component and passes the error object into it. The ApiError component receives that error object, builds a nicely styled error card, displays a warning triangle icon, tells the user that the backend couldn't be reached, shows which backend URL (API_BASE) it tried to connect to, gives troubleshooting instructions (such as making sure the FastAPI server is running and CORS is configured correctly), and finally, if the error object actually contains an error message, it displays that message at the bottom of the card. In short, this component exists only to display a user-friendly error screen whenever your frontend cannot communicate with the backend.
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
            // pre is a built-in HTML tag.
            // pre is a block-level element that preserves whitespace and line breaks, and uses a monospace font.
            // whitespace-pre-wrap means:"Preserve whitespace and line breaks, but wrap long lines."
          )}
        </div>
      </div>
    </div>
  );
}
