"use client"

import { logout } from "@/lib/actions" 
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button" 
import { LogOut, User, Trophy, LayoutGrid } from "lucide-react" 

export default function AdminCategoriesPage() {
  const router = useRouter() 
 
  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/categories")}>
            <LayoutGrid className="h-4 w-4 mr-2" />
            Categories
          </Button>
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
  
    </main>
  )
}
