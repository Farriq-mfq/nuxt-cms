<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Pengaturan Website' })
import { BASE_THEMES } from '~~/server/utils/theme'
const { can } = useAuth()

if (!can('setting')) {
    throw createError({ statusCode: 403, statusMessage: 'Kamu tidak memiliki akses ke halaman ini', fatal: true })
}

const formRef = ref()

const { data: settingData, pending } = await useFetch('/api/setting')

const themeOptions = BASE_THEMES.map((t) => ({ label: t.label, value: t.name }))

const fields = [
    { name: 'app_name', label: 'Nama Website', type: 'text', required: true },
    { name: 'app_description', label: 'Deskripsi Website', type: 'textarea', required: true },
    { name: 'app_theme', label: 'Tema Website', type: 'select', options: themeOptions, required: false },

    { name: 'app_logo', label: 'Logo', type: 'file', accept: 'image/png,image/jpeg,image/webp', required: false },
    { name: 'app_logo_header', label: 'Logo Header', type: 'file', accept: 'image/png,image/jpeg,image/webp', required: false },
    { name: 'app_favicon', label: 'Favicon', type: 'file', accept: 'image/x-icon,image/png', required: false },

    { name: 'address', label: 'Alamat', type: 'textarea', required: false },
    { name: 'contact_email', label: 'Email Kontak', type: 'text', required: false },
    { name: 'contact_phone', label: 'Telepon', type: 'text', required: false },
    { name: 'contact_whatsapp', label: 'WhatsApp', type: 'text', required: false },

    { name: 'facebook', label: 'Facebook', type: 'text', required: false },
    { name: 'instagram', label: 'Instagram', type: 'text', required: false },
    { name: 'twitter', label: 'Twitter / X', type: 'text', required: false },
    { name: 'youtube', label: 'YouTube', type: 'text', required: false },
    { name: 'linkedin', label: 'LinkedIn', type: 'text', required: false },
    { name: 'tiktok', label: 'TikTok', type: 'text', required: false },

    { name: 'footer_text', label: 'Teks Footer', type: 'text', required: false },

    { name: 'meta_title', label: 'Meta Title (SEO)', type: 'text', required: false },
    { name: 'meta_description', label: 'Meta Description (SEO)', type: 'textarea', required: false },
    { name: 'meta_image', label: 'Meta Image (SEO)', type: 'file', accept: 'image/png,image/jpeg,image/webp', required: false },
    { name: 'meta_url', label: 'Meta URL', type: 'text', required: false },

    { name: 'map_embed_url', label: 'URL Embed Peta', type: 'text', required: false },

    { name: 'maintenance_mode', label: 'Mode Maintenance', type: 'switch', required: false },
    { name: 'maintenance_message', label: 'Pesan Maintenance', type: 'textarea', required: false },

    { name: 'google_analytics_id', label: 'Google Analytics ID', type: 'text', required: false },
]

const initialData = computed(() => {
    const s = settingData.value?.data
    if (!s) return {}

    return {
        app_name: s.appName,
        app_description: s.appDescription,
        app_theme: s.appTheme,
        app_logo: s.appLogo,
        app_logo_header: s.appLogoHeader,
        app_favicon: s.appFavicon,
        address: s.address,
        contact_email: s.contactEmail,
        contact_phone: s.contactPhone,
        contact_whatsapp: s.contactWhatsapp,
        facebook: s.socialLinks?.facebook,
        instagram: s.socialLinks?.instagram,
        twitter: s.socialLinks?.twitter,
        youtube: s.socialLinks?.youtube,
        linkedin: s.socialLinks?.linkedin,
        tiktok: s.socialLinks?.tiktok,
        footer_text: s.footerText,
        meta_title: s.metaTitle,
        meta_description: s.metaDescription,
        meta_image: s.metaImage,
        meta_url: s.metaUrl,
        map_embed_url: s.mapEmbedUrl,
        maintenance_mode: Boolean(s.maintenanceMode),
        maintenance_message: s.maintenanceMessage,
        google_analytics_id: s.googleAnalyticsId,
    }
})

</script>

<template>
    <div class="max-w-full p-5 border border-outline-variant shadow-layer-1 rounded">
        <h1 class="text-headline-lg mb-md">Pengaturan Website</h1>

        <AdminFormBase v-if="!pending" ref="formRef" :initial-data="initialData" :fields="fields"
            :mutation="updateSetting" submit-label="Simpan Pengaturan"
            success-message="Pengaturan berhasil disimpan, Silahkan refresh halaman"
            error-message="Gagal menyimpan pengaturan" />
    </div>
</template>