// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

const admin = { id: 1, name: "Martina", email: "mgomez@email.com", age: 28, country: { id: 1, name: "Argentina" }, roles: [{ id: 1, name: "ADMIN" }] };
let users: { id: number; name: string; age: number }[];
let calls: { url: string; options?: RequestInit }[];
let fail: { path: string; method?: string; status: number; detail: string } | null;
const answer = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  vi.stubEnv("VITE_API_URL", "http://localhost:8000");
  localStorage.clear(); localStorage.setItem("token", "test-token");
  users = [{ id: 1, name: "Martina", age: 28 }, { id: 2, name: "Santiago", age: 34 }];
  calls = []; fail = null;
  vi.stubGlobal("fetch", vi.fn(async (url: string, options?: RequestInit) => {
    calls.push({ url, options });
    const path = new URL(url).pathname;
    if (fail && path === fail.path && (options?.method || "GET") === (fail.method || "GET")) return answer({ detail: fail.detail }, fail.status);
    if (path === "/login") return answer({ token: "new-token" });
    if (path === "/user/me/id") return answer({ id: 1 });
    if (path === "/user" && options?.method === "POST") {
      const body = JSON.parse(String(options.body)); users.push({ id: 3, ...body }); return answer({ id: 3 });
    }
    if (options?.method === "DELETE") return answer({ msg: "ok" });
    if (path === "/user") return answer(users.map(({ id, name }) => ({ id, name })));
    if (path === "/user_mayores") return answer(users.filter((user) => user.age >= 18));
    if (path.startsWith("/user/search/")) return answer(users.filter((user) => user.name.toLowerCase().includes(decodeURIComponent(path.split("/").pop()!).toLowerCase())));
    if (path === "/user/1") return answer(admin);
    if (path === "/user/2") return answer({ ...admin, id: 2, name: "Santiago", age: 34 });
    return answer({ detail: "Not Found" }, 404);
  }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

async function ready() {
  render(<App />);
  await screen.findByText("Hola, Martina");
  await screen.findByRole("button", { name: "Santiago" });
}


test("lista y detalle al elegir usuario", async () => {
  await ready();
  fireEvent.click(screen.getByRole("button", { name: "Santiago" }));
  expect(await screen.findByText("Edad: 34")).toBeTruthy();
  expect(screen.getByText("País: Argentina")).toBeTruthy();
  expect(screen.getByText("Roles: ADMIN")).toBeTruthy();
});

test("cargando y error detail en lugar de lista", async () => {
  fail = { path: "/user", status: 404, detail: "Not Found" };
  render(<App />);
  expect(screen.getByText("Cargando...")).toBeTruthy();
  expect(await screen.findByText("Not Found")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Santiago" })).toBeNull();
});

test("busca con encodeURIComponent y limpia", async () => {
  await ready();
  fireEvent.change(screen.getByLabelText("Buscar por nombre"), { target: { value: "#" } });
  fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
  await screen.findByText("No se encontraron usuarios.");
  expect(calls.some(({ url }) => url.endsWith("/user/search/%23"))).toBe(true);
  fireEvent.click(screen.getByText("Limpiar"));
  expect(await screen.findByRole("button", { name: "Santiago" })).toBeTruthy();
});

test("iniciar y cerrar sesión", async () => {
  localStorage.clear(); render(<App />);
  fireEvent.change(screen.getByLabelText("Email", { exact: true }), { target: { value: "mgomez@email.com" } });
  fireEvent.change(screen.getByLabelText("Contraseña", { exact: true }), { target: { value: "123" } });
  fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
  await screen.findByText("Hola, Martina");
  expect(localStorage.getItem("token")).toBe("new-token");
  fireEvent.click(screen.getByText("Cerrar sesión"));
  expect(localStorage.getItem("token")).toBeNull();
});
