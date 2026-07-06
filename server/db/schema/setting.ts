import {
  mysqlTable,
  tinyint,
  varchar,
  text,
  json,
  mysqlEnum,
  timestamp,
} from "drizzle-orm/mysql-core";

export const setting = mysqlTable("setting", {
  id: tinyint("id").primaryKey().default(1),

  appName: varchar("app_name", { length: 255 }).notNull(),
  appDescription: varchar("app_description", { length: 500 }).notNull(),
  appKeywords: json("app_keywords").$type<string[]>(),
  appLogo: varchar("app_logo", { length: 255 }),

  appTheme: mysqlEnum("app_theme", ["academic-precision", "light", "dark"])
    .notNull()
    .default("academic-precision"),

  socialLinks: json("social_links").$type<{
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
  }>(),

  companyAddress: varchar("company_address", { length: 500 }),

  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: varchar("meta_description", { length: 500 }),
  metaImage: varchar("meta_image", { length: 255 }),
  metaUrl: varchar("meta_url", { length: 255 }),

  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
