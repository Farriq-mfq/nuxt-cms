import { isNull, eq, asc, and } from "drizzle-orm";
import { db } from "~~/server/db";
import { menus } from "~~/server/db/schema/menu";

interface MenuNode {
  id: number;
  title: string;
  url: string | null;
  icon: string | null;
  target: "_self" | "_blank";
  children: MenuNode[];
}

async function buildMenuTree(parentId: number | null): Promise<MenuNode[]> {
  const rows = await db
    .select()
    .from(menus)
    .where(
      parentId === null
        ? and(isNull(menus.parentId), eq(menus.isActive, true))
        : and(eq(menus.parentId, parentId), eq(menus.isActive, true)),
    )
    .orderBy(asc(menus.order));

  const nodes: MenuNode[] = [];

  for (const row of rows) {
    const children = await buildMenuTree(row.id);
    nodes.push({
      id: row.id,
      title: row.title,
      url: row.url,
      icon: row.icon,
      target: row.target,
      children,
    });
  }

  return nodes;
}

export default defineEventHandler(async () => {
  const tree = await buildMenuTree(null);
  return successResponse(tree, "Menu berhasil diambil");
});
