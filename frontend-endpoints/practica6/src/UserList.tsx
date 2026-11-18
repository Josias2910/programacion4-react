import { useEffect, useState } from "react";
import type { SubmitEvent } from "react";
import type { User, UserSummary } from "./types";
import { errorMessage } from "./error";
import { UserForm } from "./UserForm";

export function UserList({ token }: { token: string }) {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [path, setPath] = useState("/user");
  const [reload, setReload] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function cargarUsuarios() {
      setLoading(true); setError(""); setUsers([]);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
          headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) { setError(errorMessage(data)); return; }
        setUsers(data);
      } catch {
        if (!controller.signal.aborted) setError("No se pudo conectar con la API");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    cargarUsuarios();
    return () => controller.abort();
  }, [token, path, reload]);

  useEffect(() => {
    if (selectedId === null) return;
    const controller = new AbortController();
    async function cargarDetalle() {
      setSelectedUser(null); setDetailError(""); setLoadingDetail(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user/${selectedId}`, {
          headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) { setDetailError(errorMessage(data)); return; }
        setSelectedUser(data);
      } catch {
        if (!controller.signal.aborted) setDetailError("No se pudo cargar el detalle");
      } finally {
        if (!controller.signal.aborted) setLoadingDetail(false);
      }
    }
    cargarDetalle();
    return () => controller.abort();
  }, [token, selectedId]);

  function cambiarLista(newPath: string) {
    setSelectedId(null); setPath(newPath); setReload((value) => value + 1);
  }

  function buscar(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    cambiarLista(search.trim() ? `/user/search/${encodeURIComponent(search.trim())}` : "/user");
  }

  function creado() {
    setSearch(""); cambiarLista("/user");
  }

  return <>
    <section>
      <h2>Usuarios</h2>
      <form onSubmit={buscar} className="toolbar">
        <label>Buscar por nombre<input value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <button>Buscar</button>
        <button type="button" onClick={() => { setSearch(""); cambiarLista("/user"); }}>Limpiar</button>
        <button type="button" onClick={() => { setSearch(""); cambiarLista(path === "/user_mayores" ? "/user" : "/user_mayores"); }}>
          {path === "/user_mayores" ? "Mostrar todos" : "Solo mayores"}
        </button>
      </form>
      <p>Vista: {path === "/user_mayores" ? "Solo mayores" : path.startsWith("/user/search/") ? "Búsqueda" : "Todos"}</p>
      {loading ? <p role="status">Cargando...</p> : error ? <p role="alert">{error}</p> : <>
        {users.length === 0 && <p>No se encontraron usuarios.</p>}
        <ul className="users">{users.map((user) => <li key={user.id}>
          <button className="name" onClick={() => setSelectedId(user.id)}>{user.name}</button>
        </li>)}</ul>
      </>}
    </section>
    {selectedId !== null && <section aria-label="Detalle del usuario">
      <h2>Detalle</h2>
      {loadingDetail ? <p>Cargando detalle...</p> : detailError ? <p role="alert">{detailError}</p> : selectedUser && <>
        <h3>{selectedUser.name}</h3>
        <p>Email: {selectedUser.email}</p><p>Edad: {selectedUser.age}</p>
        <p>País: {selectedUser.country?.name ?? "Sin país"}</p>
        <p>Roles: {selectedUser.roles.map((role) => role.name).join(", ") || "Sin roles"}</p>
      </>}
    </section>}
    <UserForm token={token} onCreated={creado} />
  </>;
}
