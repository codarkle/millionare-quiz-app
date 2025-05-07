"use client"

import { useState, useEffect } from "react"
import { getUsers, createUser, updateUser, deleteUser, logout } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Edit, LogOut, LayoutGrid } from "lucide-react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type User = {
  id: number
  role: string
  username: string
  email: string
  created_at: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewUserForm, setShowNewUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  })

  const [editUser, setEditUser] = useState<{
    id: number
    username: string
    email: string
    password: string
    role: string
  } | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers()
        setUsers(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch users:", error)
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleCreateUser = async () => {
    setError(null)
    if (!newUser.username || !newUser.email || !newUser.password) {
      setError("All fields are required")
      return
    }

    try {
      const formData = new FormData()
      formData.append("username", newUser.username)
      formData.append("email", newUser.email)
      formData.append("password", newUser.password)
      formData.append("role", newUser.role)

      const result = await createUser(formData)

      if (result.error) {
        setError(result.error)
        return
      }

      // Refresh the user list
      const updatedUsers = await getUsers()
      setUsers(updatedUsers)

      // Reset form
      setNewUser({
        username: "",
        email: "",
        password: "",
        role: "user",
      })
      setShowNewUserForm(false)
    } catch (error) {
      console.error("Failed to create user:", error)
      setError("An error occurred while creating the user")
    }
  }

  const handleStartEditUser = (user: User) => {
    setEditingUser(user.id)
    setEditUser({
      id: user.id,
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
    })
    setError(null)
  }

  const handleUpdateUser = async () => {
    if (!editUser) return
    setError(null)

    if (!editUser.username || !editUser.email) {
      setError("Username and email are required")
      return
    }

    try {
      const formData = new FormData()
      formData.append("username", editUser.username)
      formData.append("email", editUser.email)
      formData.append("role", editUser.role)
      if (editUser.password) {
        formData.append("password", editUser.password)
      }

      const result = await updateUser(editUser.id, formData)

      if (result.error) {
        setError(result.error)
        return
      }

      // Refresh the user list
      const updatedUsers = await getUsers()
      setUsers(updatedUsers)

      // Reset form
      setEditingUser(null)
      setEditUser(null)
    } catch (error) {
      console.error("Failed to update user:", error)
      setError("An error occurred while updating the user")
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      await deleteUser(userId)
      setUsers(users.filter((user) => user.id !== userId))
    } catch (error) {
      console.error("Failed to delete user:", error)
      setError("An error occurred while deleting the user")
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>
  }

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/categories")}>
            <LayoutGrid className="h-4 w-4 mr-2" />
            Categories
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button onClick={() => setShowNewUserForm(!showNewUserForm)} className="mb-6">
        {showNewUserForm ? "Cancel" : "Create New User"}
      </Button>

      {showNewUserForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="new-username">Username</Label>
                <Input
                  id="new-username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-role">Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger id="new-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="administrator">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateUser} className="mt-2">
                Create User
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <h2 className="text-xl font-semibold mb-4">Users</h2>

      <div className="grid gap-4">
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="border p-4 rounded-md">
              {editingUser === user.id ? (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor={`edit-username-${user.id}`}>Username</Label>
                    <Input
                      id={`edit-username-${user.id}`}
                      value={editUser?.username}
                      onChange={(e) => setEditUser({ ...editUser!, username: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`edit-email-${user.id}`}>Email</Label>
                    <Input
                      id={`edit-email-${user.id}`}
                      type="email"
                      value={editUser?.email}
                      onChange={(e) => setEditUser({ ...editUser!, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`edit-password-${user.id}`}>Password (leave blank to keep current)</Label>
                    <Input
                      id={`edit-password-${user.id}`}
                      type="password"
                      value={editUser?.password}
                      onChange={(e) => setEditUser({ ...editUser!, password: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`edit-role-${user.id}`}>Role</Label>
                    <Select
                      value={editUser?.role}
                      onValueChange={(value) => setEditUser({ ...editUser!, role: value })}
                    >
                      <SelectTrigger id={`edit-role-${user.id}`}>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="administrator">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="outline" onClick={() => setEditingUser(null)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateUser}>Save Changes</Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{user.username}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Role: {user.role} | Created: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleStartEditUser(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  )
}
