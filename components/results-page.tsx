"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, RotateCcw, User } from "lucide-react"
import { logout, saveQuizResult } from "@/lib/actions"

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [questionsShown, setQuestionsShown] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [resultSaved, setResultSaved] = useState(false)

  useEffect(() => {
    const shown = searchParams.get("shown")
    const total = searchParams.get("total")

    if (shown) {
      setQuestionsShown(Number.parseInt(shown, 10))
    }

    if (total) {
      setTotalQuestions(Number.parseInt(total, 10))
    }

    // Save the quiz result to the database
    const saveResult = async () => {
      if (shown && total && !resultSaved) {
        await saveQuizResult(Number.parseInt(shown, 10), Number.parseInt(total, 10))
        setResultSaved(true)
      }
    }

    saveResult()
  }, [searchParams, resultSaved])

  const handleReturnHome = () => {
    router.push("/")
  }

  const handleTryAgain = () => {
    router.push("/show")
  }

  const handleViewProfile = () => {
    router.push("/profile")
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quiz Results</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleViewProfile}>
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-center">Quiz Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold mb-2">{questionsShown}</div>
            <p className="text-muted-foreground">Questions completed out of {totalQuestions}</p>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
            <div
              className="bg-primary h-4 rounded-full transition-all duration-300"
              style={{ width: `${(questionsShown / totalQuestions) * 100}%` }}
            ></div>
          </div>

          {questionsShown === 0 ? (
            <p className="text-center text-muted-foreground mb-4">
              You didn't answer any questions. Try again to test your knowledge!
            </p>
          ) : questionsShown < totalQuestions ? (
            <p className="text-center text-muted-foreground mb-4">
              You completed {Math.round((questionsShown / totalQuestions) * 100)}% of the quiz.
            </p>
          ) : (
            <p className="text-center text-muted-foreground mb-4">Congratulations! You completed the entire quiz.</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="outline" onClick={handleReturnHome}>
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
          <Button onClick={handleTryAgain}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
