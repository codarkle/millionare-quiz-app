"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  getCategory,
  updateCategory,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Trash2, Edit, Save, X } from "lucide-react"

type Answer = {
  id: number
  answer: string
  isCorrect: boolean
}

type Question = {
  id: number
  question: string
  answers: Answer[]
}

export default function AdminCategoryPage({ categoryId }: { categoryId: number }) {
  const router = useRouter()

  const [categoryName, setCategoryName] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null)
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    answers: [
      { answer: "", isCorrect: true },
      { answer: "", isCorrect: false },
      { answer: "", isCorrect: false },
      { answer: "", isCorrect: false },
    ],
  })
  const [showNewQuestionForm, setShowNewQuestionForm] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryData = await getCategory(categoryId)
        setCategoryName(categoryData.category)

        const questionsData = await getQuestions(categoryId)
        setQuestions(questionsData)

        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [categoryId])

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) return

    try {
      await updateCategory(categoryId, categoryName)
    } catch (error) {
      console.error("Failed to update category:", error)
    }
  }

  const handleCreateQuestion = async () => {
    if (!newQuestion.question.trim() || newQuestion.answers.some((a) => !a.answer.trim())) {
      alert("Please fill in all fields")
      return
    }

    try {
      const createdQuestion = await createQuestion(categoryId, newQuestion.question, newQuestion.answers)

      setQuestions([...questions, createdQuestion])
      setShowNewQuestionForm(false)
      setNewQuestion({
        question: "",
        answers: [
          { answer: "", isCorrect: true },
          { answer: "", isCorrect: false },
          { answer: "", isCorrect: false },
          { answer: "", isCorrect: false },
        ],
      })
    } catch (error) {
      console.error("Failed to create question:", error)
    }
  }

  const handleUpdateQuestion = async (questionId: number, questionIndex: number) => {
    try {
      const updatedQuestion = questions[questionIndex]
      await updateQuestion(questionId, updatedQuestion.question, updatedQuestion.answers)
      setEditingQuestion(null)
    } catch (error) {
      console.error("Failed to update question:", error)
    }
  }

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return

    try {
      await deleteQuestion(questionId)
      setQuestions(questions.filter((q) => q.id !== questionId))
    } catch (error) {
      console.error("Failed to delete question:", error)
    }
  }

  const handleAnswerChange = (questionIndex: number, answerIndex: number, value: string) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].answers[answerIndex].answer = value
    setQuestions(updatedQuestions)
  }

  const handleCorrectAnswerChange = (questionIndex: number, answerIndex: number) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].answers.forEach((answer, idx) => {
      answer.isCorrect = idx === answerIndex
    })
    setQuestions(updatedQuestions)
  }

  const handleNewAnswerChange = (answerIndex: number, value: string) => {
    const updatedAnswers = [...newQuestion.answers]
    updatedAnswers[answerIndex].answer = value
    setNewQuestion({ ...newQuestion, answers: updatedAnswers })
  }

  const handleNewCorrectAnswerChange = (answerIndex: number) => {
    const updatedAnswers = [...newQuestion.answers]
    updatedAnswers.forEach((answer, idx) => {
      answer.isCorrect = idx === answerIndex
    })
    setNewQuestion({ ...newQuestion, answers: updatedAnswers })
  }

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>
  }

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" onClick={() => router.push("/admin/categories")} className="mb-4">
          Back to Categories
        </Button>
      </div>

      <div className="flex gap-2 mb-8 items-center">
        <Input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={handleSaveCategory}>Save</Button>
        <Button onClick={() => setShowNewQuestionForm(true)} className="ml-auto">
          Create Question
        </Button>
      </div>

      {showNewQuestionForm && (
        <div className="border p-4 rounded-md mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">New Question</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowNewQuestionForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Input
            type="text"
            placeholder="Question"
            value={newQuestion.question}
            onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
            className="mb-4"
          />

          <div className="space-y-3">
            <RadioGroup value={newQuestion.answers.findIndex((a) => a.isCorrect).toString()}>
              {newQuestion.answers.map((answer, answerIndex) => (
                <div key={answerIndex} className="flex items-center gap-2">
                  <RadioGroupItem
                    id={`new-answer-${answerIndex}`}
                    value={answerIndex.toString()}
                    onClick={() => handleNewCorrectAnswerChange(answerIndex)}
                  />
                  <Input
                    type="text"
                    placeholder={`Answer ${answerIndex + 1}`}
                    value={answer.answer}
                    onChange={(e) => handleNewAnswerChange(answerIndex, e.target.value)}
                    className="flex-1"
                  />
                </div>
              ))}
            </RadioGroup>
          </div>

          <Button onClick={handleCreateQuestion} className="mt-4">
            Create Question
          </Button>
        </div>
      )}

      <div className="grid gap-8">
        {questions.length === 0 ? (
          <p>No questions found. Create your first question.</p>
        ) : (
          questions.map((question, questionIndex) => (
            <div key={question.id} className="border p-4 rounded-md">
              <div className="flex justify-between items-center mb-4">
                {editingQuestion === question.id ? (
                  <Input
                    type="text"
                    value={question.question}
                    onChange={(e) => {
                      const updatedQuestions = [...questions]
                      updatedQuestions[questionIndex].question = e.target.value
                      setQuestions(updatedQuestions)
                    }}
                    className="flex-1 mr-2"
                  />
                ) : (
                  <h3 className="text-lg font-semibold">{question.question}</h3>
                )}

                <div className="flex gap-2">
                  {editingQuestion === question.id ? (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateQuestion(question.id, questionIndex)}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingQuestion(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="icon" onClick={() => setEditingQuestion(question.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDeleteQuestion(question.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <RadioGroup
                  value={question.answers.findIndex((a) => a.isCorrect).toString()}
                  disabled={editingQuestion !== question.id}
                >
                  {question.answers.map((answer, answerIndex) => (
                    <div key={answer.id} className="flex items-center gap-2">
                      <RadioGroupItem
                        id={`question-${question.id}-answer-${answer.id}`}
                        value={answerIndex.toString()}
                        onClick={() => {
                          if (editingQuestion === question.id) {
                            handleCorrectAnswerChange(questionIndex, answerIndex)
                          }
                        }}
                      />
                      {editingQuestion === question.id ? (
                        <Input
                          type="text"
                          value={answer.answer}
                          onChange={(e) => handleAnswerChange(questionIndex, answerIndex, e.target.value)}
                          className="flex-1"
                        />
                      ) : (
                        <Label
                          htmlFor={`question-${question.id}-answer-${answer.id}`}
                          className={`${answer.isCorrect ? "font-medium" : ""}`}
                        >
                          {answer.answer}
                        </Label>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}
