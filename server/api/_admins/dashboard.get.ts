import { count, desc, eq } from "drizzle-orm";
import { db } from "~~/server/db";
import {
  posts,
  pages,
  menus,
  albums,
  announcements,
  agenda,
} from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const [
    postsCountResult,
    pagesCountResult,
    menusCountResult,
    albumsCountResult,
    agendaCountResult,
    announcementsCountResult,
    recentPost,
  ] = await Promise.all([
    db.select({ count: count() }).from(posts),
    db.select({ count: count() }).from(pages),
    db.select({ count: count() }).from(menus),
    db.select({ count: count() }).from(albums),
    db.select({ counte: count() }).from(agenda),
    db.select({ counte: count() }).from(announcements),
    db.query.posts.findMany({
      orderBy: desc(posts.createdAt),
      limit: 5,
      with: {
        thumbnail: true,
      },
    }),
  ]);

  return successResponse(
    {
      stats: {
        posts: postsCountResult[0]?.count ?? 0,
        pages: pagesCountResult[0]?.count ?? 0,
        menus: menusCountResult[0]?.count ?? 0,
        albums: albumsCountResult[0]?.count ?? 0,
        agenda: agendaCountResult[0]?.counte ?? 0,
        announcements: announcementsCountResult[0]?.counte ?? 0,
      },
      recentPost,
    },
    "Data dashboard berhasil diambil",
  );
});
