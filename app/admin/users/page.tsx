import { requireAdmin } from "@/lib/auth"
import AdminUsersPage from "@/components/admin-users-page"

export default async function AdminUsers() {
  await requireAdmin()

  return <AdminUsersPage />
}
