"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getQuestionsFromCategories } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

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

export default function ShowPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoriesParam = searchParams.get("categories")

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!categoriesParam) {
          router.push("/")
          return
        }

        const categoryIds = categoriesParam.split(",").map((id) => Number.parseInt(id))
        const questionsData = await getQuestionsFromCategories(categoryIds)
        setQuestions(questionsData)
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [categoriesParam, router])

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
    } else {
      alert("Finish!")
      router.push("/")
    }
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
            <p>There are no questions available in the selected categories. Please create some questions first.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/")}>Back to Home</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quiz</h1>
        <div className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col gap-2">
            <div className="text-sm text-muted-foreground">Category: {currentQuestion.category}</div>
            <CardTitle>{currentQuestion.question}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedAnswer || ""} onValueChange={setSelectedAnswer} className="space-y-4">
            {currentQuestion.answers.map((answer) => (
              <div
                key={answer.id}
                className="flex items-center space-x-2 border p-4 rounded-md hover:bg-gray-50 transition-colors"
              >
                <RadioGroupItem value={answer.id.toString()} id={`answer-${answer.id}`} />
                <Label htmlFor={`answer-${answer.id}`} className="flex-grow cursor-pointer">
                  {answer.answer}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/")}>
            Back to Home
          </Button>
          <Button onClick={handleNextQuestion}>
            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
          </Button>
        </CardFooter>
      </Card>

      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-primary h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>
    </main>
  )
}
