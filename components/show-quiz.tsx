"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getQuestionsFromEnabledCategories } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Message } from "@/components/ui/message"
import { saveQuizResult } from "@/lib/actions"

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

export default function ShowQuiz() {
  const router = useRouter()

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showingAnswer, setShowingAnswer] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: "info" | "success" | "warning" | "error" } | null>(null)
  const [shuffledAnswers, setShuffledAnswers] = useState<Answer[]>([])
  const [removedAnswers, setRemovedAnswers] = useState<number[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null)

  const handleAnswerClick = (answer: Answer) => {
    setSelectedAnswer(answer)
  
    if (answer.isCorrect) {
      setShowingAnswer(true) // highlight correct answer
    } else {
      // Wrong answer → end the game immediately
      router.push(`/results?prize=${currentQuestionIndex > 0 ? prizeValues[currentQuestionIndex - 1] : 0}&result=lose`)
    }
  }

  const [lifelines, setLifelines] = useState({
    fiftyFifty: true,
    askAudience: true,
    phoneAFriend: true,
    switch: true,
    double: true,
  })

  const prizeValues = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000]
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const questionsData = await getQuestionsFromEnabledCategories()
        setQuestions(questionsData)
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      // Shuffle answers when question changes
      const answers = [...questions[currentQuestionIndex].answers]
      shuffleArray(answers)
      setShuffledAnswers(answers)
      setRemovedAnswers([])
    }
  }, [questions, currentQuestionIndex])

  const currentQuestion = questions[currentQuestionIndex]
  
  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  const handleShowResult = async () => {
    await saveQuizResult(currentQuestionIndex+1, 15)
    if(currentQuestionIndex < 14){
      router.push(`/results?prize=${prizeValues[currentQuestionIndex]}&result=walk`)
    }
    else{
      router.push(`/results?prize=${prizeValues[currentQuestionIndex]}&result=win`)
    }
  }

  const handleButtonClick = async () => {
    if (showingAnswer) {
      // If we're showing the answer, move to the next question
      if (currentQuestionIndex < questions.length - 1  && currentQuestionIndex < 14) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setShowingAnswer(false)
      } else {
        // Navigate to results page with all questions completed 
        handleShowResult();
      }
    } else {
      // If we're not showing the answer, show it
      setShowingAnswer(true)
    }
  } 

  const handleUseLifeline = (lifeline: keyof typeof lifelines) => {
    if (!lifelines[lifeline]) return

    setLifelines((prev) => ({
      ...prev,
      [lifeline]: false,
    }))

    switch (lifeline) {
      case "fiftyFifty":
        // Remove two incorrect answers
        if (!currentQuestion) return

        const incorrectAnswers = shuffledAnswers
          .filter((answer) => !answer.isCorrect)
          .map((answer) => answer.id)

        shuffleArray(incorrectAnswers)
        const toRemove = incorrectAnswers.slice(0, 2)
        setRemovedAnswers(toRemove)
        break

      case "askAudience":
        // Show audience poll
        const correctAnswer = shuffledAnswers.find((answer) => answer.isCorrect)
        setMessage({
          text: `The audience thinks the answer is: ${correctAnswer?.answer}`,
          type: "info"
        })
        break

      case "phoneAFriend":
        // Show phone a friend hint
        const friendAnswer = shuffledAnswers.find((answer) => answer.isCorrect)
        setMessage({
          text: `Your friend says: I think the answer is ${friendAnswer?.answer}`,
          type: "info"
        })
        break

      case "switch":
        // Switch to a different question
        if (questions.length <= currentQuestionIndex + 1) {
          setMessage({
            text: "No more questions available to switch to!",
            type: "error"
          })
          return
        }

        // Move to next question without changing prize level
        setQuestions(prev => prev.slice(1));
        setShowingAnswer(false);
        break
      case "double":
        if (questions.length <= currentQuestionIndex + 1) {
          setMessage({
            text: "No more questions available to switch to!",
            type: "error"
          })
          return
        }
        setCurrentQuestionIndex((prev) => prev + 1);
        setShowingAnswer(false);
        break
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
            <p>There are no questions.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/")}>Back to Home</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }



  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        {message && (
          <Message
            message={message.text}
            type={message.type}
            onClose={() => setMessage(null)}
            duration={5000}
          />
        )}
        
        {/* Left Column with Background Image */}
        <div className="w-[80%] flex millionaire-bg" style={{ backgroundImage: "url('/image/play.jpg')" }}>
          {/* Lifelines */}
          <div className="w-1/6 flex flex-col items-center justify-center gap-4">
            <div
              className={`lifeline ${!lifelines.fiftyFifty ? "used" : ""}`}
              onClick={() => handleUseLifeline("fiftyFifty")}
            >
              <Image src="/image/5050.jpg" alt="50:50" width={60} height={60} className="cursor-pointer rounded-full" />
            </div>
            <div
              className={`lifeline ${!lifelines.askAudience ? "used" : ""}`}
              onClick={() => handleUseLifeline("askAudience")}
            >
              <Image src="/image/ata.jpg" alt="Ask the Audience" width={60} height={60} className="cursor-pointer rounded-full" />
            </div>
            <div
              className={`lifeline ${!lifelines.phoneAFriend ? "used" : ""}`}
              onClick={() => handleUseLifeline("phoneAFriend")}
            >
              <Image src="/image/paf.jpg" alt="Phone a Friend" width={60} height={60} className="cursor-pointer rounded-full" />
            </div>
            <div className={`lifeline ${!lifelines.switch ? "used" : ""}`} 
              onClick={() => handleUseLifeline("switch")
            }>
              <Image src="/image/switch.jpg" alt="Switch" width={60} height={60} className="cursor-pointer rounded-full" />
            </div>
            <div className={`lifeline ${!lifelines.double ? "used" : ""}`}
              onClick={()=>handleUseLifeline("double")}
            >
              <Image src="/image/double.jpg" alt="Double Dip" width={60} height={60} className="cursor-pointer rounded-full" />
            </div>
            <Button variant="destructive" onClick={handleShowResult}>
                Walk Away
            </Button>
          </div>

          {/* Question and Answers */}
          <div className="w-4/6 flex flex-col items-center justify-center p-4" style={{ marginTop: "5%" }}>
            <div className="bg-black/70 rounded-lg p-6 mb-6 max-w-3xl w-full">
              <h2 className="text-xl font-bold text-center mb-8">Question {currentQuestionIndex + 1}  ( {currentQuestion.category} )</h2>
              <p className="text-lg text-center mb-8">{currentQuestion.question}</p>

              <div className="grid grid-cols-2 gap-3">
                {shuffledAnswers.map((answer, index) => {
                  const isRemoved = removedAnswers.includes(Number(answer.id))
                  const letterLabel = String.fromCharCode(65 + index)

                  return (
                    <div
                      key={answer.id}
                      onClick={() => handleAnswerClick(answer)}
                      className={`answer-option cursor-pointer
                        ${showingAnswer && answer.isCorrect ? "correct" : ""}
                        ${selectedAnswer && selectedAnswer.id === answer.id && !answer.isCorrect ? "wrong" : ""}
                        ${removedAnswers.includes(Number(answer.id)) ? "opacity-0 pointer-events-none" : ""}
                      `}
                    >
                      {letterLabel}: {answer.answer}
                    </div>
                  )
                })}
              </div>
            </div> 
          </div>

          {/* Next or Walk away */}
          <div className="w-1/6 flex flex-col items-center justify-center pt-8">
          {showingAnswer && (
            <Button onClick={handleButtonClick}>
              {currentQuestionIndex < 14 ? "Next" : "Finish"}
            </Button>
          )}
          </div>
        </div>

        {/* Right Column with Dark Background */}
        <div className="w-[20%] bg-slate-900 p-4">
          <div className="prize-ladder h-full flex flex-col justify-between">
            {prizeValues
              .slice()
              .reverse()
              .map((prize, index) => {
                const questionIndex = 14 - index
                return (
                  <div
                    key={index}
                    className={`prize-ladder-item ${currentQuestionIndex === questionIndex ? "active" : ""} ${
                      questionIndex === 4 || questionIndex === 9 || questionIndex === 14 ? "milestone" : ""
                    }`}
                  >
                    ${prize.toLocaleString()}
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )  
}
