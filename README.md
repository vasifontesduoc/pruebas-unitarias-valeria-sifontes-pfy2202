# 🧪 Pruebas unitarias · Rumbo Sur (agencia de viajes)

Actividad de la **semana 6** de Desarrollo Frontend II (PFY2202): pruebas unitarias con **Jest**, **React Testing Library** y **MSW** sobre la app de agencia de viajes de la semana 5.

## ✅ Resultado de las pruebas

**52 pruebas en 8 archivos, todas aprobadas.** Cobertura total (`npm test -- --coverage`):

| % Stmts | % Branch | % Funcs | % Lines |
|---|---|---|---|
| **98.73** | 95.88 | **100** | **99.51** |

La pauta pide al menos 50% en sentencias, funciones y líneas. Jest lo verifica solo con `coverageThreshold` en `jest.config.cjs`.

## 🧪 Cómo están hechas las pruebas

### Tecnologías

- **Jest**: ejecuta las pruebas y mide la cobertura (`jest.config.cjs`).
- **React Testing Library** + **user-event**: renderiza los componentes y simula lo que hace el usuario (escribir, hacer clic, elegir opciones).
- **jest-dom**: comparaciones legibles como `toBeInTheDocument()` o `toBeDisabled()`.
- **MSW (`msw/node`)**: responde con datos mock a **todas** las integraciones con el backend durante las pruebas, con los mismos handlers que usa el navegador (`src/mocks/handlers.js` → `src/mocks/server.js`).
  - REST: `GET /api/destinos`, `GET /api/destinos/:id`, `GET /api/simular-error`
  - GraphQL: `query VuelosYHoteles`, `query SimularErrorGraphQL`
  - En algunas pruebas se usa `server.use(...)` para simular errores 404, 500, de red y de GraphQL.
- **Babel** (`babel.config.cjs`): permite que Jest entienda JSX, `import/export` e `import.meta.env` de Vite.
- **jest-fixed-jsdom**: simula el navegador con `fetch`, `Request` y `Response`, que MSW necesita.

### Archivos de pruebas (`src/__tests__/`)

| Archivo | Qué prueba |
|---|---|
| `utils.test.js` | Formato de precios y fechas, cálculo de noches y búsqueda sin tildes |
| `api.test.js` | Servicio REST: datos del mock, caché, peticiones compartidas, errores 404, 500 y de red |
| `graphql.test.js` | Consulta GraphQL con Apollo y mensajes de error |
| `componentes.test.jsx` | Disponibilidad, EstadoVacio, OrigenDato, MensajeError y ResumenViaje |
| `Inicio.test.jsx` | Carga de destinos, buscador, estado vacío, error con reintento y navegación |
| `Destino.test.jsx` | Destino + vuelos y hoteles, selección, total, pasajeros, fechas, filtro, 404 y error GraphQL |
| `OtrasPaginas.test.jsx` | Cómo funciona (botones de error REST y GraphQL), página 404 y menú |
| `App.test.jsx` | Arranque de la app completa con router y Apollo |

### Cómo ejecutarlas

```bash
npm install
npm test                  # ejecuta las pruebas
npm test -- --coverage    # pruebas + tabla de cobertura
```

El reporte detallado queda en `coverage/lcov-report/index.html`.

Los mensajes `console.error` sobre `act(...)` que pueden aparecer son avisos de React por la carga diferida (lazy loading) de las páginas, no fallas: todas las pruebas pasan.

---


🌐 **Sitio publicado:** https://vasifontesduoc.github.io/viajes-valeria-sifontes-pfy2202/

Aplicación en **React** para planificar viajes: el usuario elige un destino, revisa sus actividades populares y arma su viaje eligiendo un **vuelo** y un **hotel**, con el costo total estimado.

- Los **destinos** se obtienen desde una **API REST mock**.
- Los **vuelos y hoteles** de cada destino se obtienen desde una **API GraphQL mock** con **Apollo Client**.
- Ambas APIs se simulan con **MSW (Mock Service Worker)**.

## Funcionalidades

- **Destinos** (`/`): lista obtenida por REST con país, descripción y actividades populares, y buscador por ciudad, país o actividad (sin importar tildes).
- **Planificador** (`/destinos/:destinoId`):
  - Datos del destino por REST.
  - Vuelos (aerolínea, fechas, duración, escalas, precio y asientos) y hoteles (estrellas, zona, servicios, precio por noche, fechas y habitaciones) por GraphQL, en **una sola consulta**.
  - Selección de **pasajeros**, filtro **"solo opciones disponibles"** y selección de vuelo y hotel.
  - Los hoteles se bloquean si no tienen disponibilidad para las fechas del vuelo elegido o habitaciones suficientes.
  - **Resumen del viaje** con noches, habitaciones y **total estimado**.
- **Cómo funciona** (`/como-funciona`): comparación REST vs. GraphQL, la consulta usada, optimizaciones y botones para **probar errores** de cada API.
- **Estados de la interfaz:** esqueletos de carga, mensajes de error claros con *Reintentar* y estados vacíos (por ejemplo, San Pedro de Atacama no tiene vuelos).

## Tecnologías

- React + **Vite**
- **React Router** (`react-router`): layout con `Outlet`, ruta dinámica `/destinos/:destinoId`, `NavLink`, ruta 404 y lazy loading con `Suspense`.
- **MSW**: handlers REST (`http.get`) y GraphQL (`graphql.query`).
- **Apollo Client**: `ApolloProvider`, `useQuery`, `gql` e `InMemoryCache`.
- **Estado:** `useState` (selección de vuelo y hotel, pasajeros, filtros, búsqueda) y `useEffect` (carga de datos REST, limpiar la selección al cambiar de destino y quitar opciones que dejan de ser válidas).
- **Tailwind CSS** con tema propio y clases reutilizables con `@apply`. Diseño responsive.
- **GitHub Pages** con `gh-pages`.

## APIs simuladas

### REST

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/api/destinos` | Lista de destinos (país, descripción, actividades) |
| GET | `/api/destinos/:id` | Un destino · **404** si no existe |
| GET | `/api/simular-error` | Solo para pruebas: responde **500** |

### GraphQL (`POST /graphql`)

```graphql
query VuelosYHoteles($destinoId: ID!) {
  vuelos(destinoId: $destinoId) {
    id aerolinea codigo fechaIda fechaVuelta duracion escalas precio asientosDisponibles
  }
  hoteles(destinoId: $destinoId) {
    id nombre estrellas zona precioPorNoche disponibleDesde disponibleHasta habitacionesDisponibles servicios
  }
}
```

Si el destino no existe responde con `errors`. La query `SimularErrorGraphQL` siempre responde con un error, para probar su manejo.

## Optimización de consultas

- **REST:** caché en memoria (5 minutos), peticiones en curso compartidas (sin duplicados) y reutilización de la lista para el detalle de cada destino.
- **GraphQL:** caché de Apollo (`InMemoryCache`): volver a un destino ya visitado no consulta de nuevo. Una sola consulta trae vuelos y hoteles juntos.

## Estructura

```
src/
├── mocks/        → datos, handlers (REST + GraphQL) y browser (worker de MSW)
├── services/     → api.js: llamadas REST con caché y manejo de errores
├── graphql/      → cliente.js (Apollo Client) y consultas.js (queries gql)
├── hooks/        → useApi: carga de datos REST con useState y useEffect
├── components/   → TarjetaDestino, TarjetaVuelo, TarjetaHotel, ResumenViaje, Disponibilidad,
│                   OrigenDato, Cargando, TarjetasCargando, MensajeError, EstadoVacio, ProbadorErrores
├── layouts/      → Layout (header, menú, Outlet y footer)
├── pages/        → Inicio, Destino, ComoFunciona, NoEncontrado
├── routes/       → AppRoutes
└── utils/        → formato (precios, fechas, noches) y normalizar
```

## Rutas

| Ruta | Página |
|---|---|
| `/` | Destinos |
| `/destinos/:destinoId` | Planificador del viaje (vuelos y hoteles) |
| `/como-funciona` | Explicación de las APIs |
| `*` | Página no encontrada |

## Revisión de recorridos

| Recorrido | Resultado esperado |
|---|---|
| Abrir el inicio | Esqueletos de carga y luego los 6 destinos (REST) |
| Buscar `peru` o `tango` | Aparece Cusco o Buenos Aires |
| Entrar a Buenos Aires | Datos del destino y, tras la carga, 3 vuelos y 2 hoteles (GraphQL) |
| Elegir un vuelo y un hotel | El resumen muestra noches, habitaciones y total estimado |
| En Buenos Aires, elegir el vuelo de diciembre (Aerolíneas Argentinas) | *Casa San Telmo* se bloquea: "No disponible para las fechas de tu vuelo" |
| En Cancún, cambiar a 4 pasajeros | El vuelo de LATAM (3 asientos) se bloquea: "No alcanza para 4 pasajeros" |
| Marcar "solo opciones disponibles" | Se ocultan las opciones bloqueadas |
| Entrar a San Pedro de Atacama | "No hay vuelos disponibles" y sus hoteles |
| Volver a un destino ya visitado | Aparece al instante, sin nuevas peticiones en la consola |
| Abrir `/destinos/tokio` | Mensaje "Destino no encontrado" (404) con Reintentar |
| Cómo funciona → probar errores | Mensajes claros para el error 500 de REST y el error de GraphQL |
| Abrir una ruta inexistente | Página no encontrada |

## Cómo ejecutarlo

```bash
npm install
npm run dev
```

Se abre en http://localhost:3000.

## Cómo publicarlo en GitHub Pages

```bash
npm run deploy
```
