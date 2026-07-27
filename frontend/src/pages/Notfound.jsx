import { Link } from "react-router-dom";
// Link is a component from the react-router-dom library that allows navigation between different pages in a React application without causing a full page reload. It is used to create links that enable users to navigate to different routes defined in the application.

export default function NotFound() 
// The NotFound component is a React functional component that displays a 404 error page when a user navigates to a route that does not exist in the application. It provides a message indicating that the requested page was not found and includes a link for the user to return to the dashboard. This component enhances the user experience by providing clear feedback when an invalid URL is accessed, guiding users back to a valid part of the application.
{
  return (
    <div className="text-center py-24">
      {/* This is the container for the whole page. */}
      <div className="text-[10px] font-display tracking-widest text-muted-foreground mb-2">ERROR 404</div>
      {/* displays error 404 small label above ehading */}
      <h1 className="text-3xl font-bold tracking-tight mb-2">Page not found</h1>
      <p className="text-sm text-muted-foreground mb-6">That ticker doesn't exist in our terminal.</p>
      <Link to="/" className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">Back to dashboard</Link>
    </div>
  );
}
