/*
Dashboard.jsx — Conclusion
  1. Fetches data from the backend)The very first thing it does is fetch all products.
  2. Handles Loading & Errors  
  3. Creates derived data The backend only sends raw products.Dashboard creates extra information from those products.
  4.uses reusable components
  5.Renders sections)The page is basically divided into blocks.
  Dashboard
│
├── Heading
│
├── Statistics Cards
│
├── Category Average Grid
│
├── Top Movers
│
└── Browse Categories
  6. Uses map() everywhere
  7. Uses conditional rendering
  8. Uses Links instead of <a>
  9. Uses reusable utility functions(moved to api.js forlogic rather than writing it here)

*/




import { Link } from "react-router-dom";
// Link is a React component provided by the react-router-dom library. It allows you to create links that navigate to different routes in your application without causing a full page reload.
import { ArrowDownRight, ArrowUpRight, Boxes, Layers, Activity, Clock } from "lucide-react";
// ArrowDownRight, ArrowUpRight, Boxes, Layers, Activity, Clock are React components provided by the lucide-react library. They render various icons that can be used in your application.
import { api, useApi, computeCategoryAverages, computeTopMovers } from "../api";
// api, useApi, computeCategoryAverages, computeTopMovers are imported from the ../api module
import ApiError from "../components/APIerror";
// ApiError is a React component that displays an error message when the API request fails. It is imported from the ../components/APIerror module.

function Stat({ icon: Icon, label, value, sub }) 
// Create a React component named Stat. React passes it a props object. Extract the properties icon, label, value, and sub from that object, but rename icon to Icon so it can be used as a React component inside this function.
{
  // Stat Since it starts with a capital letter, React treats it as a React component.
  // {...}This is object destructuring.React passes one object (called props) into every component.whenever Stat will be passed anywhere together evveryhting mentioned in the paramaters bracket will be passed as 1 object called props.
  // icon:Icon Take the property named icon from the object and rename it to a local variable named Icon.
  // reusable card 
  return (
    <div className="bg-card border border-border rounded-md p-5">
      {/* This <div> is the entire card. */}
      {/* This is a React JSX div element with Tailwind CSS classes.*/}
      {/* bg-card React is NOT directly knowing any color. bg-card = “use the app’s standard card background color from the theme system” mentioned in index.css .root --card*/}
      {/* border = outline around an element */}
      {/* border-border =“Apply the border color defined in the theme under the name border”*/}
      {/* rounded-md = medium curve rounded corners */}
      {/* p-5 = padding (20px) on all sides */}
      <div className="flex items-center justify-between mb-3">
        {/* This is the header row of the card. */}
        {/* It contains two things:
        <span>{label}</span>
        <Icon />
        So this <div> says Put these two things in one horizontal row. */}
        {/* flex = turn this div into a flexible layout row system */}
        {/* items-center = vertically center the items in the flex row 
        (items = vertical alignment) (center = middle)*/}
        {/* justify-between = horizontally space the items in the flex row
        (justify = horizontal alignment) (between = push items apart) */}
        {/* mb-3 = margin-bottom (12px) */}
        <span className="text-[10px] font-display tracking-widest text-muted-foreground">
          {/* Create a small inline text element, style it with a 10px muted display font with wide letter spacing, and show whatever value is stored in label. */}
          {/*span = inline text container*/}
          {/* text-[10px] = font size 10px */}
          {/* font-display = display specific font */}
          {/* tracking-widest = widest letter spacing (tracking= letter spacing) */}
          {/* text-muted-foreground = apply the muted foreground color from the theme */}
          {label}
          {/* {label} = dynamic value from props */}
        </span>
        <Icon className="size-4 text-muted-foreground" />
        {/* Render whichever icon component was passed into Stat (such as Boxes, Clock, or Activity) and style it with a 16×16 size and the muted foreground color. */}
        {/* <Icon className="size-4 text-muted-foreground" /> */}
        {/* size = width + height 4 means 16px */}
        {/* text-muted-foreground = apply the muted foreground color from the theme */}
      </div>
      <div className="font-display text-3xl font-bold tracking-tight">{value}</div>
      {/* This displays the main value. */}
      {/* font-display = custom font style from your theme */}
      {/*  tracking = letter spacing tight = less spacing*/}
      {/* {value} = dynamic data from props */}
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      {/* This displays the subtitle. */}
      {/* text-xs = small font size */}
      {/* text-muted-foreground = apply the muted foreground color from the theme */}
      {/* mt-1 = margin-top (4px) */}
    </div>
  );
}

export default function Dashboard() 
// It fetches product data from the backend, prepares useful summaries from that data, and displays the homepage of your plastic price tracker.
// Create a function named Dashboard
// export = make this function available outside this file
// default = main export of this file
{
  const { data: products, error, loading } = useApi(() => api.products(), []);
  // const { data: products, error, loading } "Take data, error, and loading from an object, and rename data to products."
  // = useApi(() => api.products(), []); "Call useApi to fetch the products once, and return the result."
  // () => api.products() means "When you're ready, fetch the products." "When someone calls me, I will run api.products()."
  // [] means "Do this only once when the page first loads."
  // data new name products = rename data to products
  // error = error from the API call
  // loading = loading state of the API call
   /*
    const { data: products, error, loading }
    means:
    “Take an object and extract:
    data (rename it to products)
    error
    loading”
    */
  /*
  useApi = custom React hook (a reusable function)
  */
/*
() => api.products()=“When useApi decides to run, call api.products()”
*/
/*
[] (empty array)
dependency array

Meaning:

“Run this API call only once when component loads”
*/
  if (loading)
    {
       return <div className="text-sm text-muted-foreground">Loading market overview…</div>;
    }
  // If loading is true, return a div with the text "Loading market overview…"
  // text-sm = small font size
  // text-muted-foreground = apply the muted foreground color from the theme
  if (error) 
    {
       return <ApiError error={error} />;
      //  Instead of showing the normal page, render the ApiError component and give it the error object so it can display a proper error screen to the user.
    }
    //  "<" This tells React:"A React component is starting."

  // If error is true, return the ApiError component with the error prop set to the error object
  // text-sm = small font size
  // text-muted-foreground = apply the muted foreground color from the theme

  const list = products || [];
  // Use the products array if it exists; otherwise use an empty array so the rest of the code can safely work with an array without crashing.
  // If products is not null or undefined, set list to products, otherwise set list to an empty array
  const avgs = computeCategoryAverages(list);
  // Call computeCategoryAverages() with the product list, and store the returned array of category summary objects in the variable avgs.
  // computeCategoryAverages(list) = call the function computeCategoryAverages with the list of products as an argument
  const movers = computeTopMovers(list);
  // Call computeTopMovers() with the product list, and store the returned object containing gainers and losers in the variable movers.
  // "Use the products array if it exists; otherwise use an empty array so the app doesn't crash."

  const categories = [...new Set(list.map((p) => p.category))];
  // "Take all product categories, remove duplicates, and store the unique categories in an array."
  // [ ] = create a new array
  // new Set() = create a new Set object (a collection of unique values)
  // list.map((p) => p.category) = create a new array of product categories from the list of products
  // ... = spread operator, which takes the values from the Set and puts them into the new array 
  const today = new Date().toISOString().slice(0, 10);
  // "Get the current date in ISO format (YYYY-MM-DD) and slice it to get only the date part."
  // new Date() = create a new Date object with the current date and time 
  // toISOString() = convert the Date object to a string in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)
  // slice(0, 10) = get the first 10 characters of the string (YYYY-MM-DD)
  const updatedToday = list.filter((p) => (p.lastUpdated || "").startsWith(today)).length;
  // "Count how many products were updated today."
  // list.filter((p) => (p.lastUpdated || "").startsWith(today)) = create a new array of products that were updated today
  // (p.lastUpdated || "") = if p.lastUpdated is null or undefined, use an empty string instead
  // startsWith(today) = check if the lastUpdated string starts with today's date
  // .length = get the number of products in the new array
  const avgChange = list.length
  // "Calculate the average change percentage of all products."
  // list.length = get the number of products in the list
    ? list.reduce((a, p) => a + p.changePct, 0) / list.length
    // If there are products in the list, calculate the average change percentage by summing up all changePct values and dividing by the number of products.
    : 0;
    // If there are no products in the list, set avgChange to 0.

  return (
    // Return the JSX to render the dashboard
    <>
    {/* Market Overview */}
      <div className="mb-8">
        {/* Hold the page title and subtitle. */}
        {/* mb-8 means margin-bottom: 2rem (8 tailwind unit) */}
        <h1 className="text-2xl font-bold tracking-tight mb-1 text-foreground">Market Overview</h1>
        {/* text-sm = small text size, text-muted-foreground = muted foreground color tracking tight spacing between words  */}
        <p className="text-sm text-muted-foreground">Indicative spot prices for primary polymer grades — India market.</p>
        {/* text-sm = small text size  text-muted-foreground = muted foreground color */}
      </div>

        {/* Market Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* This is the Statistics section. */}
        {/* grid means a responsive grid layout */}
        {/* grid-cols-2 = 2 columns on small screens */}
        {/* gap-4 = gap of 1rem (4 tailwind units) between grid items */}
        {/* mb-8 = margin-bottom of 2rem (8 tailwind units) */}
        <Stat icon={Boxes} label="TOTAL PRODUCTS" value={String(list.length)} sub="Active grades tracked" />
        {/* Stat component for displaying material count */}
        {/* icon = prop name Boxes = value being passed  */}
        {/* label = title shown at top */}
        {/* value = main value to display */}
        {/* list.length converted into text Because UI text is often rendered as strings. */}
        {/* sub = subtitle shown below the main value */}
        <Stat icon={Layers} label="MATERIALS" value={String(categories.length)} sub="Resin categories" />
        <Stat icon={Clock} label="UPDATED TODAY" value={String(updatedToday)} sub="In the last 24h" />
        <Stat icon={Activity} label="MARKET TREND" value={`${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}%`} sub="Avg. 24h change" />
          {/* ` `=template string   */}
          {/* ${...}="Run JavaScript here and insert the result." */}
          {/* avgChange >= 0 ? "+" : "" == if avgChange is positive, display a plus sign */}
          {/* avgChange.toFixed(2) = format the average change to 2 decimal places */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* This is the big middle section. */}
        {/* Inside it are two boxes */}
        {/* grid-cols-1 = 1 column on small screens */}
        {/* lg:grid-cols-3 = 3 columns on large screens */}
        {/* gap-6 = gap of 1.5rem (6 tailwind units) between grid items */}

        <div className="lg:col-span-2 bg-card border border-border rounded-md">
          {/* This is the Category Averages card. */}
          {/* lg:col-span-2 = span 2 columns on large screens */}
          <div className="px-5 py-4 border-b border-border flex justify-between items-center">
            {/* Header of the Category Averages card */}
            {/* px-5 = padding-left and padding-right of 1.25rem (5 tailwind units) */}
            {/* py-4 = padding-top and padding-bottom of 1rem (4 tailwind units) */}
            {/* flex justify-between items-center = align items horizontally and vertically */}
            <h2 className="text-sm font-semibold tracking-tight">Category Averages</h2>
            {/* font-semibold = bold font */}

            <Link to="/products" className="text-[11px] font-display text-primary hover:underline">VIEW ALL →</Link>
            {/* Link to the products page */}
            {/* <Link = Move between pages without reloading the website. */}
            {/* to="/products" == When clicked, go to /products */}
            {/* className = Styling for the link */}
            {/* text-primary = Primary theme color */}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-border">
            {/* Grid that displays all category average cards */}
            {/*  = Grid Normally:Elements appear one below another.With:grid They are arranged in rows and columns. */}
            {/* grid-cols-2 Create 2 columns */}
            {/* md:grid-cols-4 = 4 columns on medium screens (Usually:≥ 768px)*/}
            {/* divide-x = add a vertical line between columns */}
            {/* divide-y = add a horizontal line between rows */}
            {/* divide-border = use the border color for the dividing lines */}
            {avgs.map((c) => (
              // { Means: Start JavaScript inside JSX
              // map() is an array method Meaning:Go through every item in the array.
              // => ( it means:Automatically return this JSX.
              // avgs.map((c) => ( = For each category average in the avgs array, do the following:
              // c = current category average object
              
              <Link key={c.category} to={`/products?category=${c.category}`} className="p-4 hover:bg-accent/50 transition-colors group">
                {/* Each Link is ONE CATEGORY CARD */}
                {/* key Unique identifier for each item in a list. */}
                {/* /50==>opacity */}
                {/* group means:"Mark this element as a parent so its children can change their appearance when the parent is hovered, focused, or in other group states." */}
                <div className="text-[10px] font-display tracking-widest text-muted-foreground">{c.category}</div>
                <div className="font-display text-xl font-bold mt-1">₹{c.avg}</div>
                {/* mt=margin-top */}
                <div className={`text-xs mt-1 flex items-center gap-1 ${c.change > 0 ? "text-up" : c.change < 0 ? "text-down" : "text-muted-foreground"}`}>
                  {c.change > 0 ? <ArrowUpRight className="size-3" /> : c.change < 0 ? <ArrowDownRight className="size-3" /> : null}
                  {c.change > 0 ? "+" : ""}{c.change}%
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-md">
          {/* This is the Top Movers card. */}
          <div className="px-5 py-4 border-b border-border">
            {/* header of top movers */}
            <h2 className="text-sm font-semibold tracking-tight">Top Movers</h2>
          </div>
          <div className="p-2">
            {/* Gainers section (body of top movers) */}
            <div className="text-[10px] font-display tracking-widest text-up px-3 pt-2 pb-1">▲ GAINERS</div>
            {/* Only for heading */}
            {movers.gainers.map((p) => (
              <Link key={p.id} to={`/products/${p.id}`} className="flex items-center justify-between px-3 py-2 rounded hover:bg-accent text-sm">
                <span className="truncate">{p.name} <span className="text-muted-foreground font-mono text-xs">{p.grade}</span></span>
                <span className="text-up font-display text-xs">{p.changePct >= 0 ? "+" : ""}{p.changePct}%</span>
              </Link>
            ))}
            <div className="text-[10px] font-display tracking-widest text-down px-3 pt-3 pb-1">▼ LOSERS</div>
            {/* Losers section (body of top movers) */}
            {movers.losers.map((p) => (
              <Link key={p.id} to={`/products/${p.id}`} className="flex items-center justify-between px-3 py-2 rounded hover:bg-accent text-sm">
                {/* When the mouse hovers over this element, change its background to the theme's "accent" color. */}
                <span className="truncate">{p.name} <span className="text-muted-foreground font-mono text-xs">{p.grade}</span></span>
                {/* Create a small inline text element, style it with a 10px muted display font with wide letter spacing, and show whatever value is stored in label. */}
                {/* truncate means if the text is too long, cut it off and show ... (three dots). */}
                {/* text-muted-foreground = light gray text color(comes from "muted-foreground") */}
                {/* font-mono = monospaced font(everyone gets the same amount of space.) */}
                <span className="text-down font-display text-xs">{p.changePct}%</span>
                {/* text-down 
                text = text color
                down = custom color name (down is a custom class defined in your project.) */}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-md">
        {/* This is the Browse by Category card. */}
        <div className="px-5 py-4 border-b border-border flex justify-between items-center">
          {/* Header of the Browse by Category card */}
          <h2 className="text-sm font-semibold tracking-tight">Browse by Category</h2>
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {/* Grid that displays all category boxes */}
          {categories.map((c) => (
            <Link
              key={c}
              to={`/products?category=${c}`}
              className="px-4 py-2 border border-border rounded-md text-sm font-display hover:border-primary hover:text-primary transition-colors"
              // transition-colors = smooth color change when hovering
            >
              {c}
            </Link>
          ))}
        </div>  
      </div>
    </>
  );
}
