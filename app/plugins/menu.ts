export interface PublicMenuNode {
  id: number;
  title: string;
  slug: string;
  url: string | null;
  icon: string | null;
  target: "_self" | "_blank";
  children: PublicMenuNode[];
}

interface MenuResponse {
  success: boolean;
  data: PublicMenuNode[];
}

export default defineNuxtPlugin(async () => {
  const menu = useState<PublicMenuNode[]>("public-menu", () => []);

  const { data } = await useAsyncData<MenuResponse>("public-menu", () =>
    $fetch("/api/public/menus"),
  );

  if (data.value?.data) {
    menu.value = data.value.data;
  }
});
