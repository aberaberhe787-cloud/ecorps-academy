import { pgTable, serial, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash"),
  xp: integer("xp").default(0).notNull(),
  streakDays: integer("streak_days").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  certifications: many(certifications),
}));

export const certifications = pgTable("certifications", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  title: text("title").notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
});

export const certificationsRelations = relations(certifications, ({ one }) => ({
  user: one(users, {
    fields: [certifications.userId],
    references: [users.id],
  }),
}));

export const learningContent = pgTable("learning_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  pillar: text("pillar").notNull(), // Microlearning, Active Recall, etc.
  content: text("content").notNull(),
});

export const lessons = pgTable("lessons", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  path: text("path").notNull().default("curriculum"),
  difficulty: text("difficulty").notNull().default("Beginner"),
});

export const lessonProgress = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  lessonId: text("lesson_id").references(() => lessons.id).notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  quizPassed: boolean("quiz_passed").default(false).notNull(),
  practicePassed: boolean("practice_passed").default(false).notNull(),
});

export const promptAttempts = pgTable("prompt_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  prompt: text("prompt").notNull(),
  score: integer("score"),
  feedback: text("feedback"),
  timeSpentSeconds: integer("time_spent_seconds").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const savedPrompts = pgTable("saved_prompts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  prompt: text("prompt").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  pathId: text("path_id").notNull(),
  title: text("title").notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
});

export const foundationProgress = pgTable("foundation_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  conceptId: text("concept_id").notNull(),
  score: integer("score").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  metadata: jsonb("metadata"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
