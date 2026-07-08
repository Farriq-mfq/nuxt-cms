import type { SettingData } from "~~/app/plugins/setting";

export function updateSetting(payload: Record<string, any>) {
  const formData = new FormData();

  formData.append("app_name", payload.app_name ?? "");
  formData.append("app_description", payload.app_description ?? "");

  if (payload.app_keywords)
    formData.append("app_keywords", JSON.stringify(payload.app_keywords));
  if (payload.app_theme) formData.append("app_theme", payload.app_theme);

  const socialLinks = {
    facebook: payload.facebook,
    instagram: payload.instagram,
    twitter: payload.twitter,
    youtube: payload.youtube,
    linkedin: payload.linkedin,
    tiktok: payload.tiktok,
  };
  formData.append("social_links", JSON.stringify(socialLinks));

  if (payload.address) formData.append("address", payload.address);
  if (payload.contact_email)
    formData.append("contact_email", payload.contact_email);
  if (payload.contact_phone)
    formData.append("contact_phone", payload.contact_phone);
  if (payload.contact_whatsapp)
    formData.append("contact_whatsapp", payload.contact_whatsapp);
  if (payload.footer_text) formData.append("footer_text", payload.footer_text);
  if (payload.meta_title) formData.append("meta_title", payload.meta_title);
  if (payload.meta_description)
    formData.append("meta_description", payload.meta_description);
  if (payload.meta_url) formData.append("meta_url", payload.meta_url);
  if (payload.map_embed_url)
    formData.append("map_embed_url", payload.map_embed_url);

  formData.append(
    "maintenance_mode",
    String(payload.maintenance_mode ?? false),
  );
  if (payload.maintenance_message)
    formData.append("maintenance_message", payload.maintenance_message);
  if (payload.google_analytics_id)
    formData.append("google_analytics_id", payload.google_analytics_id);

  if (payload.app_logo instanceof File)
    formData.append("app_logo", payload.app_logo);
  if (payload.app_logo_header instanceof File)
    formData.append("app_logo_header", payload.app_logo_header);
  if (payload.app_favicon instanceof File)
    formData.append("app_favicon", payload.app_favicon);
  if (payload.meta_image instanceof File)
    formData.append("meta_image", payload.meta_image);

  return $fetch("/api/_admins/setting", { method: "POST", body: formData });
}

export function useSetting() {
  const setting = useState<SettingData | null>("app-setting", () => null);

  async function refresh() {
    const res = await $fetch<{ success: boolean; data: SettingData | null }>(
      "/api/setting",
    );
    setting.value = res.data;
    return setting.value;
  }

  return {
    setting: readonly(setting),
    refresh,
  };
}
