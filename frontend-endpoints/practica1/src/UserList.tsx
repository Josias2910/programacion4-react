import { useEffect, useState } from "react";
import type { User, UserSummary } from "./types";
import { errorMessage } from "./error";

export function UserList({ token }: { token: string }) {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const path = "/user";
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function cargarUsuarios() {
      setUsers([]);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
          headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) return;
        setUsers(data);
      } catch {
        // La lista queda vacía si no se puede conectar.

      }
    }
    cargarUsuarios();
    return () => controller.abort();
  }, [token, path]);

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

  return <>
    <section>
      <h2>Usuarios</h2>
      {<>
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
  </>;
}
