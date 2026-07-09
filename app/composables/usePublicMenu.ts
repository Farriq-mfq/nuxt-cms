import type { PublicMenuNode } from "~~/app/plugins/menu";

export function usePublicMenu() {
  const menu = useState<PublicMenuNode[]>("public-menu", () => []);
  return { menu: readonly(menu) };
}
