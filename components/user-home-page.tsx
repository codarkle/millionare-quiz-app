"use client"

import { useState, useEffect } from "react"
import { getQuestionsFromEnabledCategories } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/ui/navigation"

export default function UserHomePage() {
  const router = useRouter()
  const [hasQuestions, setHasQuestions] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkQuestions = async () => {
      try {
        const questions = await getQuestionsFromEnabledCategories()
        setHasQuestions(questions.length > 0)
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to check questions:", error)
        setIsLoading(false)
      }
    }

    checkQuestions()
  }, [])

  const handleStartQuiz = () => {
    router.push("/show")
  }

  return (
    <div className="min-h-screen flex flex-col millionaire-bg" style={{ backgroundImage: "url('/image/stage.jpg')" }}>
      <Navigation />

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center"> 
          {isLoading ? (
            <p>Loading...</p>
          ) : !hasQuestions ? (
            <div className="text-center mb-8">
              <p className="text-muted-foreground mb-2">
                There are no contests.
              </p>
            </div>
          ) : (
            <button className="start-button" onClick={handleStartQuiz}>Start</button>
          )} 
        </div>
      </main>
    </div>
  )
}
