"use client"

import { useState, useEffect } from "react"
import { createCategory, getCategories, updateCategoryEnabledStatus, logout } from "@/lib/actions"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LogOut, User } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export default function AdminCategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<{ id: number; category: string; isEnabled: boolean }[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)

        // Initialize selected categories based on isEnabled flag
        const enabledCategories = data.filter((category) => category.isEnabled).map((category) => category.id)
        setSelectedCategories(enabledCategories)

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

  const handleSaveEnabledCategories = async () => {
    try {
      await updateCategoryEnabledStatus(selectedCategories)
      alert("Category settings saved successfully")
    } catch (error) {
      console.error("Failed to update category status:", error)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/users")}>
            <User className="h-4 w-4 mr-2" />
            Manage Users
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

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

      {selectedCategories.length > 0 && (
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-sm text-muted-foreground">
              {selectedCategories.length} {selectedCategories.length === 1 ? "category" : "categories"} selected
            </span>
          </div>
          <Button onClick={handleSaveEnabledCategories}>Save Enabled Categories</Button>
        </div>
      )}

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
                <Link href={`/admin/categories/${category.id}`}>
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
