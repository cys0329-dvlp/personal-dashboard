import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, lectureRecordings, InsertLectureRecording, lectures, InsertLecture, customCategories, InsertCustomCategory } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ---- Lecture Recordings ----
export async function createLectureRecording(recording: InsertLectureRecording) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(lectureRecordings).values(recording);
  return result;
}

export async function getLectureRecordingsByUserId(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db
    .select()
    .from(lectureRecordings)
    .where(eq(lectureRecordings.userId, userId))
    .orderBy(desc(lectureRecordings.recordedAt))
    .limit(limit);
}

export async function getLectureRecordingById(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db
    .select()
    .from(lectureRecordings)
    .where(eq(lectureRecordings.id, id))
    .limit(1);

  if (result.length === 0) return undefined;
  if (result[0].userId !== userId) return undefined;

  return result[0];
}

export async function updateLectureRecording(id: number, userId: number, updates: Partial<InsertLectureRecording>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existing = await getLectureRecordingById(id, userId);
  if (!existing) {
    throw new Error("Recording not found or unauthorized");
  }

  return await db
    .update(lectureRecordings)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(lectureRecordings.id, id));
}

export async function deleteLectureRecording(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existing = await getLectureRecordingById(id, userId);
  if (!existing) {
    throw new Error("Recording not found or unauthorized");
  }

  return await db.delete(lectureRecordings).where(eq(lectureRecordings.id, id));
}

// ---- Lectures ----
export async function createLecture(lecture: InsertLecture) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(lectures).values(lecture);
  return result;
}

export async function getLecturesByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db
    .select()
    .from(lectures)
    .where(eq(lectures.userId, userId))
    .orderBy(desc(lectures.createdAt));
}

export async function getLectureById(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db
    .select()
    .from(lectures)
    .where(eq(lectures.id, id))
    .limit(1);

  if (result.length === 0) return undefined;
  if (result[0].userId !== userId) return undefined;

  return result[0];
}

export async function updateLecture(id: number, userId: number, updates: Partial<InsertLecture>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existing = await getLectureById(id, userId);
  if (!existing) {
    throw new Error("Lecture not found or unauthorized");
  }

  return await db
    .update(lectures)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(lectures.id, id));
}

export async function deleteLecture(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existing = await getLectureById(id, userId);
  if (!existing) {
    throw new Error("Lecture not found or unauthorized");
  }

  return await db.delete(lectures).where(eq(lectures.id, id));
}

// ---- Custom Categories ----
export async function createCustomCategory(category: InsertCustomCategory) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(customCategories).values(category);
  return result;
}

export async function getCustomCategoriesByUserId(userId: number, type?: 'income' | 'expense') {
  const db = await getDb();
  if (!db) {
    return [];
  }

  let query = db
    .select()
    .from(customCategories)
    .where(eq(customCategories.userId, userId));

  if (type) {
    const filtered = await query;
    return filtered.filter(cat => cat.type === type);
  }

  return await query.orderBy(desc(customCategories.createdAt));
}

export async function getCustomCategoryById(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db
    .select()
    .from(customCategories)
    .where(eq(customCategories.id, id))
    .limit(1);

  if (result.length === 0) return undefined;
  if (result[0].userId !== userId) return undefined;

  return result[0];
}

export async function updateCustomCategory(id: number, userId: number, updates: Partial<InsertCustomCategory>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existing = await getCustomCategoryById(id, userId);
  if (!existing) {
    throw new Error("Category not found or unauthorized");
  }

  return await db
    .update(customCategories)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(customCategories.id, id));
}

export async function deleteCustomCategory(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existing = await getCustomCategoryById(id, userId);
  if (!existing) {
    throw new Error("Category not found or unauthorized");
  }

  return await db.delete(customCategories).where(eq(customCategories.id, id));
}
