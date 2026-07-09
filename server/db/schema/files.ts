import {
  bigint,
  int,
  mysqlTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { _admins } from "./auth";

export const files = mysqlTable("files", {
  id: serial("id").primaryKey(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  path: varchar("path", { length: 500 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: int("size").notNull(),
  uploadedBy: bigint("uploaded_by", {
    mode: "number",
    unsigned: true,
  }).references(() => _admins.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const filesRelations = relations(files, ({ one }) => ({
  uploader: one(_admins, {
    fields: [files.uploadedBy],
    references: [_admins.id],
  }),
}));
