import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import UserProfilePage from "@/components/user-profile-page"

export default async function Profile() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return <UserProfilePage user={user} />
}
