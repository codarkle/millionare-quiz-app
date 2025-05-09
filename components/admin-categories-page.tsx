"use client"

import { useState, useEffect } from "react"
import { createCategory, getCategories, updateCategoryEnabledStatus, logout, deleteCategory } from "@/lib/actions"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Home, Edit, Trash2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export default function AdminCategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<{ id: number; category: string; isEnabled: boolean }[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [isSaving, setIsSaving] = useState(false)

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
      setIsSaving(true)
      await updateCategoryEnabledStatus(selectedCategories)
      alert("Category settings saved successfully")
    } catch (error) {
      console.error("Failed to update category status:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm("Are you sure you want to delete this category? This will also delete all associated questions.")) {
      return
    }

    try {
      await deleteCategory(categoryId)
      setCategories(categories.filter((category) => category.id !== categoryId))
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId))
    } catch (error) {
      console.error("Failed to delete category:", error)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Question Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin")}>
            <Home className="h-4 w-4 mr-2" />
            Home
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

      
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left side - Image */}
            <div className="relative h-[400px] rounded-md overflow-hidden">
              <Image
                src="/image/intro.jpg"
                alt="Categories"
                fill
                style={{ objectFit: "cover" }}
                className="rounded-md"
              />
            </div>

            {/* Right side - Categories list */}
            <div className="h-[400px] overflow-y-auto pr-2">
              {isLoading ? (
                <p>Loading categories...</p>
              ) : categories.length === 0 ? (
                <p>No categories found. Create your first category above.</p>
              ) : (
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center p-4 border rounded-md hover:bg-white/5 transition-colors"
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
                        <div className="flex gap-2">
                          <Link href={`/admin/categories/${category.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSaveEnabledCategories} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Enabled Categories"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
