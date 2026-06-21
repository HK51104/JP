import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <div className="text-[10px] font-display tracking-widest text-muted-foreground mb-2">ERROR 404</div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Page not found</h1>
      <p className="text-sm text-muted-foreground mb-6">That ticker doesn't exist in our terminal.</p>
      <Link to="/" className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">Back to dashboard</Link>
    </div>
  );
}
