import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import UserHomePage from "@/components/user-home-page"

export default async function Home() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role === "administrator") {
    redirect("/admin")
  }

  return <UserHomePage />
}
