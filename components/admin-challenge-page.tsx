"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getQuestionsFromEnabledCategories, logout } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, DoorOpen, Trophy } from "lucide-react"

type Answer = {
  id: number
  answer: string
  isCorrect: boolean
}

type Question = {
  id: number
  question: string
  category: string
  answers: Answer[]
}

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

export default function AdminChallengePage() {
  const router = useRouter()

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showingAnswer, setShowingAnswer] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const questionsData = await getQuestionsFromEnabledCategories()

        // Limit to 15 questions for the challenge
        const limitedQuestions = questionsData.slice(0, 15)
        setQuestions(limitedQuestions)
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleButtonClick = () => {
    if (showingAnswer) {
      // If we're showing the answer, move to the next question
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setSelectedAnswer(null)
        setShowingAnswer(false)
      } else {
        // Navigate to results page with all questions completed
        router.push(`/admin/results?shown=${questions.length}&total=${questions.length}&challenge=true&completed=true`)
      }
    } else {
      // If we're not showing the answer, show it
      setShowingAnswer(true)
    }
  }

  const handleWalkAway = () => {
    // Navigate to results page with current progress
    router.push(
      `/admin/results?shown=${currentQuestionIndex + 1}&total=${questions.length}&challenge=true&walkaway=true`,
    )
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  // Get current prize level
  const getCurrentPrize = () => {
    const currentLevel = currentQuestionIndex + 1
    return PRIZE_LADDER.find((prize) => prize.level === currentLevel) || PRIZE_LADDER[0]
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[50vh]">
        <p>Loading questions...</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>No Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There are no questions available in the enabled categories. Please select different categories.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/admin/categories")}>Back to Categories</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentPrize = getCurrentPrize()

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Challenge Mode</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Prize Ladder */}
        <div className="order-2 md:order-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Prize Ladder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {PRIZE_LADDER.map((prize) => (
                  <div
                    key={prize.level}
                    className={`
                      p-2 rounded-md flex justify-between items-center
                      ${prize.level === currentQuestionIndex + 1 ? "bg-primary text-primary-foreground font-bold" : ""}
                      ${prize.level < currentQuestionIndex + 1 ? "text-muted-foreground" : ""}
                      ${prize.milestone ? "border-l-4 border-amber-500" : ""}
                    `}
                  >
                    <span>Question {prize.level}</span>
                    <span className="font-semibold">${prize.amount}</span>
                    {prize.level === currentQuestionIndex + 1 && <Trophy className="h-4 w-4 ml-2 text-yellow-400" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Card */}
        <div className="order-1 md:order-2 md:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col gap-2">
                <div className="text-sm text-muted-foreground">Category: {currentQuestion.category}</div>
                <CardTitle>{currentQuestion.question}</CardTitle>
                <div className="text-sm font-semibold text-primary">Current Prize: ${currentPrize.amount}</div>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedAnswer || ""} onValueChange={setSelectedAnswer} className="space-y-4">
                {currentQuestion.answers.map((answer) => (
                  <div
                    key={answer.id}
                    className={`flex items-center space-x-2 border p-4 rounded-md hover:bg-gray-50 transition-colors ${
                      showingAnswer && answer.isCorrect ? "bg-green-100 border-green-500" : ""
                    }`}
                  >
                    <RadioGroupItem value={answer.id.toString()} id={`answer-${answer.id}`} />
                    <Label
                      htmlFor={`answer-${answer.id}`}
                      className={`flex-grow cursor-pointer ${
                        showingAnswer && answer.isCorrect ? "font-bold text-green-700" : ""
                      }`}
                    >
                      {answer.answer}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleWalkAway}>
                <DoorOpen className="h-4 w-4 mr-2" />
                Walk Away with ${currentPrize.amount}
              </Button>
              <Button onClick={handleButtonClick} disabled={!selectedAnswer && !showingAnswer}>
                {showingAnswer
                  ? currentQuestionIndex < questions.length - 1
                    ? "Next Question"
                    : "Finish Challenge"
                  : "Show Correct Answer"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  )
}
