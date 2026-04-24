// components/ThemeScript.tsx
// Runs before React hydration to prevent flash of wrong theme

export function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem('carimail-theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}