import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import ShowQuiz from "@/components/show-quiz"

export default async function ShowPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return <ShowQuiz />
}
