export type ThemeName =
  | "academic-precision"
  | "academic-precision-dark"
  | "forest"
  | "forest-dark"
  | "sunset"
  | "sunset-dark"
  | "ocean"
  | "ocean-dark"
  | "rose"
  | "rose-dark"
  | "lavender"
  | "lavender-dark"
  | "slate"
  | "slate-dark"
  | "crimson"
  | "crimson-dark"
  | "amber"
  | "amber-dark"
  | "high-contrast"
  | "high-contrast-dark"
  | "indigo"
  | "indigo-dark"
  | "emerald"
  | "emerald-dark"
  | "coral"
  | "coral-dark"
  | "plum"
  | "plum-dark"
  | "steel"
  | "steel-dark"
  | "olive"
  | "olive-dark";

export function useTheme() {
  const theme = useState<ThemeName>("app-theme", () => "academic-precision");

  function setTheme(name: ThemeName) {
    theme.value = name;
    if (import.meta.client) {
      document.documentElement.setAttribute("data-theme", name);
      localStorage.setItem("app-theme", name);
      // TODO: nanti tambah persist ke database di sini
    }
  }

  return { theme, setTheme };
}
