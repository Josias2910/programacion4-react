# Frontend de usuarios

Cada carpeta `practica1` a `practica8` es un proyecto independiente y acumula lo anterior.

1. Detalle de usuario.
2. Carga y errores de la lista.
3. Búsqueda y limpiar.
4. Saludo con roles.
5. Alta de usuario.
6. Filtro de mayores.
7. Borrado con confirmación.
8. Cierre de sesión al recibir 401 en pedidos autenticados.

## Ejecutar una práctica

Requiere Node 22.12 o superior y la API de usuarios de clase encendida.

```sh
cd practica1
npm ci
cp ../../.env.example .env
```

Completar `VITE_API_URL` en `.env` con la dirección del backend local (por ejemplo, `http://localhost:8000`). Luego:

```sh
npm run dev
```

Abrir `http://localhost:5175`. Cerrar el servidor antes de ejecutar otra práctica porque usan el mismo puerto.

La API utilizada es `clase-1-sqlmodel` del repositorio `ffumaneri/utn-tup-2026-python`, versión `521513fe4b01e8a0de382619d2d03dbd8f200034`. Dentro de esa carpeta instalar sus dependencias y ejecutar `python -m uvicorn main:app --reload`. Ingresar con una cuenta de prueba del backend de clase. No usar datos de producción.

## Comprobaciones

En cada carpeta: `npm test` y `npm run build`.
Las pruebas usan respuestas simuladas y no modifican la base de datos.

Para comprobar la práctica 2 manualmente, cambiar temporalmente `/user` por `/usr` en la ruta de la lista: debe mostrar `Not Found`. Restaurar la ruta. Con Slow 4G en Network se ve la carga.

Para la práctica 8, alterar el token en Local Storage y recargar. Debe volver al login con `Tu sesión venció`. Borrar únicamente usuarios creados para probar.

La práctica 9 corresponde al formulario de entrega.
