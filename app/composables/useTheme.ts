import {
  getBaseThemeName,
  isDarkTheme,
  buildThemeName,
  BASE_THEMES,
  type ThemeName,
} from "~~/server/utils/theme";

export function useTheme() {
  const isDarkCookie = useCookie<boolean>("app-theme-dark", {
    default: () => false,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const baseTheme = useState<string>("app-theme-base", () => "default");

  const theme = computed<ThemeName>(() =>
    buildThemeName(baseTheme.value, isDarkCookie.value),
  );

  function setTheme(name: ThemeName) {
    baseTheme.value = getBaseThemeName(name);
    isDarkCookie.value = isDarkTheme(name);

    if (import.meta.client) {
      document.documentElement.setAttribute("data-theme", name);
      localStorage.setItem("app-theme-base", baseTheme.value);
    }
  }

  function toggleDarkMode() {
    setTheme(buildThemeName(baseTheme.value, !isDarkCookie.value));
  }

  function selectBaseTheme(base: string) {
    setTheme(buildThemeName(base, isDarkCookie.value));
  }

  return {
    theme,
    setTheme,
    toggleDarkMode,
    selectBaseTheme,
    baseThemes: BASE_THEMES,
  };
}
