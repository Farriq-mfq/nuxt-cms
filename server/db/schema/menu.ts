import { relations } from "drizzle-orm";
import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const menus = mysqlTable("menus", {
  id: serial("id").primaryKey(),
  parentId: int("parent_id"),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  url: varchar("url", { length: 500 }),
  icon: varchar("icon", { length: 100 }),
  order: int("order").default(0).notNull(),
  target: mysqlEnum("target", ["_self", "_blank"]).default("_self").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const menusRelations = relations(menus, ({ one, many }) => ({
  parent: one(menus, {
    fields: [menus.parentId],
    references: [menus.id],
    relationName: "menu_children",
  }),
  children: many(menus, { relationName: "menu_children" }),
}));
