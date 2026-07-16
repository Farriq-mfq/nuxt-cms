import {
  bigint,
  boolean,
  mysqlTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { images } from "./images";
import { _admins } from "./auth";

export const announcements = mysqlTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  thumbnailId: bigint("thumbnail_id", {
    mode: "number",
    unsigned: true,
  }).references(() => images.id, { onDelete: "set null" }),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  authorId: bigint("author_id", { mode: "number", unsigned: true }).references(
    () => _admins.id,
    { onDelete: "set null" },
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const announcementsRelations = relations(announcements, ({ one }) => ({
  thumbnail: one(images, {
    fields: [announcements.thumbnailId],
    references: [images.id],
  }),
  author: one(_admins, {
    fields: [announcements.authorId],
    references: [_admins.id],
  }),
}));
