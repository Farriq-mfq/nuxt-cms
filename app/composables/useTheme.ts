import { type ThemeName } from "~~/server/utils/theme";
export function useTheme() {
  const theme = useState<ThemeName>("app-theme", () => "default");

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
