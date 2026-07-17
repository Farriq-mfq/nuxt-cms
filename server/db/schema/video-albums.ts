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
import { relations } from "drizzle-orm";
import { images } from "./images";

export const videoAlbums = mysqlTable("video_albums", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  coverImageId: bigint("cover_image_id", {
    mode: "number",
    unsigned: true,
  }).references(() => images.id, { onDelete: "set null" }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const videos = mysqlTable("videos", {
  id: serial("id").primaryKey(),
  albumId: bigint("album_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => videoAlbums.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 50 }).default("youtube").notNull(), // youtube | vimeo | dll
  videoId: varchar("video_id", { length: 100 }).notNull(), // ID video, bukan URL penuh
  order: int("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const videoAlbumsRelations = relations(videoAlbums, ({ many, one }) => ({
  videos: many(videos),
  coverImage: one(images, {
    fields: [videoAlbums.coverImageId],
    references: [images.id],
  }),
}));

export const videosRelations = relations(videos, ({ one }) => ({
  album: one(videoAlbums, {
    fields: [videos.albumId],
    references: [videoAlbums.id],
  }),
}));
