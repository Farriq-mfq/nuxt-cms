export default defineNuxtPlugin(() => {
  if (import.meta.server) return;

  const saved = localStorage.getItem("app-theme") as ThemeName | null;
  const initial = saved ?? "academic-precision";

  document.documentElement.setAttribute("data-theme", initial);

  const theme = useState<ThemeName>("app-theme", () => initial);
  theme.value = initial;
});
