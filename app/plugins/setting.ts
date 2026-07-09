export interface SettingData {
  id: number;
  appName: string;
  appDescription: string;
  appKeywords: string[] | null;
  appLogo: string | null;
  appLogoHeader: string | null;
  appFavicon: string | null;
  appTheme: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
    tiktok?: string;
  } | null;
  address: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  footerText: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaImage: string | null;
  metaUrl: string | null;
  mapEmbedUrl: string | null;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  googleAnalyticsId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SettingResponse {
  success: boolean;
  message: string;
  data: SettingData | null;
}

export default defineNuxtPlugin(async () => {
  const setting = useState<SettingData | null>("app-setting", () => null);

  const { data } = await useAsyncData<SettingResponse>("app-setting", () =>
    $fetch("/api/setting"),
  );

  if (data.value?.data) {
    setting.value = data.value.data;
  }

  const themeCookie = useCookie("app-theme");

  if (!themeCookie.value && setting.value?.appTheme) {
    const { setTheme } = useTheme();
    setTheme(setting.value.appTheme as any);
  }
});
