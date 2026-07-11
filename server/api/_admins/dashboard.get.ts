import { count, desc, eq } from "drizzle-orm";
import { db } from "~~/server/db";
import { news, pages, menus, albums } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const [
    newsCountResult,
    pagesCountResult,
    menusCountResult,
    albumsCountResult,
    recentNews,
  ] = await Promise.all([
    db.select({ count: count() }).from(news),
    db.select({ count: count() }).from(pages),
    db.select({ count: count() }).from(menus),
    db
      .select({
        count: count(),
      })
      .from(albums)
      .where(eq(albums.isActive, true)),
    db.query.news.findMany({
      orderBy: desc(news.createdAt),
      limit: 5,
      with: {
        thumbnail: true,
      },
    }),
  ]);

  return successResponse(
    {
      stats: {
        news: newsCountResult[0]?.count ?? 0,
        pages: pagesCountResult[0]?.count ?? 0,
        menus: menusCountResult[0]?.count ?? 0,
        albums: albumsCountResult[0]?.count ?? 0,
      },
      recentNews,
    },
    "Data dashboard berhasil diambil",
  );
});
