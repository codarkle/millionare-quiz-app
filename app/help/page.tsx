import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Navigation } from "@/components/ui/navigation"

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col millionaire-bg" style={{ backgroundImage: "url('/image/stage.jpg')" }}>
      <Navigation />

      <main className="flex-1 container mx-auto p-6">
        <div className="bg-black/70 rounded-lg p-8 backdrop-blur-sm">
          <div className="flex items-center mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-center flex-1">Game Rules</h1>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-400">How to Play</h2>
              <p className="mb-4">
                "Who Wants to Be a Millionaire" is a quiz game where you answer a series of increasingly difficult
                questions to win up to $1,000,000. Each question has four possible answers, but only one is correct.
              </p>
              <p>
                If you answer incorrectly, you lose and the game ends. You can choose to "Walk Away" at any time and
                keep your current winnings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-400">Lifelines</h2>
              <p className="mb-4">
                You have five lifelines to help you when you're stuck on a question. Each lifeline can only be used once
                per game.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="flex items-start gap-4 bg-slate-800/70 p-4 rounded-lg">
                  <Image src="/image/5050.jpg" alt="50:50" width={60} height={60} className="rounded-full"/>
                  <div>
                    <h3 className="text-xl font-bold mb-2">50:50</h3>
                    <p>Removes two incorrect answers, leaving the correct answer and one incorrect answer.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-slate-800/70 p-4 rounded-lg">
                  <Image src="/image/paf.jpg" alt="Phone a Friend" width={60} height={60}  className="rounded-full"/>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Phone a Friend</h3>
                    <p>Call someone for help. They have 30 seconds to provide their input on the question.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-slate-800/70 p-4 rounded-lg">
                  <Image src="/image/ata.jpg" alt="Ask the Audience" width={60} height={60}  className="rounded-full"/>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Ask the Audience</h3>
                    <p>Poll the studio audience. A graph will show the percentage of audience votes for each answer.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-slate-800/70 p-4 rounded-lg">
                  <Image src="/image/switch.jpg" alt="Switch the Question" width={60} height={60} className="rounded-full" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">Switch the Question</h3>
                    <p>
                      Allows you to skip the current question and receive a new one of the same difficulty level. Any
                      lifelines used on the original question are not returned.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-slate-800/70 p-4 rounded-lg md:col-span-2">
                  <Image src="/image/double.jpg" alt="Double Dip" width={60} height={60} className="rounded-full" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">Double Dip</h3>
                    <p>
                      Allows two attempts at answering a question. Once activated, you must answer the question and
                      cannot walk away. If your first answer is incorrect, you can make a second guess.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex gap-8">
                <div className="w-[30%]">
                  <div className="prize-ladder">
                    <div className="prize-ladder-item milestone">15. $1,000,000</div>
                    <div className="prize-ladder-item">14. $500,000</div>
                    <div className="prize-ladder-item">13. $250,000</div>
                    <div className="prize-ladder-item">12. $125,000</div>
                    <div className="prize-ladder-item">11. $64,000</div>
                    <div className="prize-ladder-item milestone">10. $32,000</div>
                    <div className="prize-ladder-item">9. $16,000</div>
                    <div className="prize-ladder-item">8. $8,000</div>
                    <div className="prize-ladder-item">7. $4,000</div>
                    <div className="prize-ladder-item">6. $2,000</div>
                    <div className="prize-ladder-item milestone">5. $1,000</div>
                    <div className="prize-ladder-item">4. $500</div>
                    <div className="prize-ladder-item">3. $300</div>
                    <div className="prize-ladder-item">2. $200</div>
                    <div className="prize-ladder-item">1. $100</div>
                  </div>
                </div>

                <div className="flex-1 space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-4 text-blue-400">Walk Away</h2>
                    <p className="mb-4">
                      At any point during the game, you can choose to "Walk Away" and keep your current winnings. 
                      <br />
                      This is a strategic decision that allows you to secure your prize money rather than risking it on a difficult question. 
                      <br />
                      Once you walk away, the game ends and you cannot return to continue playing.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-4 text-blue-400">Prize Ladder</h2>
                    <p className="mb-4">
                      The prize ladder consists of 15 questions with increasing monetary values. There are two "safety nets"
                      at $1,000 and $32,000. If you answer a question incorrectly, you will drop back to the last safety net
                      you passed.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
 