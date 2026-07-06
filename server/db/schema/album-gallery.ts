import {
  bigint,
  boolean,
  int,
  mysqlTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { images } from "./images";
import { relations } from "drizzle-orm";

export const albums = mysqlTable("albums", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  coverImageId: bigint("cover_image_id", {
    mode: "number",
    unsigned: true,
  }).references(() => images.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const galleries = mysqlTable("galleries", {
  id: serial("id").primaryKey(),
  albumId: bigint("album_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => albums.id, {
      onDelete: "cascade",
    }),
  imageId: bigint("image_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => images.id),
  caption: varchar("caption", { length: 255 }),
  order: int("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const albumsRelations = relations(albums, ({ many, one }) => ({
  galleries: many(galleries),
  coverImage: one(images, {
    fields: [albums.coverImageId],
    references: [images.id],
  }),
}));

export const galleriesRelations = relations(galleries, ({ one }) => ({
  album: one(albums, {
    fields: [galleries.albumId],
    references: [albums.id],
  }),
  image: one(images, {
    fields: [galleries.imageId],
    references: [images.id],
  }),
}));
