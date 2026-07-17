export interface DashboardStats {
  post: number;
  pages: number;
  announcements: number;
  menus: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentPost: Array<{
    id: number;
    title: string;
    isPublished: boolean;
    createdAt: string;
    thumbnail: { path: string } | null;
  }>;
}

export function getDashboard() {
  return $fetch<{ success: boolean; message: string; data: DashboardData }>(
    "/api/_admins/dashboard",
  );
}
