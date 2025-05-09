"use server"

import { getDb } from "./db"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { createToken, type UserWithPassword, getCurrentUser } from "./auth"

// Auth actions
export async function login(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!username || !password) {
    return { error: "Username and password are required" }
  }

  try {
    const db = await getDb()
    const user = await db.get<UserWithPassword>(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      username,
      username,
    )

    if (!user) {
      return { error: "Invalid username or password" }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return { error: "Invalid username or password" }
    }

    // Create JWT token
    const token = createToken({
      id: user.id,
      role: user.role,
      username: user.username,
      email: user.email,
    })

    // Set cookie
    cookies().set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return { success: true, role: user.role }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An error occurred during login" }
  }
}

export async function signup(formData: FormData) {
  const username = formData.get("username") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const role = "user" // Default role for new users

  if (!username || !email || !password) {
    return { error: "All fields are required" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  try {
    const db = await getDb()

    // Check if username or email already exists
    const existingUser = await db.get("SELECT * FROM users WHERE username = ? OR email = ?", username, email)

    if (existingUser) {
      return { error: "Username or email already exists" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert new user
    const result = await db.run(
      "INSERT INTO users (role, username, email, password) VALUES (?, ?, ?, ?)",
      role,
      username,
      email,
      hashedPassword,
    )

    // Create JWT token
    const token = createToken({
      id: result.lastID!,
      role,
      username,
      email,
    })

    // Set cookie
    cookies().set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return { success: true }
  } catch (error) {
    console.error("Signup error:", error)
    return { error: "An error occurred during signup" }
  }
}

export async function logout() {
  cookies().delete("auth-token")
  return { success: true }
}

// User profile actions
export async function updateProfile(formData: FormData) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { error: "You must be logged in to update your profile" }
  }

  const username = formData.get("username") as string
  const email = formData.get("email") as string
  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!username || !email) {
    return { error: "Username and email are required" }
  }

  try {
    const db = await getDb()

    // Check if username or email already exists for another user
    const existingUser = await db.get(
      "SELECT * FROM users WHERE (username = ? OR email = ?) AND id != ?",
      username,
      email,
      currentUser.id,
    )

    if (existingUser) {
      return { error: "Username or email already exists" }
    }

    // If changing password, verify current password and check new passwords match
    if (newPassword) {
      if (!currentPassword) {
        return { error: "Current password is required to set a new password" }
      }

      if (newPassword !== confirmPassword) {
        return { error: "New passwords do not match" }
      }

      // Verify current password
      const user = await db.get<UserWithPassword>("SELECT * FROM users WHERE id = ?", currentUser.id)
      if (!user) {
        return { error: "User not found" }
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isPasswordValid) {
        return { error: "Current password is incorrect" }
      }

      // Update user with new password
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await db.run(
        "UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?",
        username,
        email,
        hashedPassword,
        currentUser.id,
      )
    } else {
      // Update user without changing password
      await db.run("UPDATE users SET username = ?, email = ? WHERE id = ?", username, email, currentUser.id)
    }

    // Update token with new user info
    const token = createToken({
      id: currentUser.id,
      role: currentUser.role,
      username,
      email,
    })

    // Set cookie
    cookies().set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    console.error("Update profile error:", error)
    return { error: "An error occurred while updating your profile" }
  }
}

// Quiz history actions
export async function saveQuizResult(questionsShown: number, totalQuestions: number) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { error: "You must be logged in to save quiz results" }
  }

  try {
    const db = await getDb()
    const progress = totalQuestions > 0 ? questionsShown / totalQuestions : 0

    await db.run(
      "INSERT INTO quiz_history (user_id, questions_shown, total_questions, progress) VALUES (?, ?, ?, ?)",
      currentUser.id,
      questionsShown,
      totalQuestions,
      progress,
    )

    return { success: true }
  } catch (error) {
    console.error("Save quiz result error:", error)
    return { error: "An error occurred while saving quiz results" }
  }
}

export async function getQuizHistory() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return []
  }

  try {
    const db = await getDb()
    const history = await db.all(
      "SELECT * FROM quiz_history WHERE user_id = ? ORDER BY completed_at DESC",
      currentUser.id,
    )

    return history
  } catch (error) {
    console.error("Get quiz history error:", error)
    return []
  }
}


// Add this new function to delete quiz history items
export async function deleteQuizHistoryItems(historyIds: number[]) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { error: "You must be logged in to delete quiz history" }
  }

  if (historyIds.length === 0) {
    return { error: "No items selected for deletion" }
  }

  try {
    const db = await getDb()

    // Create placeholders for the SQL query
    const placeholders = historyIds.map(() => "?").join(",")

    // Delete the selected history items, ensuring they belong to the current user
    await db.run(
      `DELETE FROM quiz_history WHERE id IN (${placeholders}) AND user_id = ?`,
      ...historyIds,
      currentUser.id,
    )

    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    console.error("Delete quiz history error:", error)
    return { error: "An error occurred while deleting quiz history" }
  }
}

// User management actions
export async function getUsers() {
  const db = await getDb()
  const users = await db.all("SELECT id, role, username, email, created_at FROM users ORDER BY id")
  return users
}

export async function getUser(id: number) {
  const db = await getDb()
  const user = await db.get("SELECT id, role, username, email, created_at FROM users WHERE id = ?", id)
  return user
}

export async function createUser(formData: FormData) {
  const username = formData.get("username") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = (formData.get("role") as string) || "user"

  if (!username || !email || !password || !role) {
    return { error: "All fields are required" }
  }

  try {
    const db = await getDb()

    // Check if username or email already exists
    const existingUser = await db.get("SELECT * FROM users WHERE username = ? OR email = ?", username, email)

    if (existingUser) {
      return { error: "Username or email already exists" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert new user
    await db.run(
      "INSERT INTO users (role, username, email, password) VALUES (?, ?, ?, ?)",
      role,
      username,
      email,
      hashedPassword,
    )

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("Create user error:", error)
    return { error: "An error occurred while creating the user" }
  }
}

export async function updateUser(id: number, formData: FormData) {
  const username = formData.get("username") as string
  const email = formData.get("email") as string
  const role = formData.get("role") as string
  const password = formData.get("password") as string

  if (!username || !email || !role) {
    return { error: "Username, email, and role are required" }
  }

  try {
    const db = await getDb()

    // Check if username or email already exists for another user
    const existingUser = await db.get(
      "SELECT * FROM users WHERE (username = ? OR email = ?) AND id != ?",
      username,
      email,
      id,
    )

    if (existingUser) {
      return { error: "Username or email already exists" }
    }

    if (password) {
      // Update user with new password
      const hashedPassword = await bcrypt.hash(password, 10)
      await db.run(
        "UPDATE users SET username = ?, email = ?, role = ?, password = ? WHERE id = ?",
        username,
        email,
        role,
        hashedPassword,
        id,
      )
    } else {
      // Update user without changing password
      await db.run("UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?", username, email, role, id)
    }

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("Update user error:", error)
    return { error: "An error occurred while updating the user" }
  }
}

export async function deleteUser(id: number) {
  try {
    const db = await getDb()
    await db.run("DELETE FROM users WHERE id = ?", id)
    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("Delete user error:", error)
    return { error: "An error occurred while deleting the user" }
  }
}

// Category actions
export async function getCategories() {
  const db = await getDb()
  const categories = await db.all("SELECT * FROM categories ORDER BY category")
  return categories
}

export async function getCategory(id: number) {
  const db = await getDb()
  const category = await db.get("SELECT * FROM categories WHERE id = ?", id)
  return category
}

export async function createCategory(category: string) {
  const db = await getDb()
  const result = await db.run("INSERT INTO categories (category, isEnabled) VALUES (?, 0)", category)

  const newCategory = await db.get("SELECT * FROM categories WHERE id = ?", result.lastID)

  revalidatePath("/admin/categories")
  return newCategory
}

export async function updateCategory(id: number, category: string) {
  const db = await getDb()
  await db.run("UPDATE categories SET category = ? WHERE id = ?", category, id)

  revalidatePath(`/admin/categories/${id}`)
  return { id, category }
}

export async function deleteCategory(id: number) {
  const db = await getDb()
  await db.run("DELETE FROM categories WHERE id = ?", id)
  revalidatePath("/admin/categories")
  return { success: true }
}

// Update category enabled status
export async function updateCategoryEnabledStatus(categoryIds: number[]) {
  const db = await getDb()

  // First, disable all categories
  await db.run("UPDATE categories SET isEnabled = 0")

  // Then enable the selected categories
  if (categoryIds.length > 0) {
    const placeholders = categoryIds.map(() => "?").join(",")
    await db.run(`UPDATE categories SET isEnabled = 1 WHERE id IN (${placeholders})`, ...categoryIds)
  }

  revalidatePath("/")
  return { success: true }
}

// Question actions
export async function getQuestions(categoryId: number) {
  const db = await getDb()
  const questions = await db.all("SELECT * FROM questions WHERE category_id = ? ORDER BY id", categoryId)

  // Get answers for each question
  const questionsWithAnswers = await Promise.all(
    questions.map(async (question) => {
      const answers = await db.all("SELECT * FROM answers WHERE question_id = ? ORDER BY id", question.id)
      return { ...question, answers }
    }),
  )

  return questionsWithAnswers
}

// Get questions from enabled categories
export async function getQuestionsFromEnabledCategories() {
  const db = await getDb()

  // Get questions with their category names from enabled categories
  const questions = await db.all(`
    SELECT q.id, q.question, c.category, q.category_id
    FROM questions q
    JOIN categories c ON q.category_id = c.id
    WHERE c.isEnabled = 1
    ORDER BY q.id
  `)

  // Get answers for each question
  const questionsWithAnswers = await Promise.all(
    questions.map(async (question) => {
      const answers = await db.all("SELECT * FROM answers WHERE question_id = ? ORDER BY id", question.id)
      return { ...question, answers }
    }),
  )

  return questionsWithAnswers
}

export async function createQuestion(
  categoryId: number,
  question: string,
  answers: { answer: string; isCorrect: boolean }[],
) {
  const db = await getDb()

  // Insert question
  const questionResult = await db.run(
    "INSERT INTO questions (category_id, question) VALUES (?, ?)",
    categoryId,
    question,
  )

  const questionId = questionResult.lastID

  // Insert answers
  for (const answer of answers) {
    await db.run(
      "INSERT INTO answers (question_id, answer, isCorrect) VALUES (?, ?, ?)",
      questionId,
      answer.answer,
      answer.isCorrect ? 1 : 0,
    )
  }

  // Get the created question with answers
  const createdQuestion = await db.get("SELECT * FROM questions WHERE id = ?", questionId)

  const createdAnswers = await db.all("SELECT * FROM answers WHERE question_id = ? ORDER BY id", questionId)

  revalidatePath(`/admin/categories/${categoryId}`)
  return { ...createdQuestion, answers: createdAnswers }
}

export async function updateQuestion(
  questionId: number,
  question: string,
  answers: { id: number; answer: string; isCorrect: boolean }[],
) {
  const db = await getDb()

  // Update question
  await db.run("UPDATE questions SET question = ? WHERE id = ?", question, questionId)

  // Update answers
  for (const answer of answers) {
    await db.run(
      "UPDATE answers SET answer = ?, isCorrect = ? WHERE id = ?",
      answer.answer,
      answer.isCorrect ? 1 : 0,
      answer.id,
    )
  }

  // Get the question to find the category_id for revalidation
  const updatedQuestion = await db.get("SELECT * FROM questions WHERE id = ?", questionId)

  revalidatePath(`/admin/categories/${updatedQuestion.category_id}`)
  return { success: true }
}

export async function deleteQuestion(questionId: number) {
  const db = await getDb()

  // Get the question to find the category_id for revalidation
  const question = await db.get("SELECT * FROM questions WHERE id = ?", questionId)

  // Delete the question (answers will be deleted via ON DELETE CASCADE)
  await db.run("DELETE FROM questions WHERE id = ?", questionId)

  revalidatePath(`/admin/categories/${question.category_id}`)
  return { success: true }
}
