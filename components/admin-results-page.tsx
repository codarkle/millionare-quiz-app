"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, RotateCcw, Trophy } from "lucide-react"
import { logout, saveQuizResult } from "@/lib/actions"

// Prize ladder configuration
const PRIZE_LADDER = [
  { level: 15, amount: "1,000,000", milestone: true },
  { level: 14, amount: "500,000", milestone: false },
  { level: 13, amount: "250,000", milestone: false },
  { level: 12, amount: "125,000", milestone: false },
  { level: 11, amount: "64,000", milestone: false },
  { level: 10, amount: "32,000", milestone: true },
  { level: 9, amount: "16,000", milestone: false },
  { level: 8, amount: "8,000", milestone: false },
  { level: 7, amount: "4,000", milestone: false },
  { level: 6, amount: "2,000", milestone: false },
  { level: 5, amount: "1,000", milestone: true },
  { level: 4, amount: "500", milestone: false },
  { level: 3, amount: "300", milestone: false },
  { level: 2, amount: "200", milestone: false },
  { level: 1, amount: "100", milestone: false },
]

export default function AdminResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [questionsShown, setQuestionsShown] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [isChallenge, setIsChallenge] = useState(false)
  const [isWalkaway, setIsWalkaway] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [resultSaved, setResultSaved] = useState(false)

  useEffect(() => {
    const shown = searchParams.get("shown")
    const total = searchParams.get("total")
    const challenge = searchParams.get("challenge")
    const walkaway = searchParams.get("walkaway")
    const completed = searchParams.get("completed")

    if (shown) {
      setQuestionsShown(Number.parseInt(shown, 10))
    }

    if (total) {
      setTotalQuestions(Number.parseInt(total, 10))
    }

    if (challenge === "true") {
      setIsChallenge(true)
    }

    if (walkaway === "true") {
      setIsWalkaway(true)
    }

    if (completed === "true") {
      setIsCompleted(true)
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
    router.push("/admin/categories")
  }

  const handleTryAgain = () => {
    router.push("/admin/challenge")
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  // Get current prize level
  const getCurrentPrize = () => {
    return PRIZE_LADDER.find((prize) => prize.level === questionsShown) || PRIZE_LADDER[0]
  }

  const currentPrize = getCurrentPrize()

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Challenge Results</h1>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-center">
            {isChallenge && isCompleted && questionsShown === 15
              ? "Challenge Winner!"
              : isChallenge && isWalkaway
                ? "Challenge Over"
                : "Challenge Results"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {/* Display appropriate image based on questions shown */}
          {isChallenge && (
            <div className="mb-6 text-center">
              {questionsShown === 15 && isCompleted ? (
                <>
                  <div className="mb-4">
                    <img
                      src="/image/gold.jpg"
                      alt="Winner"
                      className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                      style={{ maxHeight: "200px" }}
                    />
                  </div>
                  <div className="text-4xl font-bold text-green-600 mb-2">$1,000,000</div>
                  <div className="text-xl font-semibold">Congratulations! You've won the grand prize!</div>
                </>
              ) : questionsShown > 10 ? (
                <>
                  <div className="mb-4">
                    <img
                      src="/image/silver.jpg"
                      alt="Silver Medal"
                      className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                      style={{ maxHeight: "200px" }}
                    />
                  </div>
                  <div className="text-3xl font-bold text-gray-700 mb-2">$32,000</div>
                  <div className="text-xl font-semibold">Great job reaching the silver tier!</div>
                </>
              ) : questionsShown > 5 ? (
                <>
                  <div className="mb-4">
                    <img
                      src="/image/bronze.jpg"
                      alt="Bronze Medal"
                      className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                      style={{ maxHeight: "200px" }}
                    />
                  </div>
                  <div className="text-3xl font-bold text-amber-700 mb-2">$1000</div>
                  <div className="text-xl font-semibold">You've reached the bronze tier!</div>
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold mb-2">Loser</div>
                  <div className="text-xl font-semibold">You've earned a prize!</div>
                </>
              )}
            </div>
          )}

          <div className="text-center mb-6">
            <div className="text-2xl font-bold mb-2">
              {questionsShown} of {totalQuestions} Questions Completed
            </div>
            {isWalkaway && <p className="text-muted-foreground">You walked away with ${currentPrize.amount}</p>}
          </div>

          {/* Prize ladder summary */}
          {isChallenge && (
            <div className="w-full max-w-md mb-6 border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-center">Prize Ladder Progress</h3>
              <div className="space-y-1">
                {PRIZE_LADDER.slice(0, 5)
                  .reverse()
                  .map((prize) => (
                    <div
                      key={prize.level}
                      className={`
                      p-2 rounded-md flex justify-between items-center text-sm
                      ${prize.level === questionsShown ? "bg-primary text-primary-foreground font-bold" : ""}
                      ${prize.level <= questionsShown ? "text-black" : "text-muted-foreground"}
                      ${prize.milestone ? "border-l-4 border-amber-500" : ""}
                    `}
                    >
                      <span>Q{prize.level}</span>
                      <span className="font-semibold">${prize.amount}</span>
                      {prize.level === questionsShown && <Trophy className="h-4 w-4 ml-2 text-yellow-400" />}
                    </div>
                  ))}
              </div>
            </div>
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
