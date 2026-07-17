import {
  bigint,
  boolean,
  mysqlTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { images } from "./images";

export const popups = mysqlTable("popups", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  imageId: bigint("image_id", { mode: "number", unsigned: true }).references(
    () => images.id,
    { onDelete: "set null" },
  ),
  linkUrl: varchar("link_url", { length: 500 }),
  isActive: boolean("is_active").default(false).notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const popupsRelations = relations(popups, ({ one }) => ({
  image: one(images, {
    fields: [popups.imageId],
    references: [images.id],
  }),
}));
