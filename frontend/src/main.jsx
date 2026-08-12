/*
Conclusion of main.jsx:
  main.jsx is the entry point of the React application.
  It creates the React application using ReactDOM.createRoot() and attaches it to the <div id="root"> from index.html.
  It loads the root component (<App />) along with global styles, routing, and any providers (if present).
  From this point onward, React controls the entire UI.
*/

import { SpeedInsights } from "@vercel/speed-insights/react";
import React from "react";
// Import the React library.
import ReactDOM from "react-dom/client";
// Import the library that connects React to the browser's DOM.
import { BrowserRouter } from "react-router-dom";
// Import React Router.
import App from "./App";

import "./index.css";
/* Its job is to manage pages like

// /

// /products

// /watchlist

// /alerts

// without refreshing the browser. It does this by using the History API to manipulate the URL and render the appropriate components based on the current route.
import App from "./App.jsx";
// Import your main application component.
// Import the main CSS file for styling.
*/

ReactDOM.createRoot(document.getElementById("root")).render(
  // ReactDOM.createRoot() ==Create a React root.
  // document.getElementById("root") == Get the HTML element with the ID "root" from the DOM(index.html).
  // This div belongs to me now.
  // render() == Render the React application into the root element.
  <React.StrictMode>
    {/* Run extra development checks.It helps find:bugs,unsafe code,deprecated APIs,It does not appear on the webpage. */}
    <BrowserRouter>
    {/* Enable routing.
    everything inside it can use 
    <Link>
    <Route>
    useNavigate()
    useParams() 
    */}
        <App />
        {/* react calls app() function */}
        </BrowserRouter>
      <SpeedInsights />
  </React.StrictMode>
);

