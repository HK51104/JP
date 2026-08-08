import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <button
      onClick={toggleTheme}
      className="
      relative
      w-14
      h-8
      rounded-full
      bg-slate-300
      dark:bg-slate-700
      transition-colors
      duration-300
      "
    >
      <div
        className={`
          absolute
          top-1
          left-1
          h-6
          w-6
          rounded-full
          bg-card
          transition-transform
          duration-300
          ${
            theme === "dark"
              ? "translate-x-6"
              : ""
          }
        `}
      />
    </button>
  );
}