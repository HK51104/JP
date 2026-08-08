/*
Conclusion:
The api.js file acts as the communication layer between the frontend and the backend. It centralizes all API requests into reusable functions and provides the custom useApi hook to simplify data fetching, loading management, and error handling. By keeping API logic separate from UI components, the application becomes more modular, easier to maintain, and avoids code duplication. This approach allows React components to focus on rendering the interface while api.js handles all interactions with the backend efficiently and consistently.
*/



// Centralized API client for the Polymetric backend (FastAPI).
// Configure the base URL via VITE_API_BASE_URL (defaults to local dev server).
//
// Backend returns products shaped like:
//   { id, product_name, product_grade, current_price, last_updated, category }
// History items: { time, price }

import { useEffect, useState } from "react";
// useEffect is a built-in React Hook.Its job is:"Run some code after the component renders."
// useState is a built-in React Hook.Its job is:"Create a piece of state (memory) for this component."

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||"https://jp-pfin.onrender.com";
  // This is NOT the normal import keyword.
  // .meta contains information about your application.
  // .env Give me all environment variables.
  // ?. Optional Chaining. Only continue if the value exists.
  // .replace(...) Built-in String function.Meaning Replace part of the string.(we will only reach replace after optional chaining)
  // import.meta.env.VITE_API_BASE_URL "This is the environment variable that holds the base URL for the API."(usually  VITE_API_BASE_URL: "https://jp-pfin.onrender.com/")
  // /\/$/ This is a Regular Expression (Regex).
  // / starts regex
  // $ means End of the string
  // Create a variable named API_BASE. First try to read the backend URL from the environment variable VITE_API_BASE_URL. If it exists, remove any trailing / from the end. If it doesn't exist, fall back to https://jp-pfin.onrender.com/. Then export this variable so other files can use it.
  // ?.replace(/\/$/, "") "If the environment variable exists, remove any trailing slash from it."
  // || or  "https://jp-pfin.onrender.com/"

async function getJSON(path) 
// async means "This function will return a promise, and you can use await to wait for it to finish."
// path is the input parameter of the function getJSON. "Which URL should I go to?"
{
  const res = await fetch(`${API_BASE}${path}`);
  // const "Create a variable whose value will not be reassigned."
  // await "Wait for the fetch() promise to resolve, and then assign the result to res." "Wait here until the operation finishes."
  // fetch() is a built-in JavaScript function. "Send a request to a URL and get the response."
  // `${API_BASE}${path}` This creates the URL. That is the address where the request goes API_BASE is simply the base address of your backend server. endpoints can be many like /products , /about and stuff but API BASE is simple
  if (!res.ok)
    // ok is a property that comes from the browser's fetch() response.
    // It is true if the HTTP status code is in the 200-299 range, indicating a successful response. If the response is not ok, it means there was an error with the request, and we need to handle it accordingly.
    { 
      throw new Error(`${res.status} ${res.statusText} @ ${path}`);
      // throw "Something went wrong. Stop normal execution and report this error."
      // Error is a built-in JavaScript object used for representing problems. 
      /*
      It stores information like:
      what went wrong
      an error message
      where it happened
      */
    //  status is the HTTP status code.
    /*
    200 → Success
    404 → Not Found
    500 → Server Error
    */
  //  ${res.statusText} This is the readable version of the status.
  // @ ${path} "The error happened while accessing this path."
    }
  return res.json();
  // res.json() is a method that parses the response body as JSON and returns a promise that resolves to the parsed data. It allows us to work with the response data in a structured format (JavaScript object or array) instead of raw text.
  // Give the fetched data back to api.products()."
}

// ---------- Normalization ----------
// Map raw backend product → UI shape used throughout the app.
const KNOWN_CATEGORIES = ["PPCP", "PP", "HDPE", "LLDPE", "LDPE", "PVC", "PET", "ABS"];

function deriveCategory(p) 
// deriveCategory() makes sure every product ends up with a valid category—either by using the one the backend provided or by intelligently guessing it from the product name.
{
  if (p.category)
    {
      return p.category;
    }
  const name = (p.product_name || "").toUpperCase();
  // (p.product_name || "") "Use the product name if it exists; otherwise use an empty string."(avoid crashes)
  // toUpperCase() is a built-in JavaScript string function. "Convert all letters to uppercase."
  return KNOWN_CATEGORIES.find((c) => name.startsWith(c + " ") || name === c) || "OTHER";
  // KNOWN_CATEGORIES This is a user-defined array.
  // find() is a built-in JavaScript array method.Its job is:"Go through the array and return the FIRST item that matches the condition."
  // c means:One category at a time.
  // =>Means:"For each category, check this condition."
  // .startsWith() A built-in string method.Meaning:"Does this string begin with...?"
  // c + " " This means:"Take the category and add a space after it."
  // name === c Checks:"Is the entire name exactly equal to the category?"
  // || "OTHER" Suppose nothing matches then we name it OTHERS.
}

function deriveSupplier(p) 
{
  const parts = (p.product_name || "").trim().split(/\s+/);
  // (p.product_name || "") "Use the product name if it exists; otherwise use an empty string."(avoid crashes)
  // /\s+/ This is a regular expression (regex).("Split wherever there is one or more whitespace characters.")
  // Take the product name, safely handle missing values, remove extra spaces around it, split it into separate words, and store those words in an array called parts.
  return parts.slice(1).join(" ") || parts[0] || "—";
  // slice(1) "Take all the words except the first one."
  // join() combines the array back into one string.
  // || "If the left side is empty or doesn't exist, use the next one."
  // parts[0] This means:"Take the first word."
  // Return everything except the first word as one string; if that doesn't exist, return the first word; if even that doesn't exist, return a dash (—).
}

function splitGrade(productGrade) 
// It takes one raw grade string from the backend, safely separates it into a main grade and everything after it (MFI/details), cleans both values, and returns them in a neat object that the rest of your application can easily use.
{
  if (!productGrade)
    {
      return { grade: "—", mfi: "—" };
    } 
  const [grade, ...rest] = productGrade.split(" - ");
  // [ ] These square brackets mean array destructuring.Destructuring simply means:"Take values out of an object or array and put them directly into variables."
  // grade This will receive the first item of the array.
  // ...This is called the rest operator.Meaning:"Take everything that's left."
  // rest This variable stores all the remaining items after the first one.
  // .split(" - ") tells split(): "Whenever you see ' - ', cut the string there."
  return { grade: grade.trim(), mfi: rest.join(" - ").trim() || "—" };
  // { } creates an object 
  // "grade:"This is the property name.The returned object will have a property called:grade
  // "grade" This is the variable you created earlier.
  // trim() is a built-in JavaScript string function."Remove spaces from the beginning and end of the text."
  // "," Means:"Now let's create the next property."
  // "mfi:" The second property of the object.
  // rest Remember:Its an array we met before 
  // join() is a built-in array method. It combines array items into one string.
  // "||"" This is the OR operator.Meaning:"If the left side is empty or false, use the right side."
  // "—" This is the fallback value.
}

export function normalizeProduct(p)
// normalizeProduct() takes one raw product from the backend, cleans and standardizes every field (renaming properties, converting data types, filling missing values, and extracting useful information), then returns a new object that the React application can safely and consistently use everywhere.
// export "Other files are allowed to use this function." 
// p is the input parameter of the function normalizeProduct. "This is the product object that we got from the backend."
{
  const { grade, mfi } = splitGrade(p.product_grade);
  // Take the current product's grade string, split it into grade and mfi using splitGrade(), and store those two values in separate variables.
  // { grade, mfi } This is called object destructuring. "Take an object and pull out the properties named grade and mfi."
  return {
    id: String(p.id),
    // id:This is the property name of the object you're returning.
    // String() is a built-in JavaScript function. "Convert the value inside the parentheses to a string."
    // ".id" "Go inside the product object and get its id."
    name: p.product_name,
    // name:This is the property name of the object you're returning.
    // p.product_name "Go inside the product object and get its product_name."
    supplier: deriveSupplier(p),
    // supplier:This is the property name of the object you're returning.
    // deriveSupplier(p) "Call the function deriveSupplier() and give it the current product object p."
    grade,
    // grade:This is the property name of the object you're returning.
    mfi,
    // mfi:This is the property name of the object you're returning.
    category: deriveCategory(p),
    // category:This is the property name of the object you're returning.
    // deriveCategory(p) "Call the function deriveCategory() and give it the current product object p."
    currentPrice: Number(p.current_price) || 0,
    // currentPrice:This is the property name of the object you're returning.
    // Number() is a built-in JavaScript function. "Convert the value inside the parentheses to a number."
    // p.current_price "Go inside the product object and get its current_price."
    // || 0 "If the left side is empty or false, use 0 instead."
    changePct: Number(p.change_pct ?? 0),
    // changePct:This is the property name of the object you're returning.
    // Number() is a built-in JavaScript function. "Convert the value inside the parentheses to a number."
    // p.change_pct "Go inside the product object and get its change_pct."
    // ?? 0 "If the left side is null or undefined, use 0 instead."(?? is called the Nullish Coalescing Operator.It means:"If the value on the left is null or undefined, use the value on the right.")
    lastUpdated: p.last_updated,
    // lastUpdated:This is the property name of the object you're returning.
    // p.last_updated "Go inside the product object and get its last_updated."
    location: p.location || "—",
    // location:This is the property name of the object you're returning.
    // p.location "Go inside the product object and get its location."
    // || "—" "If the left side is empty or false, use a dash (—) instead."
    datasheetUrl: p.datasheet_url || "#",
    // datasheetUrl:This is the property name of the object you're returning.
    // p.datasheet_url "Go inside the product object and get its datasheet_url."
    // || "#" "If the left side is empty or false, use a hash (#) instead."
  };
}

export function normalizeHistory(rows) 
// export "Other files are allowed to use this function." 
// normalizeHistory() converts messy backend history data into a clean, standardized array of { date, price } objects, removing any invalid records so the rest of the frontend can use the data safely.
{
  return (rows || [])
  // Return rows if it exists; otherwise return an empty array so the rest of the code can safely work with an array.
    .map((r) => ({
      // r means "The current row I'm working on."
      // => "For every row, do this..."
      // The { is not starting the function body. It is starting an object.
      // The extra ( tells JavaScript: "I'm returning an object directly."
      // Go through every row in the array, call each one r, and return a brand-new object for each row, creating a new array of transformed objects.
      date: (r.time || r.recorded_at || "").slice(0, 10),
      // date:Create a property in the new object 
      // r The current history record.
      // .time Take the time field.
      // Create a date property by using time if available, otherwise recorded_at, and extract only the YYYY-MM-DD part of the timestamp.(It's simply a field that whoever designed the backend chose to name recorded_at.)
      price: Number(r.price) || 0,
      // price:Create a property in the new object called:
      // Take the price from the current history record, convert it into a number, and if a valid number isn't available, store 0 instead.    
      }))
    .filter((r) => r.date);
    // filter() is a built-in JavaScript array function. Its job is:"Keep only the items that satisfy a condition."
    // Go through every history record and keep only those that have a valid date; remove any records where date is empty, null, or undefined.
}

// ---------- Endpoint helpers ----------
export const api = {
  products: () => getJSON("/products").then((d) => (Array.isArray(d) ? d : []).map(normalizeProduct)),
  // So even though you never typed normalizeHistory(rows), .then() did it for you behind the scenes.("When the previous step finishes, automatically call someFunction and give it the previous result as its first argument.")
  // When api.products() is called, it fetches all products from the backend, makes sure the response is an array, cleans every product using normalizeProduct(), and returns the final cleaned array to the rest of your React application.
  // products:This is a property name inside the api object.
  // () =>This creates an arrow function.
  // "getJSON end a request to the backend and get JSON data back."
  // "/products Go ask the backend for the /products endpoint."
  // .then "When the previous work finishes successfully, do this next."
  // d "Take whatever data came back and call it d."
  // (Array.isArray(d) ? d : []) "Check if d is an array. If it is, use it. If not, use an empty array."
  // .map() "Go through every item in the array one by one."
  // (normalizeProduct) "For each item, call normalizeProduct() to change its shape."For every product, call the function: normalizeproduct
  product: (id) => getJSON(`/products/${id}`).then(normalizeProduct),
  // So even though you never typed normalizeHistory(rows), .then() did it for you behind the scenes.
  // Fetch the product with the given ID from the backend, clean it using normalizeProduct(), and return the cleaned product object.
  history: (id) => getJSON(`/products/${id}/history`).then(normalizeHistory),
  // Fetch the price history for the product with the given ID from the backend, clean it using normalizeHistory(), and return the cleaned array of history records.
  dashboard: () => getJSON("/dashboard"),
  // Fetch the dashboard data from the backend and return it as-is (no normalization needed).
  topMovers: () => getJSON("/top-movers"),
  // Fetch the top movers data from the backend and return it as-is (no normalization needed).
};

// ---------- Tiny fetch hook ----------
export function useApi(fn, deps = [])
// useApi is a reusable React Hook that handles API fetching, loading state, error handling, successful data storage, cleanup, and returns everything the component needs to display the result. 
{
  // export "Other files are allowed to use this function."
  // (fn, deps = []) "These are the inputs (parameters) that useApi() expects."
  // fn This means:"Give me a function that I should execute."
  // deps = [] This means:"If nobody gives me a dependency array, I'll use an empty array by default."
  const [data, setData] = useState(null);
  // Create a React state variable named data, initialize it to null, and get a function (setData) that can update it later.
  // data This is the first thing taken out of the array.It is the current value of the state.
  // setData This is the second thing taken out of the array.It is a function provided by React.Its job is:"Update data."
  // useState This is a built-in React Hook.Its job is:"Create a piece of state (memory) for this component."
  // (null) This is the initial value.
  const [error, setError] = useState(null);
  // Create a React state variable named error, initialize it to null, and get a function (setError) that can update it later.
  // error This is the first thing taken out of the array.It is the current value of the state.
  // setError This is the second thing taken out of the array.It is a function provided by React.Its job is:"Update error."
  // useState This is a built-in React Hook.Its job is:"Create a piece of state (memory) for this component."
  // (null) This is the initial value.
  const [loading, setLoading] = useState(true);
  // Create a React state variable named loading, initialize it to true, and get a function (setLoading) that can update it later.
  // loading This is the first thing taken out of the array.It is the current value of the state.
  // setLoading This is the second thing taken out of the array.It is a function provided by React.Its job is:"Update loading."
  // useState This is a built-in React Hook.Its job is:"Create a piece of state (memory) for this component."
  // (true) This is the initial value.

  useEffect(() => {
    // useEffect(() => { ... }) tells React: "After this component(useApi) has finished rendering, run the code inside this function."
    // useEffect is a built-in React Hook.Its job is:"Run some code after the component renders."
    // "("" Start passing information to useEffect.
    // () => { ... } "This is the function that useEffect will run whenever react is ready."
    let cancelled = false;
    setLoading(true);
    // Tell React that an API request has started by changing loading to true, so the UI can show a loading state.
    setError(null);
    // Clear any previous error by setting error to null, so the UI doesn't show an old error message while the new request is in progress.
    Promise.resolve()
    // Promise is a built-in JavaScript object.Think of it as:"A promise that something will finish in the future."
    // resolve is a built-in function of Promise.Its meaning is:"Create a Promise that is already successful (already completed)."
    .then(fn)
    //.then() is a built-in Promise function.Its meaning is:"When the previous Promise finishes successfully, do the next thing."
    // fn is the function that was passed into useApi().
      .then((d) => {
        // .then "When the previous step finishes successfully, do this next."
        // d is the result returned by the previous .then(fn).
        if (!cancelled)
          {
            setData(d);
          } 
          // Only save the API data into React state if the component is still active and the request hasn't been cancelled.
      })
      .catch((e) => {
        // If anything fails during the Promise chain, capture the error, call it e, and execute the code inside this block to handle it.
        // .catch() is a Promise function.
        // "If anything goes wrong anywhere before this, come here."
        if (!cancelled) 
          {
            setError(e);
          }
          // Only save the error into React state if the component is still active and the request hasn't been cancelled.
      })
      .finally(() => {
        // .finally() is a Promise function.
        // "No matter what happened before this, run the code inside this block."
        if (!cancelled)
          {
            setLoading(false);
            // Only mark the request as finished (loading = false) if the component is still active and the request hasn't been cancelled.
          } 
      });
    return () => {
      // "Before this effect is removed or run again, execute this cleanup function." This is called the cleanup function.
      cancelled = true;
      // "Don't update this component anymore. It's gone (or this effect is being replaced)."
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  // deps tells React:"When should this effect run again?"

  return { data, error, loading };
  // It returns an object containing:data,error,loading
}

// Derived helpers (computed client-side because backend doesn't return them yet)
export function computeCategoryAverages(products)
// Take a big list of products and convert it into a summary for each category.
{
  // export "Other files are allowed to use this function."
  // products is the input parameter of the function computeCategoryAverages. "This is the array of products that we got from the backend."
  const map = new Map();
  // Map() is a built-in JavaScript object that stores key-value pairs.
  // Create a new, empty JavaScript Map object named map that will store data as key–value pairs.
  for (const p of products) 
    // the entire block has one purpose Group all products according to their category.
    // for (const p of products) "Go through every product one by one."
    {
    if (!map.has(p.category)) 
      // Does the Map already contain the specific category if it doesn't then 
      {
        map.set(p.category, []);
        // Create a new empty array for this category.
      }
    map.get(p.category).push(p);
    // This loop goes through every product, creates a category in the Map if it doesn't already exist, and then places the current product into that category's array.
    // Get the array for specific category and add the current product to it.
  }
  return [...map.entries()].map(([category, items]) => ({
    // map.entries() is a built-in Map method that returns an iterator of the Map's key-value pairs. "Give me every key-value pair in the map."
    // The ... is the spread operator. "Take everything inside something and spread it out." The spread operator converts it into a real array.
    // .map() is a built-in JavaScript array method. Its job is:"Go through every item in the array and return a new array with the results." "Go through every entry one by one."
    // ([category, items]) "For each entry, take the key and value and call them category and items."
    // => "For every entry, do this..."
    // The { is not starting the function body. It is starting an object.
    // The extra ( tells JavaScript: "I'm returning an object directly."
    category,
    // "If the property name and variable name are the same, you can write it only once."
    /* JavaScript automatically understands it as:
{
  category: category
}
  */
    avg: Math.round((items.reduce((a, p) => a + p.currentPrice, 0) / items.length) * 100) / 100,
    // Create a property in the returned object named: "avg"
    // Math.round() is a built-in JavaScript function. "Round the number to the nearest integer."
    // items.reduce() is a built-in JavaScript array method. Its job is:"Go through every item in the array and combine them into one value."These are all the products in one category.
    // (a, p) => a + p.currentPrice "For each product, add its (p)currentPrice to the running total(a)." '0' Start the running total from zero.
    change: Math.round((items.reduce((a, p) => a + p.changePct, 0) / items.length) * 100) / 100,
    // Create a property in the returned object named: "change"
    // Math.round() is a built-in JavaScript function. "Round the number to the nearest integer."
    // items.reduce() is a built-in JavaScript array method. Its job is:"Go through every item in the array and combine them into one value."These are all the products in one category.
    // (a, p) => a + p.changePct "For each product, add its (p)changePct to the running total(a)." '0' Start the running total from zero.
    // / items.length "Divide the total changePct by the number of products to get the average changePct." Average change percentage
    // *100 / 100 "Round the average changePct to two decimal places."
    count: items.length,
    // count:Create a property in the returned object named: "count"
    // items.length "Count how many products are in this category."
  }));
}

export function computeTopMovers(products) 
// computeTopMovers(products) takes all products, sorts them by percentage price change, and returns an object containing the top 3 gainers and the top 3 losers.
{
  const sorted = [...products].sort((a, b) => b.changePct - a.changePct);
  // [...products] "Make a copy of the products array so we don't change the original."
  // .sort() is a built-in JavaScript array method. Its job is:"Rearrange the items in the array based on a comparison function."
  // (a, b) => b.changePct - a.changePct "For every two products, compare their changePct values and sort them in descending order."
  return { gainers: sorted.slice(0, 3), losers: sorted.slice(-3).reverse() };
  // Return an object with two properties: gainers and losers. The gainers property contains the top 3 products with the highest changePct, while the losers property contains the bottom 3 products with the lowest changePct (reversed to show the worst first).
}
