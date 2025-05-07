"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updateProfile, getQuizHistory, logout } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, LogOut, Home } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { User } from "@/lib/auth"

type QuizHistoryItem = {
  id: number
  user_id: number
  questions_shown: number
  total_questions: number
  progress: number
  completed_at: string
}

export default function UserProfilePage({ user }: { user: User }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    const fetchQuizHistory = async () => {
      try {
        const history = await getQuizHistory()
        setQuizHistory(history)
        setHistoryLoading(false)
      } catch (error) {
        console.error("Failed to fetch quiz history:", error)
        setHistoryLoading(false)
      }
    }

    fetchQuizHistory()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formDataObj = new FormData()
    formDataObj.append("username", formData.username)
    formDataObj.append("email", formData.email)

    if (formData.newPassword) {
      formDataObj.append("currentPassword", formData.currentPassword)
      formDataObj.append("newPassword", formData.newPassword)
      formDataObj.append("confirmPassword", formData.confirmPassword)
    }

    const result = await updateProfile(formDataObj)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess("Profile updated successfully")
      // Reset password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
    }

    setIsLoading(false)
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Profile</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/")}>
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="history">Quiz History</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4 bg-green-50 border-green-500 text-green-700">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium mb-2">Change Password (optional)</h3>

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Quiz History</CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <p>Loading quiz history...</p>
              ) : quizHistory.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  You haven't taken any quizzes yet. Start a quiz to see your history.
                </p>
              ) : (
                <div className="space-y-4">
                  {quizHistory.map((item) => (
                    <div key={item.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">
                            Completed {item.questions_shown} of {item.total_questions} questions
                          </h3>
                          <p className="text-sm text-muted-foreground">{formatDate(item.completed_at)}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                            {Math.round(item.progress * 100)}% complete
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${item.progress * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
                Take a New Quiz
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
