import { requireAdmin } from "@/lib/auth"
import AdminCategoriesPage from "@/components/admin-categories-page"

export default async function AdminCategories() {
  await requireAdmin()

  return <AdminCategoriesPage />
}
