"use client"

import { useState, useEffect } from "react"
import { logout } from "@/lib/actions" 
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button" 
import { LogOut, User, Trophy, LayoutGrid, HelpCircle } from "lucide-react" 
import { getQuestionsFromEnabledCategories } from "@/lib/actions"
import { useRouter } from "next/navigation"

export default function AdminCategoriesPage() {
  const router = useRouter() 
 
  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

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
    router.push("/admin/challenge")
  }

  return (
    <div className="min-h-screen flex flex-col millionaire-bg" style={{ backgroundImage: "url('/image/stage.jpg')" }}>
      <header className="p-2 bg-black/50 flex items-center">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Image
              src="/image/logo.jpg"
              alt="Who Wants To Be A Millionaire Logo"
              width={100}
              height={100}
              className="rounded-full"
            />
          </Link>
          <h2 className="text-3xl font-bold text-white">Millionaire Quiz Show</h2>
        </div>
        <div className="flex gap-4">
            <HelpCircle size="32" onClick={() => router.push("/help")} style={{cursor:"pointer",marginRight:"30px"}}/>
            <LayoutGrid size="32" onClick={() => router.push("/admin/categories")} style={{cursor:"pointer",marginRight:"30px"}} />
            <User size="32" onClick={() => router.push("/admin/users")} style={{cursor:"pointer",marginRight:"30px"}}/>
            <LogOut size="32" onClick={handleLogout} style={{cursor:"pointer",marginRight:"30px"}}/>
        </div>
      </div>
    </header>
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
