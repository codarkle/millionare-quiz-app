import { requireAdmin } from "@/lib/auth"
import AdminCategoryPage from "@/components/admin-category-page"

export default async function AdminCategoryDetail({ params }: { params: { id: string } }) {
  await requireAdmin()

  return <AdminCategoryPage categoryId={Number.parseInt(params.id)} />
}
