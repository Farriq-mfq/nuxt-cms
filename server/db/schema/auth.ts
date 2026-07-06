import {
  mysqlTable,
  serial,
  timestamp,
  varchar,
  mysqlEnum,
  boolean,
} from "drizzle-orm/mysql-core";

export const _admins = mysqlTable("_admins", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["admin", "superadmin", "editor"])
    .default("admin")
    .notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
