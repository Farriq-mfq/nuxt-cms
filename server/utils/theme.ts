export type ThemeName =
  | "default"
  | "default-dark"
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

export interface BaseThemeOption {
  name: string;
  label: string;
  color: string;
}

export const BASE_THEMES: BaseThemeOption[] = [
  { name: "default", label: "Default", color: "#002045" },
  { name: "forest", label: "Forest", color: "#1b3d20" },
  { name: "sunset", label: "Sunset", color: "#8c3a00" },
  { name: "ocean", label: "Ocean", color: "#004a4e" },
  { name: "rose", label: "Rose", color: "#900f42" },
  { name: "lavender", label: "Lavender", color: "#5d449c" },
  { name: "slate", label: "Slate", color: "#334155" },
  { name: "crimson", label: "Crimson", color: "#a30019" },
  { name: "amber", label: "Amber", color: "#825200" },
  { name: "high-contrast", label: "High Contrast", color: "#000000" },
  { name: "indigo", label: "Indigo", color: "#3e3ca5" },
  { name: "emerald", label: "Emerald", color: "#006d4c" },
  { name: "coral", label: "Coral", color: "#bf2b0f" },
  { name: "plum", label: "Plum", color: "#80186c" },
  { name: "steel", label: "Steel", color: "#27546e" },
  { name: "olive", label: "Olive", color: "#5b6200" },
];

export function getBaseThemeName(theme: ThemeName | undefined | null): string {
  if (!theme) return "default";
  return theme.endsWith("-dark") ? theme.slice(0, -5) : theme;
}

export function isDarkTheme(theme: ThemeName | undefined | null): boolean {
  if (!theme) return false;
  return theme.endsWith("-dark");
}

export function buildThemeName(base: string, dark: boolean): ThemeName {
  return (dark ? `${base}-dark` : base) as ThemeName;
}
