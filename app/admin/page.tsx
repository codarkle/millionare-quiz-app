import { requireAdmin } from "@/lib/auth"
import AdminHomePage from "@/components/admin-home-page"

export default async function AdminChallenge() {
  await requireAdmin()

  return <AdminHomePage />
}
