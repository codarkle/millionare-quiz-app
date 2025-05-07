"use client"

import { useState, useEffect } from "react"
import { createCategory, getCategories } from "@/lib/actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play } from "lucide-react"

export default function Home() {
  const [categories, setCategories] = useState<{ id: number; category: string }[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [isLoading, setIsLoading] = useState(true)

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
        <Link href="/show">
          <Button size="lg" className="px-8">
            <Play className="h-5 w-5 mr-2" />
            Start Quiz
          </Button>
        </Link>
      </div>

      <h2 className="text-xl font-semibold mb-4">Categories</h2>

      {isLoading ? (
        <p>Loading categories...</p>
      ) : categories.length === 0 ? (
        <p>No categories found. Create your first category above.</p>
      ) : (
        <div className="grid gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="block p-4 border rounded-md hover:bg-gray-50 transition-colors"
            >
              {category.category}
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
