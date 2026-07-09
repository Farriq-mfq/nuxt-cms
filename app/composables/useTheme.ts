import {
  isDarkTheme,
  getBaseThemeName,
  type ThemeName,
  buildThemeName,
} from "~~/server/utils/theme";

export function useTheme() {
  const isDarkCookie = useCookie<boolean>("app-theme-dark", {
    default: () => false,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const isDark = computed(() => isDarkCookie.value);

  function setThemeDark(name: ThemeName) {
    isDarkCookie.value = isDarkTheme(name);
  }

  function toggleDarkMode() {
    isDarkCookie.value = !isDarkCookie.value;

    const currentThemeRaw = document.documentElement.getAttribute(
      "data-theme",
    ) as ThemeName;
    const baseTheme = getBaseThemeName(currentThemeRaw); // strip -dark dulu, ambil base murni

    const newTheme = buildThemeName(baseTheme, isDarkCookie.value);
    document.documentElement.setAttribute("data-theme", newTheme);
  }

  function currentDarkMode(appTheme: ThemeName) {
    const baseTheme = getBaseThemeName(appTheme);
    return buildThemeName(baseTheme, isDarkCookie.value);
  }

  return {
    isDark,
    toggleDarkMode,
    setThemeDark,
    currentDarkMode,
  };
}
