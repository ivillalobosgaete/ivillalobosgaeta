// Administración de usuarios (solo administradores).
import { handler, send, readBody, current, sb, uname, publicUser, getUser } from "../lib/core.js";
export default handler(async (req, res) => {
  const me = await current(req);
  if (!me) return send(res, 401, { error: "Sin sesión" });
  if (me.rol !== "administrador") return send(res, 403, { error: "Solo un administrador puede hacer esto." });
  if (req.method === "GET") {
    const r = await sb("usuarios?select=*&order=creado.desc");
    return send(res, 200, { usuarios: (r || []).map(publicUser) });
  }
  if (req.method !== "POST") return send(res, 405, { error: "Método no permitido" });
  const b = await readBody(req);
  const id = uname(b.usuario);
  if (!id || !(await getUser(id))) return send(res, 404, { error: "Usuario no encontrado." });
  if (id === me.usuario) return send(res, 400, { error: "No puedes cambiar tu propia cuenta." });
  let patch;
  if (b.accion === "aprobar") {
    const rol = b.rol === "administrador" ? "administrador" : "visualizador";
    const p = b.permisos || {};
    patch = { estado: "activo", rol, permisos: { exportar: !!p.exportar, nombres: p.nombres !== false }, comunas: Array.isArray(b.comunas) ? b.comunas.map(String).slice(0, 50) : [], aprobado_por: me.usuario };
  } else if (b.accion === "rechazar") patch = { estado: "rechazado" };
  else if (b.accion === "suspender") patch = { estado: "suspendido" };
  else return send(res, 400, { error: "Acción no válida." });
  await sb(`usuarios?usuario=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: patch, prefer: "return=minimal" });
  send(res, 200, { ok: true });
});
