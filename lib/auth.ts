import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import jwt from "jsonwebtoken"

// JWT secret key - in production, use a proper environment variable
const JWT_SECRET = "your-secret-key-change-in-production"

// User types
export type User = {
  id: number
  role: string
  username: string
  email: string
}

export type UserWithPassword = User & {
  password: string
}

// Create a JWT token
export function createToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      username: user.username,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}

// Verify a JWT token
export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User
  } catch (error) {
    return null
  }
}

// Get the current user from the cookie
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    return null
  }

  return verifyToken(token)
}

// Check if the user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

// Check if the user has a specific role
export async function hasRole(role: string): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null && user.role === role
}

// Middleware to protect routes
export async function requireAuth() {
  const isAuthed = await isAuthenticated()
  if (!isAuthed) {
    redirect("/login")
  }
}

// Middleware to protect admin routes
export async function requireAdmin() {
  const isAdmin = await hasRole("administrator")
  if (!isAdmin) {
    redirect("/")
  }
}

// Middleware to protect user routes
export async function requireUser() {
  const isUser = await hasRole("user")
  if (!isUser) {
    redirect("/")
  }
}

// Redirect if already authenticated
export async function redirectIfAuthenticated(redirectTo = "/") {
  const isAuthed = await isAuthenticated()
  if (isAuthed) {
    redirect(redirectTo)
  }
}
