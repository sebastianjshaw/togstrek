import Script from "next/script";

/**
 * Set `data-theme` on `<html>` before paint to avoid a flash.
 *
 * Theme tokens live in `src/styles/tokens.css` under `[data-theme="dark"]`.
 */
export function TogstrekThemeInitScript() {
  // Keep this inline script tiny and dependency-free.
  const code = `
(function () {
  try {
    var key = "togstrek-theme";
    var pref = localStorage.getItem(key);
    if (pref === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      return;
    }
    if (pref === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      return;
    }
    // system / unset
    document.documentElement.removeAttribute("data-theme");
  } catch (e) {
    // Ignore (privacy mode, blocked storage, etc.)
  }
})();`.trim();

  return (
    <Script id="togstrek-theme-init" strategy="beforeInteractive">
      {code}
    </Script>
  );
}

