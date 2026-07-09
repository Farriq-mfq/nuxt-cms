import {
  bigint,
  int,
  mysqlTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { _admins } from "./auth";
import { relations } from "drizzle-orm";

export const images = mysqlTable("images", {
  id: serial("id").primaryKey(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  path: varchar("path", { length: 500 }).notNull(),
  altText: varchar("alt_text", { length: 255 }),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: int("size").notNull(),
  width: int("width"),
  height: int("height"),
  uploadedBy: bigint("uploaded_by", {
    mode: "number",
    unsigned: true,
  }).references(() => _admins.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const imagesRelations = relations(images, ({ one }) => ({
  uploader: one(_admins, {
    fields: [images.uploadedBy],
    references: [_admins.id],
  }),
}));
