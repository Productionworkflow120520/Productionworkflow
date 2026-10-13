/**
 * Server-only auth utilities that use next/headers (cookies).
 * NEVER import this file from client components ('use client').
 */
import "server-only";
import { cookies } from "next/headers";
import { verifyToken, JWTPayload } from "./auth";

const COOKIE_NAME = "rechargepro_session";
const LEGACY_COOKIE_NAME = "paymatrix_session";

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 24 * 60 * 60, // 24 hours
  };
  cookieStore.set(COOKIE_NAME, token, cookieOptions);
  cookieStore.set(LEGACY_COOKIE_NAME, token, cookieOptions);
}

export async function getSessionCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? cookieStore.get(LEGACY_COOKIE_NAME)?.value ?? null;
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  cookieStore.delete(LEGACY_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getSessionCookie();
  if (!token) return null;
  return verifyToken(token);
}
