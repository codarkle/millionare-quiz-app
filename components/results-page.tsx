"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { saveQuizResult } from "@/lib/actions"

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [prize, setPrize] = useState(0)
  const [resultSaved, setResultSaved] = useState(false)
  const result = searchParams.get("result") || "lose"

  const prizeValues = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000]

  useEffect(() => {
    const shown = searchParams.get("shown")

    if (shown) {
      setPrize(prizeValues[Number.parseInt(shown, 10)])
    }

    // Save the quiz result to the database
    const saveResult = async () => {
      if (shown && !resultSaved) {
        await saveQuizResult(Number.parseInt(shown, 10), 15)
        setResultSaved(true)
      }
    }

    saveResult()
  }, [searchParams, resultSaved])

  const handleReturnHome = () => {
    router.push("/")
  }

  return (
    <div
    className="min-h-screen flex flex-col items-center justify-center millionaire-bg"
    style={{ backgroundImage: "url('/image/stage.jpg')" }}
    > 
    <div className="text-center">
      {(result === "win" || result === "walk") && (
        <>
          <div className="flex justify-center mb-8">
            <div className="floating-logo">
              <Image
                src={"/image/"+result+".jpg"}
                alt="Who Wants To Be A Millionaire"
                width={300}
                height={300}
                className="rounded-full"
              />
            </div>
          </div>

          <div className="bg-black/70 rounded-lg p-8 backdrop-blur-sm">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{result=="win"?"Congratulations!":"Well done!"}</h1>

            <h2 className="text-3xl md:text-5xl font-bold text-yellow-400 mb-8">
              You won ${prize.toLocaleString()}
            </h2>

            <div className="flex flex-col gap-4 mt-8 items-center">
                <Button variant="outline" size="lg" className="w-48 h-14 text-xl" onClick={handleReturnHome}>
                  Home
                </Button>
            </div>
          </div>
        </>
      )}

      {result === "lose" && (
        <div className="bg-black/70 rounded-lg p-8 backdrop-blur-sm">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Game Over</h1>

          {prize > 0 ? (
            <h2 className="text-3xl md:text-5xl font-bold text-yellow-400 mb-8">
              You won ${prize.toLocaleString()}
            </h2>
          ) : (
            <h2 className="text-2xl font-bold text-white mb-8">Better luck next time!</h2>
          )}

          <div className="flex flex-col gap-4 mt-8">
              <Button variant="outline" size="lg" className="w-48 h-14 text-xl" onClick={handleReturnHome}>
                Home
              </Button>
          </div>
        </div>
      )}
    </div>
  </div>
  )
}
