import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "./connection";

const SESSION_KEY = "current_user_id";

type UserRow = {
  id: number;
  name: string;
  email: string;
  password: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function registerUser(
  email: string,
  password: string,
  name?: string
) {
  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail || !password) {
    throw new Error("Correo y contraseña son obligatorios.");
  }

  const existing = db.getFirstSync(
    `SELECT * FROM users WHERE email = ? LIMIT 1`,
    [cleanEmail]
  ) as UserRow | null;

  if (existing) {
    throw new Error("Ese correo ya está registrado.");
  }

  const finalName = name?.trim() || cleanEmail.split("@")[0];

  db.runSync(
    `
    INSERT INTO users (name, email, password)
    VALUES (?, ?, ?)
    `,
    [finalName, cleanEmail, password]
  );

  const user = db.getFirstSync(
    `SELECT * FROM users WHERE email = ? LIMIT 1`,
    [cleanEmail]
  ) as UserRow | null;

  if (!user) {
    throw new Error("No se pudo crear el usuario.");
  }

  await AsyncStorage.setItem(SESSION_KEY, String(user.id));
  return user;
}

export async function loginUser(email: string, password: string) {
  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail || !password) {
    throw new Error("Correo y contraseña son obligatorios.");
  }

  const user = db.getFirstSync(
    `SELECT * FROM users WHERE email = ? LIMIT 1`,
    [cleanEmail]
  ) as UserRow | null;

  if (!user) {
    throw new Error("Usuario no encontrado.");
  }

  if (user.password !== password) {
    throw new Error("Contraseña incorrecta.");
  }

  await AsyncStorage.setItem(SESSION_KEY, String(user.id));
  return user;
}

export async function logoutUser() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function getCurrentUserId() {
  const value = await AsyncStorage.getItem(SESSION_KEY);
  return value ? Number(value) : null;
}