import {
  bigint,
  boolean,
  mysqlTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { _admins } from "./auth";
import { relations } from "drizzle-orm";

export const pages = mysqlTable("pages", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: varchar("meta_description", { length: 500 }),
  metaImage: varchar("meta_image", { length: 255 }),
  isPublished: boolean("is_published").default(false).notNull(),
  authorId: bigint("author_id", {
    mode: "number",
    unsigned: true,
  }).references(() => _admins.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const pagesRelations = relations(pages, ({ one }) => ({
  author: one(_admins, {
    fields: [pages.authorId],
    references: [_admins.id],
  }),
}));
