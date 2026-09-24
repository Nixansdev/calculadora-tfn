const DEVICE = "tfn-device";
const TOKEN = "tfn-token"; // alumnos: recordado en este navegador
const ADMIN_TOKEN = "tfn-admin-token"; // admin: solo durante la pestaña

export function getDeviceId() {
  let id = localStorage.getItem(DEVICE);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE, id);
  }
  return id;
}

export function readToken() {
  return sessionStorage.getItem(ADMIN_TOKEN) ?? localStorage.getItem(TOKEN);
}

export function saveToken(token: string, isAdmin: boolean) {
  if (isAdmin) sessionStorage.setItem(ADMIN_TOKEN, token);
  else localStorage.setItem(TOKEN, token);
}

export function clearToken() {
  sessionStorage.removeItem(ADMIN_TOKEN);
  localStorage.removeItem(TOKEN);
}
