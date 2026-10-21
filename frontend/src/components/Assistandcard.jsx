/*
AiAssistantCard.jsx

One combined AI card for the Dashboard.

Replaces the three separate cards (AI Market Summary, AI Market Analyst,
Ask the Database) with a single card:

1. Summary strip at the top (hidden if the summary fails to load).
2. Category chips (PP, HD, LL, PVC, EVA) that run the market analyst.
3. One input box:
   - Click it -> dropdown of common questions (no heading, no counts).
   - Type     -> dropdown filters, matched words highlighted in the
                 theme's primary (orange) colour, plus a grey inline
                 completion that Tab or -> accepts.
   - Keys     -> Up / Down / Enter / Esc all work.
4. Answers appear inside the same card.

Place at: src/components/AiAssistantCard.jsx
*/

import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Code2 } from "lucide-react";

import { api, useApi } from "../api";


const CATEGORIES = ["PP", "HD", "LL", "PVC", "EVA"];

/*
Shown when the input is clicked and still empty.
Keep these answerable from the products / price_history / categories
tables, since /ask turns them into SQL.
*/
const TOP_QUESTIONS = [
  "Which PP grade had the biggest price increase today?",
  "Which products dropped in price today?",
  "What is the average price of each category?",
  "Show the 5 most expensive products",
  "How many products are in each category?",
];

/*
Autocomplete pool (the top questions plus more).
Later this can be filled from logged user questions.
*/
const QUESTION_POOL = [
  ...TOP_QUESTIONS,
  "Which category has the highest average price?",
  "What is the lowest priced PVC product?",
  "Which HD grades increased today?",
  "Which LL grade is the cheapest?",
  "Which products were updated today?",
  "Show the top 10 gainers today",
  "Show the top 10 losers today",
  "What is the average price of PP?",
  "Which PP grade is the most expensive?",
  "How many products are tracked in total?",
];


function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* Highlights every typed word inside a suggestion. */
function Highlight({ text, query }) {
  const words = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(escapeRegExp);

  if (words.length === 0) {
    return <>{text}</>;
  }

  const pattern = new RegExp(`(${words.join("|")})`, "gi");

  // With a capture group, matches land on the odd indexes.
  return (
    <>
      {text.split(pattern).map((part, index) =>
        index % 2 === 1 ? (
          <span key={index} className="text-primary font-semibold">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}


export default function AiAssistantCard() {
  const {
    data: summaryData,
    error: summaryError,
    loading: summaryLoading,
  } = useApi(() => api.marketSummary(), []);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showSql, setShowSql] = useState(false);

  const wrapperRef = useRef(null);


  /*
  CLOSE DROPDOWN ON OUTSIDE CLICK
  */

  useEffect(() => {
    function handleClick(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () =>
      document.removeEventListener("mousedown", handleClick);
  }, []);


  /*
  DROPDOWN LIST
  Empty input -> top questions.
  Typing      -> filter the pool (every typed word must match).
  */

  const suggestions = useMemo(() => {
    const text = query.trim().toLowerCase();

    if (!text) {
      return TOP_QUESTIONS;
    }

    const words = text.split(/\s+/);

    return QUESTION_POOL.filter((question) => {
      const lower = question.toLowerCase();
      return words.every((word) => lower.includes(word));
    }).slice(0, 6);
  }, [query]);


  /*
  GREY INLINE COMPLETION
  */

  const ghost = useMemo(() => {
    if (!query) {
      return "";
    }

    const match = QUESTION_POOL.find(
      (question) =>
        question.length > query.length &&
        question.toLowerCase().startsWith(query.toLowerCase())
    );

    return match ? match.slice(query.length) : "";
  }, [query]);


  /*
  ACTIONS
  */

  async function runAsk(question) {
    const text = question.trim();

    if (!text) {
      return;
    }

    setQuery(text);
    setOpen(false);
    setActiveIndex(-1);
    setActiveCategory(null);
    setShowSql(false);
    setError(null);
    setLoading(true);

    try {
      const data = await api.askDatabase(text);
      setResult({ type: "ask", ...data });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  async function runCategory(category) {
    setActiveCategory(category);
    setOpen(false);
    setShowSql(false);
    setError(null);
    setLoading(true);

    try {
      const data = await api.marketAnalyst(category);
      setResult({ type: "analyst", category, ...data });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }


  /*
  KEYBOARD
  */

  function handleKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) =>
        suggestions.length === 0
          ? -1
          : (index + 1) % suggestions.length
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) =>
        suggestions.length === 0
          ? -1
          : index <= 0
            ? suggestions.length - 1
            : index - 1
      );
      return;
    }

    if (event.key === "Enter") {
      if (open && activeIndex >= 0 && suggestions[activeIndex]) {
        event.preventDefault();
        runAsk(suggestions[activeIndex]);
      }
      // otherwise the form submit handles the typed text
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === "Tab" && ghost) {
      event.preventDefault();
      setQuery(query + ghost);
      return;
    }

    if (
      event.key === "ArrowRight" &&
      ghost &&
      event.currentTarget.selectionStart === query.length
    ) {
      event.preventDefault();
      setQuery(query + ghost);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    runAsk(query);
  }

  const showSummary =
    !summaryLoading &&
    !summaryError &&
    Boolean(summaryData?.summary);

  const stats = result?.stats || {};


  return (
    <div
      className="
        mb-6
        sm:mb-8
        bg-card
        border
        border-border
        rounded-lg
        p-4
        sm:p-5
      "
    >

      {/* HEADER */}

      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="size-4 text-primary" />

        <span className="text-[10px] font-display tracking-widest text-muted-foreground">
          AI ASSISTANT
        </span>
      </div>


      {/* SUMMARY STRIP (hidden if it fails) */}

      {showSummary && (
        <div className="mb-4 pb-4 border-b border-border">
          <p className="text-sm sm:text-base text-foreground leading-relaxed">
            {summaryData.summary}
          </p>

          {Array.isArray(summaryData.top_movers) &&
            summaryData.top_movers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {summaryData.top_movers.map((mover, index) => (
                  <span
                    key={index}
                    className="
                      px-2.5
                      py-1
                      text-[11px]
                      font-display
                      bg-accent/40
                      border
                      border-border
                      rounded-md
                      text-muted-foreground
                    "
                  >
                    {mover}
                  </span>
                ))}
              </div>
            )}
        </div>
      )}


      {/* CATEGORY CHIPS */}

      <div className="flex flex-wrap items-center gap-2 mb-3">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => runCategory(category)}
            className={`
              px-3
              sm:px-4
              py-1.5
              border
              rounded-md
              text-xs
              sm:text-sm
              font-display
              transition-colors
              ${
                activeCategory === category
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border hover:border-primary hover:text-primary"
              }
            `}
          >
            {category}
          </button>
        ))}
      </div>


      {/* INPUT + DROPDOWN */}

      <div ref={wrapperRef} className="relative">

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-2"
        >

          <div
            className="
              relative
              flex-1
              h-10
              rounded-md
              border
              border-border
              bg-background
              focus-within:border-primary
              transition-colors
            "
          >

            {/* grey inline completion */}

            <div
              className="
                absolute
                inset-0
                flex
                items-center
                px-3
                text-sm
                whitespace-pre
                overflow-hidden
                pointer-events-none
              "
              aria-hidden="true"
            >
              <span className="invisible">{query}</span>

              <span className="text-muted-foreground/60">
                {ghost}
              </span>
            </div>

            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
                setActiveIndex(-1);
              }}
              onFocus={() => setOpen(true)}
              onClick={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about prices, grades or trends…"
              autoComplete="off"
              spellCheck={false}
              className="
                relative
                w-full
                h-full
                px-3
                text-sm
                bg-transparent
                outline-none
              "
            />

          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="
              h-10
              px-4
              rounded-md
              bg-primary
              text-primary-foreground
              text-sm
              font-display
              hover:opacity-90
              transition-opacity
              disabled:opacity-50
              shrink-0
            "
          >
            {loading ? "Thinking…" : "Ask"}
          </button>

        </form>


        {open && suggestions.length > 0 && (
          <ul
            className="
              absolute
              z-20
              left-0
              right-0
              mt-1
              bg-card
              border
              border-border
              rounded-md
              shadow-lg
              overflow-hidden
            "
          >
            {suggestions.map((question, index) => (
              <li key={question}>
                <button
                  type="button"
                  // mouse down, so it fires before the input loses focus
                  onMouseDown={(event) => {
                    event.preventDefault();
                    runAsk(question);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`
                    w-full
                    text-left
                    px-3
                    py-2.5
                    text-sm
                    transition-colors
                    ${
                      activeIndex === index
                        ? "bg-accent"
                        : "hover:bg-accent/60"
                    }
                  `}
                >
                  <Highlight text={question} query={query} />
                </button>
              </li>
            ))}
          </ul>
        )}

      </div>


      {/* ANSWER AREA (inside the same card) */}

      <div className="mt-4">

        {loading && (
          <p className="text-sm text-muted-foreground">
            Analysing the market data…
          </p>
        )}

        {!loading && error && (
          <p className="text-sm text-down">
            Could not get an answer. Please try again.
          </p>
        )}

        {!loading && !error && result && (
          <div>

            {result.type === "analyst" && (
              <div className="text-[10px] font-display tracking-widest text-muted-foreground mb-2">
                {result.category} ANALYSIS
              </div>
            )}

            <p className="text-sm sm:text-base text-foreground leading-relaxed">
              {result.answer}
            </p>


            {/* analyst stats */}

            {result.type === "analyst" &&
              Object.keys(stats).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-3">

                  {stats.current_avg_price != null && (
                    <div className="bg-accent/30 rounded p-2">
                      <div className="text-muted-foreground text-[10px]">
                        AVG PRICE
                      </div>
                      <div className="font-display font-semibold">
                        ₹{stats.current_avg_price}
                      </div>
                    </div>
                  )}

                  {stats.change_30d_pct != null && (
                    <div className="bg-accent/30 rounded p-2">
                      <div className="text-muted-foreground text-[10px]">
                        30D CHANGE
                      </div>
                      <div className="font-display font-semibold">
                        {stats.change_30d_pct}%
                      </div>
                    </div>
                  )}

                  {stats.min_price_30d != null && (
                    <div className="bg-accent/30 rounded p-2">
                      <div className="text-muted-foreground text-[10px]">
                        30D LOW
                      </div>
                      <div className="font-display font-semibold">
                        ₹{stats.min_price_30d}
                      </div>
                    </div>
                  )}

                  {stats.max_price_30d != null && (
                    <div className="bg-accent/30 rounded p-2">
                      <div className="text-muted-foreground text-[10px]">
                        30D HIGH
                      </div>
                      <div className="font-display font-semibold">
                        ₹{stats.max_price_30d}
                      </div>
                    </div>
                  )}

                </div>
              )}


            {/* generated SQL toggle (ask only) */}

            {result.type === "ask" && result.sql && (
              <div className="mt-2">

                <button
                  type="button"
                  onClick={() => setShowSql((value) => !value)}
                  className="
                    flex
                    items-center
                    gap-1.5
                    text-[11px]
                    text-muted-foreground
                    hover:text-primary
                    transition-colors
                  "
                >
                  <Code2 className="size-3.5" />
                  {showSql ? "Hide" : "Show"} generated SQL
                </button>

                {showSql && (
                  <pre
                    className="
                      mt-2
                      p-3
                      bg-accent/30
                      border
                      border-border
                      rounded-md
                      text-[11px]
                      font-mono
                      overflow-x-auto
                      whitespace-pre-wrap
                      break-words
                    "
                  >
                    {result.sql}
                  </pre>
                )}

              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}