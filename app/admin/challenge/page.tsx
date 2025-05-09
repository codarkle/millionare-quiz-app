import { requireAdmin } from "@/lib/auth"
import AdminChallengePage from "@/components/admin-challenge"

export default async function AdminChallenge() {
  await requireAdmin()

  return <AdminChallengePage />
}
