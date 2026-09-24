import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function db() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const normName = (s: string) => s.trim().replace(/\s+/g, " ");
const nameKey = (s: string) =>
  normName(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export interface PublicUser {
  id: string;
  full_name: string;
  is_admin: boolean;
  device_id: string | null;
  created_at: string;
  last_seen: string | null;
}

const userCols = "id, full_name, is_admin, device_id, created_at, last_seen, active";

async function userFromToken(token: string) {
  const s = await db();
  const { data } = await s
    .from("app_sessions")
    .select(`user_id, app_users(${userCols})`)
    .eq("token", token)
    .maybeSingle();
  const u = (data as any)?.app_users;
  if (!u || !u.active) return null;
  return u as PublicUser & { active: boolean };
}

async function requireAdmin(token: string) {
  const u = await userFromToken(token);
  if (!u?.is_admin) throw new Error("No autorizado");
  return u;
}

async function newSession(userId: string, deviceId: string, isAdmin: boolean) {
  const s = await db();
  const token = crypto.randomUUID() + crypto.randomUUID();
  await s.from("app_sessions").insert({ token, user_id: userId });
  const now = new Date().toISOString();
  await s
    .from("app_users")
    .update(isAdmin ? { last_seen: now } : { last_seen: now, device_id: deviceId })
    .eq("id", userId);
  return token;
}

const nameSchema = z.string().trim().min(3, "Escribe tu nombre completo").max(80);
const passSchema = z.string().min(4, "Mínimo 4 caracteres").max(64);
const tokenSchema = z.string().min(10).max(200);
const deviceSchema = z.string().min(10).max(100);

export const checkName = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ name: nameSchema }).parse(d))
  .handler(async ({ data }) => {
    const s = await db();
    const { data: row } = await s
      .from("app_users")
      .select("id")
      .eq("name_key", nameKey(data.name))
      .maybeSingle();
    return { exists: !!row };
  });

export const register = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ name: nameSchema, password: passSchema, deviceId: deviceSchema }).parse(d),
  )
  .handler(async ({ data }) => {
    const s = await db();
    const { data: row, error } = await s
      .from("app_users")
      .insert({ full_name: normName(data.name), name_key: nameKey(data.name), password: data.password })
      .select("id")
      .single();
    if (error || !row) return { ok: false as const, error: "Ese nombre ya está registrado." };
    const token = await newSession(row.id, data.deviceId, false);
    return { ok: true as const, token, isAdmin: false };
  });

export const login = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ name: nameSchema, password: z.string().max(64), deviceId: deviceSchema }).parse(d),
  )
  .handler(async ({ data }) => {
    const s = await db();
    const { data: row } = await s
      .from("app_users")
      .select("id, password, active, is_admin")
      .eq("name_key", nameKey(data.name))
      .maybeSingle();
    if (!row || row.password !== data.password)
      return { ok: false as const, error: "Nombre o contraseña incorrectos." };
    if (!row.active) return { ok: false as const, error: "Tu cuenta está desactivada." };
    const token = await newSession(row.id, data.deviceId, row.is_admin);
    return { ok: true as const, token, isAdmin: row.is_admin };
  });

export const getMe = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: tokenSchema }).parse(d))
  .handler(async ({ data }) => {
    const u = await userFromToken(data.token);
    if (u) await (await db()).from("app_users").update({ last_seen: new Date().toISOString() }).eq("id", u.id);
    return u;
  });

export const logout = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: tokenSchema }).parse(d))
  .handler(async ({ data }) => {
    await (await db()).from("app_sessions").delete().eq("token", data.token);
    return { ok: true };
  });

export const addHistory = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        token: tokenSchema,
        conversion: z.string().max(60),
        input: z.string().max(60),
        result: z.string().max(200),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const u = await userFromToken(data.token);
    if (!u) throw new Error("Sesión no válida");
    await (await db())
      .from("history")
      .insert({ user_id: u.id, conversion: data.conversion, input: data.input, result: data.result });
    return { ok: true };
  });

export const listHistory = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: tokenSchema, all: z.boolean().optional() }).parse(d))
  .handler(async ({ data }) => {
    const u = await userFromToken(data.token);
    if (!u) throw new Error("Sesión no válida");
    let q = (await db())
      .from("history")
      .select("id, conversion, input, result, created_at, app_users(full_name)")
      .order("created_at", { ascending: false })
      .limit(300);
    if (!(data.all && u.is_admin)) q = q.eq("user_id", u.id);
    const { data: rows } = await q;
    return (rows ?? []).map((r: any) => ({
      id: r.id as string,
      conversion: r.conversion as string,
      input: r.input as string,
      result: r.result as string,
      created_at: r.created_at as string,
      user: (r.app_users?.full_name ?? "") as string,
    }));
  });

export const adminListUsers = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: tokenSchema }).parse(d))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { data: rows } = await (await db())
      .from("app_users")
      .select(`${userCols}, password`)
      .order("created_at", { ascending: true });
    return rows ?? [];
  });

export const adminCreateAdmin = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ token: tokenSchema, name: nameSchema, password: passSchema }).parse(d),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const { error } = await (await db()).from("app_users").insert({
      full_name: normName(data.name),
      name_key: nameKey(data.name),
      password: data.password,
      is_admin: true,
    });
    if (error) return { ok: false, error: "Ese nombre ya existe." };
    return { ok: true };
  });

export const adminSetPassword = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ token: tokenSchema, userId: z.string().uuid(), password: passSchema }).parse(d),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const s = await db();
    await s.from("app_users").update({ password: data.password }).eq("id", data.userId);
    await s.from("app_sessions").delete().eq("user_id", data.userId);
    return { ok: true };
  });

export const adminToggleActive = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ token: tokenSchema, userId: z.string().uuid(), active: z.boolean() }).parse(d),
  )
  .handler(async ({ data }) => {
    const me = await requireAdmin(data.token);
    if (me.id === data.userId) return { ok: false };
    const s = await db();
    await s.from("app_users").update({ active: data.active }).eq("id", data.userId);
    if (!data.active) await s.from("app_sessions").delete().eq("user_id", data.userId);
    return { ok: true };
  });
