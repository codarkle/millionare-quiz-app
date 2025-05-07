"use client"

import { useState, useEffect } from "react"
import { createCategory, getCategories } from "@/lib/actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  const [categories, setCategories] = useState<{ id: number; category: string }[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return

    try {
      const newCategoryData = await createCategory(newCategory)
      setCategories([...categories, newCategoryData])
      setNewCategory("")
    } catch (error) {
      console.error("Failed to create category:", error)
    }
  }

  const handleCategoryCheckChange = (categoryId: number, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId])
    } else {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId))
    }
  }

  const handleStartQuiz = () => {
    if (selectedCategories.length === 0) {
      alert("Please select at least one category")
      return
    }

    const categoryParams = selectedCategories.join(",")
    router.push(`/show?categories=${categoryParams}`)
  }

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Quiz App</h1>

      <div className="flex gap-2 mb-8">
        <Input
          type="text"
          placeholder="New Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={handleCreateCategory}>Create</Button>
      </div>

      <div className="flex justify-center mb-8">
        <Button size="lg" className="px-8" onClick={handleStartQuiz} disabled={selectedCategories.length === 0}>
          <Play className="h-5 w-5 mr-2" />
          Start Quiz
        </Button>
      </div>

      <h2 className="text-xl font-semibold mb-4">Categories</h2>

      {isLoading ? (
        <p>Loading categories...</p>
      ) : categories.length === 0 ? (
        <p>No categories found. Create your first category above.</p>
      ) : (
        <div className="grid gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center p-4 border rounded-md hover:bg-gray-50 transition-colors"
            >
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked) => handleCategoryCheckChange(category.id, checked === true)}
                className="mr-3"
              />
              <div className="flex justify-between items-center w-full">
                <label htmlFor={`category-${category.id}`} className="flex-grow cursor-pointer">
                  {category.category}
                </label>
                <Link href={`/category/${category.id}`}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
