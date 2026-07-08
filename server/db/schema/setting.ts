import {
  boolean,
  json,
  mysqlTable,
  timestamp,
  tinyint,
  varchar,
} from "drizzle-orm/mysql-core";

export const setting = mysqlTable("setting", {
  id: tinyint("id").primaryKey().default(1),

  // App Info
  appName: varchar("app_name", { length: 255 }).notNull(),
  appDescription: varchar("app_description", { length: 500 }).notNull(),
  appKeywords: json("app_keywords").$type<string[]>(),
  appLogo: varchar("app_logo", { length: 255 }),
  appLogoHeader: varchar("app_logo_header", { length: 255 }),
  appFavicon: varchar("app_favicon", { length: 255 }),
  appTheme: varchar("app_theme", { length: 50 }).default("default"),

  socialLinks: json("social_links").$type<{
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
    tiktok?: string;
  }>(),

  address: varchar("address", { length: 500 }),

  // Contact
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  contactWhatsapp: varchar("contact_whatsapp", { length: 50 }),

  // Footer
  footerText: varchar("footer_text", { length: 500 }),

  // SEO
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: varchar("meta_description", { length: 500 }),
  metaImage: varchar("meta_image", { length: 255 }),
  metaUrl: varchar("meta_url", { length: 255 }),

  // Map Embed
  mapEmbedUrl: varchar("map_embed_url", { length: 500 }),

  // Maintenance Mode
  maintenanceMode: boolean("maintenance_mode").default(false).notNull(),
  maintenanceMessage: varchar("maintenance_message", { length: 500 }),

  // Analytics
  googleAnalyticsId: varchar("google_analytics_id", { length: 100 }),

  // Audit
  createdAt: timestamp("created_at").defaultNow().notNull(), // tambahan
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
