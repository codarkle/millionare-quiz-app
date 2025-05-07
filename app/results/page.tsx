import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import ResultsPage from "@/components/results-page"

export default async function Results() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return <ResultsPage />
}
