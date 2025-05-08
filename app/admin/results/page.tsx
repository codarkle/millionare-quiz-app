import { requireAdmin } from "@/lib/auth"
import AdminResultsPage from "@/components/admin-results-page"

export default async function AdminResults() {
  await requireAdmin()

  return <AdminResultsPage />
}
