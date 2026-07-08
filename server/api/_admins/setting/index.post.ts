import { eq } from "drizzle-orm";
import { setting } from "~~/server/db/schema/setting";
import { db } from "~~/server/db";
import { updateSettingSchema } from "~~/server/validators/setting";
import { parseMultipartBody } from "~~/server/utils/multipart-body";
import {
  saveAssetImage,
  saveAssetRaw,
  deleteAssetFile,
} from "~~/server/utils/upload";

export default defineEventHandler(async (event) => {
  const { fields, files } = await parseMultipartBody(event);

  const rawBody = {
    app_name: fields.app_name,
    app_description: fields.app_description,
    app_keywords: fields.app_keywords,
    app_theme: fields.app_theme || undefined,
    social_links: fields.social_links,
    address: fields.address || undefined,
    contact_email: fields.contact_email || undefined,
    contact_phone: fields.contact_phone || undefined,
    contact_whatsapp: fields.contact_whatsapp || undefined,
    footer_text: fields.footer_text || undefined,
    meta_title: fields.meta_title || undefined,
    meta_description: fields.meta_description || undefined,
    meta_url: fields.meta_url || undefined,
    map_embed_url: fields.map_embed_url || undefined,
    maintenance_mode: fields.maintenance_mode,
    maintenance_message: fields.maintenance_message || undefined,
    google_analytics_id: fields.google_analytics_id || undefined,
  };

  const parsed = updateSettingSchema.safeParse(rawBody);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const data = parsed.data;

  const existing = await db
    .select()
    .from(setting)
    .where(eq(setting.id, 1))
    .limit(1);
  const existingSetting = existing[0];

  let appLogoPath: string | undefined;
  if (files.app_logo) {
    const uploaded = await saveAssetImage(files.app_logo, "images");
    appLogoPath = uploaded.path;
    if (existingSetting?.appLogo)
      await deleteAssetFile(existingSetting.appLogo);
  }

  let appLogoHeaderPath: string | undefined;
  if (files.app_logo_header) {
    const uploaded = await saveAssetImage(files.app_logo_header, "images");
    appLogoHeaderPath = uploaded.path;
    if (existingSetting?.appLogoHeader)
      await deleteAssetFile(existingSetting.appLogoHeader);
  }

  let appFaviconPath: string | undefined;
  if (files.app_favicon) {
    const uploaded = await saveAssetRaw(files.app_favicon, "favicon");
    appFaviconPath = uploaded.path;
    if (existingSetting?.appFavicon)
      await deleteAssetFile(existingSetting.appFavicon);
  }

  let metaImagePath: string | undefined;
  if (files.meta_image) {
    const uploaded = await saveAssetImage(files.meta_image, "images");
    metaImagePath = uploaded.path;
    if (existingSetting?.metaImage)
      await deleteAssetFile(existingSetting.metaImage);
  }

  const payload = {
    appName: data.app_name,
    appDescription: data.app_description,
    ...(data.app_keywords !== undefined && { appKeywords: data.app_keywords }),
    ...(data.app_theme !== undefined && { appTheme: data.app_theme }),
    ...(data.social_links !== undefined && { socialLinks: data.social_links }),
    ...(data.address !== undefined && { address: data.address }),
    ...(data.contact_email !== undefined && {
      contactEmail: data.contact_email,
    }),
    ...(data.contact_phone !== undefined && {
      contactPhone: data.contact_phone,
    }),
    ...(data.contact_whatsapp !== undefined && {
      contactWhatsapp: data.contact_whatsapp,
    }),
    ...(data.footer_text !== undefined && { footerText: data.footer_text }),
    ...(data.meta_title !== undefined && { metaTitle: data.meta_title }),
    ...(data.meta_description !== undefined && {
      metaDescription: data.meta_description,
    }),
    ...(data.meta_url !== undefined && { metaUrl: data.meta_url }),
    ...(data.map_embed_url !== undefined && {
      mapEmbedUrl: data.map_embed_url,
    }),
    maintenanceMode: data.maintenance_mode,
    ...(data.maintenance_message !== undefined && {
      maintenanceMessage: data.maintenance_message,
    }),
    ...(data.google_analytics_id !== undefined && {
      googleAnalyticsId: data.google_analytics_id,
    }),
    ...(appLogoPath !== undefined && { appLogo: appLogoPath }),
    ...(appLogoHeaderPath !== undefined && {
      appLogoHeader: appLogoHeaderPath,
    }),
    ...(appFaviconPath !== undefined && { appFavicon: appFaviconPath }),
    ...(metaImagePath !== undefined && { metaImage: metaImagePath }),
  };

  if (existingSetting) {
    await db.update(setting).set(payload).where(eq(setting.id, 1));
  } else {
    await db.insert(setting).values({ id: 1, ...payload });
  }

  return successResponse({ id: 1 }, "Pengaturan berhasil disimpan");
});
