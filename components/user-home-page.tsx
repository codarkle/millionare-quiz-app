"use client"

import { useState, useEffect } from "react"
import { getQuestionsFromEnabledCategories, logout } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Play, LogOut, User } from "lucide-react"

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

  const handleViewProfile = () => {
    router.push("/profile")
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quiz App</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleViewProfile}>
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold mb-8 text-center">Welcome to the Quiz App</h2>

        {isLoading ? (
          <p>Loading...</p>
        ) : !hasQuestions ? (
          <div className="text-center mb-8">
            <p className="text-muted-foreground mb-2">
              There are no questions available. Please contact an administrator.
            </p>
          </div>
        ) : (
          <Button size="lg" className="px-12 py-6 text-lg" onClick={handleStartQuiz}>
            <Play className="h-6 w-6 mr-2" />
            Start Quiz
          </Button>
        )}
      </div>
    </main>
  )
}
