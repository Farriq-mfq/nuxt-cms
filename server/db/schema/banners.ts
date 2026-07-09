import {
  bigint,
  boolean,
  int,
  mysqlTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { images } from "./images";

export const banners = mysqlTable("banners", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  imageId: bigint("image_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => images.id),
  linkUrl: varchar("link_url", { length: 500 }),
  order: int("order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const bannersRelations = relations(banners, ({ one }) => ({
  image: one(images, {
    fields: [banners.imageId],
    references: [images.id],
  }),
}));
