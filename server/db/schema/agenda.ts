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

export const agenda = mysqlTable("agenda", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  location: varchar("location", { length: 500 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  thumbnailId: bigint("thumbnail_id", {
    mode: "number",
    unsigned: true,
  }).references(() => images.id, { onDelete: "set null" }),
  isPublished: boolean("is_published").default(true).notNull(),
  authorId: bigint("author_id", { mode: "number", unsigned: true }).references(
    () => _admins.id,
    { onDelete: "set null" },
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const agendaRelations = relations(agenda, ({ one }) => ({
  thumbnail: one(images, {
    fields: [agenda.thumbnailId],
    references: [images.id],
  }),
  author: one(_admins, {
    fields: [agenda.authorId],
    references: [_admins.id],
  }),
}));
