import {
  bigint,
  boolean,
  mysqlTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { images } from "./images";
import { _admins } from "./auth";
import { relations } from "drizzle-orm";

export const newsCategories = mysqlTable("news_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
});

export const news = mysqlTable("news", {
  id: serial("id").primaryKey(),
  categoryId: bigint("category_id", {
    mode: "number",
    unsigned: true,
  }).references(() => newsCategories.id),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: varchar("excerpt", { length: 500 }),
  content: text("content").notNull(),
  thumbnailId: bigint("thumbnail_id", {
    mode: "number",
    unsigned: true,
  }).references(() => images.id),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  authorId: bigint("author_id", {
    mode: "number",
    unsigned: true,
  }).references(() => _admins.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const newsRelations = relations(news, ({ one }) => ({
  category: one(newsCategories, {
    fields: [news.categoryId],
    references: [newsCategories.id],
  }),
  thumbnail: one(images, {
    fields: [news.thumbnailId],
    references: [images.id],
  }),
  author: one(_admins, {
    fields: [news.authorId],
    references: [_admins.id],
  }),
}));
