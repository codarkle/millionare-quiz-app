"use server"

import { getDb } from "./db"
import { revalidatePath } from "next/cache"

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
  const result = await db.run("INSERT INTO categories (category) VALUES (?)", category)

  const newCategory = await db.get("SELECT * FROM categories WHERE id = ?", result.lastID)

  revalidatePath("/")
  return newCategory
}

export async function updateCategory(id: number, category: string) {
  const db = await getDb()
  await db.run("UPDATE categories SET category = ? WHERE id = ?", category, id)

  revalidatePath(`/category/${id}`)
  return { id, category }
}

export async function deleteCategory(id: number) {
  const db = await getDb()
  await db.run("DELETE FROM categories WHERE id = ?", id)
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

// Get all questions from all categories
export async function getAllQuestions() {
  const db = await getDb()

  // Get all questions with their category names
  const questions = await db.all(`
    SELECT q.id, q.question, c.category, q.category_id
    FROM questions q
    JOIN categories c ON q.category_id = c.id
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

  revalidatePath(`/category/${categoryId}`)
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

  revalidatePath(`/category/${updatedQuestion.category_id}`)
  return { success: true }
}

export async function deleteQuestion(questionId: number) {
  const db = await getDb()

  // Get the question to find the category_id for revalidation
  const question = await db.get("SELECT * FROM questions WHERE id = ?", questionId)

  // Delete the question (answers will be deleted via ON DELETE CASCADE)
  await db.run("DELETE FROM questions WHERE id = ?", questionId)

  revalidatePath(`/category/${question.category_id}`)
  return { success: true }
}
