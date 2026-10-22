# 🎮 Arcade

Plataforma web de minijuegos con autenticación, chat en tiempo real y ranking global, construida con **Angular 21** y **Supabase**.

![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)
![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest&logoColor=white)

> Proyecto desarrollado para la materia **Programación IV**.

---

## 📑 Tabla de contenidos

- [Características](#-características)
- [Juegos](#-juegos)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Diagramas](#-diagramas)
- [Conceptos y patrones aplicados](#-conceptos-y-patrones-aplicados)
- [Rutas](#-rutas)
- [Requisitos previos](#-requisitos-previos)
- [Instalación y ejecución](#-instalación-y-ejecución)
- [Configuración de entorno](#-configuración-de-entorno)
- [Modelo de datos](#-modelo-de-datos)
- [Scripts disponibles](#-scripts-disponibles)
- [Seguridad](#-seguridad)
- [Autor](#-autor)

---

## ✨ Características

- **Autenticación** de usuarios (registro e inicio de sesión) mediante Supabase Auth.
- **Cuatro minijuegos** jugables desde el navegador.
- **Persistencia de partidas**: cada sesión de juego se guarda en la base de datos.
- **Ranking global (Top)** con los mejores puntajes.
- **Chat en tiempo real** entre usuarios autenticados.
- **Sección "Sobre mí"** que consume la API pública de GitHub.
- **Rutas protegidas** con guards (`authGuard` / `noAuthGuard`) y *lazy loading* de todas las vistas.
- **Interceptor HTTP** que adjunta el token de sesión a las peticiones.
- Interfaz responsive con **Tailwind CSS 4**.

## 🕹️ Juegos

| Juego | Descripción |
|-------|-------------|
| **Ahorcado** | Adivina la palabra letra por letra antes de agotar los intentos. |
| **La Viborita** | Clásico Snake: come, crece y evita chocar. |
| **Mayor o Menor** | Predice si la próxima carta del mazo será mayor o menor. |
| **Preguntados** | Trivia por categorías con preguntas cargadas desde `public/preguntas.json`. |

## 🧰 Tecnologías

- **Frontend:** Angular 21 (standalone components, lazy loading), TypeScript 5.9, RxJS 7.8
- **Estilos:** Tailwind CSS 4 + PostCSS
- **Backend as a Service:** Supabase (Auth, PostgreSQL, Realtime) vía `@supabase/supabase-js`
- **Testing:** Vitest + jsdom
- **Formato:** Prettier

## 🏗️ Arquitectura

```
src/app/
├── core/                    # Singletons de la aplicación
│   ├── guards/              # authGuard, noAuthGuard
│   ├── layouts/             # MainLayout (navbar + router-outlet)
│   ├── models/              # Interfaces (p. ej. pregunta.model.ts)
│   └── services/            # Auth, guardado de partidas, Snake, Preguntados, interceptor
├── features/                # Funcionalidades (cargadas de forma diferida)
│   ├── home/                # Landing: inicio, juegos, descarga
│   ├── auth/                # login y register
│   ├── games/               # listado + ahorcado, la-viborita, mayor-menor, preguntados
│   ├── chat/                # chat en tiempo real
│   ├── top/                 # ranking global
│   └── about-me/            # perfil con datos de GitHub
├── shared/components/       # navbar, card
└── environments/            # configuración de entorno
```

## 📐 Diagramas

Los diagramas están escritos en [Mermaid](https://mermaid.js.org/) y se renderizan directamente en GitHub.

### Arquitectura general

```mermaid
flowchart LR
    U([Usuario]) --> APP

    subgraph APP[Angular 21 SPA]
        direction TB
        L[MainLayout + Navbar]
        G{{Guards<br/>authGuard / noAuthGuard}}
        F[Features<br/>home · auth · games · chat · top · about-me]
        S[Servicios core<br/>SupabaseService · GuardarPartida · Preguntas/Top · Chat · Snake · Deck]
        I[[authInterceptor]]
        L --> G --> F --> S
        S --> I
    end

    S -->|supabase-js| SB[(Supabase<br/>Auth · PostgreSQL · Realtime)]
    I -->|Bearer token| EXT
    F -->|HTTP| EXT[APIs externas<br/>Deck of Cards · GitHub]
    F -->|fetch| J[(public/preguntas.json)]
```

### Navegación y protección de rutas

```mermaid
flowchart TD
    A([Entrada a una ruta]) --> B{¿Ruta pública?<br/>/ · /home · **}
    B -- Sí --> H[Home]
    B -- No --> C{¿Es /auth/*?}
    C -- Sí --> D{noAuthGuard<br/>¿hay sesión?}
    D -- No --> E[Login / Registro]
    D -- Sí --> H
    C -- No --> F{authGuard<br/>¿hay sesión?}
    F -- Sí --> G[games · chat · top · about-me]
    F -- No --> R[Redirige a /auth/login]
```

### Flujo de autenticación

```mermaid
sequenceDiagram
    actor U as Usuario
    participant LG as Login (FormGroup)
    participant SS as SupabaseService
    participant SA as Supabase Auth
    participant R as Router

    U->>LG: email + contraseña
    LG->>LG: Validators (required, minLength, email)
    LG->>SS: signIn(email, password)
    SS->>SA: signInWithPassword()
    SA-->>SS: sesión + JWT
    SS-->>LG: usuario autenticado
    LG->>R: navega a /games
    R->>SS: authGuard → getSession()
    SS-->>R: sesión válida
```

### Interceptor HTTP

```mermaid
sequenceDiagram
    participant C as Componente / Servicio
    participant IT as authInterceptor
    participant SS as SupabaseService
    participant API as API externa

    C->>IT: HttpRequest
    IT->>SS: from(getAccessToken()).pipe(switchMap)
    SS-->>IT: token | null
    alt hay token
        IT->>API: req.clone(Authorization: Bearer token)
    else sin token
        IT->>API: req original
    end
    API-->>C: HttpResponse
```

### Ciclo de una partida y ranking

```mermaid
sequenceDiagram
    actor U as Jugador
    participant J as Juego (Ahorcado · Viborita · Mayor/Menor · Preguntados)
    participant GP as GuardarPartidaService
    participant DB as Supabase · game_sessions
    participant T as Top (PreguntasService)

    U->>J: juega
    J->>J: termina (won, score, duración)
    J->>GP: saveGameSession(...)
    GP->>GP: getSession() → user_uid
    GP->>DB: INSERT game_sessions
    U->>T: abre /top
    T->>DB: SELECT + join users<br/>WHERE game_type ORDER BY score DESC LIMIT 10
    DB-->>T: top 10 por juego
    T-->>U: ranking (signal topGames)
```

### Chat en tiempo real

```mermaid
sequenceDiagram
    actor A as Usuario A
    actor B as Usuario B
    participant CH as ChatSupabaseService
    participant DB as chat_messages
    participant RT as Canal chat-realtime

    B->>CH: abre /chat
    CH->>DB: getLastMessages(10)
    CH->>RT: subscribeToMessages()
    A->>CH: envía mensaje
    CH->>DB: INSERT chat_messages
    DB-->>RT: postgres_changes (INSERT)
    RT->>CH: payload.new
    CH->>CH: userCache → busca autor en users si falta
    CH-->>B: mensaje en pantalla
```

### Modelo de datos

```mermaid
erDiagram
    USERS ||--o{ GAME_SESSIONS : juega
    USERS ||--o{ CHAT_MESSAGES : escribe

    USERS {
        uuid uid PK
        text nombre
        text apellido
        text email
    }
    GAME_SESSIONS {
        int id PK
        uuid user_uid FK
        text game_type "la_viborita | el_ahorcado | mayor_menor | preguntados"
        bool won
        int score
        int duration_seconds
        jsonb data
    }
    CHAT_MESSAGES {
        int id PK
        uuid user_uid FK
        text mensaje
        timestamp created_at
    }
```

## 🧩 Conceptos y patrones aplicados

| Concepto | Dónde se usa |
|----------|--------------|
| **Lazy loading** (`loadComponent` / `loadChildren`) | Todas las vistas y el módulo de rutas de `auth` se cargan bajo demanda en `app.routes.ts`. |
| **Standalone components** | Toda la app, sin `NgModule`; cada componente declara sus propios `imports`. |
| **Route guards funcionales** | `authGuard` protege juegos, chat, top y about-me; `noAuthGuard` evita que un usuario logueado vea login/registro. |
| **HTTP Interceptor funcional** | `authInterceptor` (`provideHttpClient(withInterceptors(...))`) agrega el token de sesión de Supabase a cada petición. |
| **Pipeline RxJS (`pipe`)** | El interceptor convierte la promesa del token con `from(...).pipe(...)` y clona la request con el header `Authorization`. |
| **Signals** (`signal`, `computed`, `effect`) | Estado reactivo en auth, chat, Ahorcado, Mayor o Menor y About-me. |
| **Nuevo control flow** (`@if`, `@for`, `@switch`) | Plantillas de login, registro, chat, top, navbar y los cuatro juegos. |
| **Inyección de dependencias con `inject()`** | Servicios, `Router`, `HttpClient` y `NgZone` en componentes, guards e interceptor. |
| **Servicios `providedIn: 'root'`** | Auth, guardado de partidas, chat, ranking, mazo, preguntas, Snake y GitHub. |
| **Formularios reactivos** | Login y registro con `FormGroup`, `FormControl` y `Validators` (`required`, `minLength`, `email`). |
| **`@Input` en componentes reutilizables** | `card` recibe `titulo`, `imagen` y `ruta`; se reutiliza en home y listado de juegos. |
| **Layout con rutas hijas** | `MainLayout` envuelve todas las rutas con la navbar y un `router-outlet`. |
| **Supabase Realtime** | Canal `chat-realtime` para recibir mensajes sin recargar. |
| **Consumo de APIs REST** | [Deck of Cards API](https://deckofcardsapi.com/) (Mayor o Menor) y GitHub API (About-me). |
| **Datos estáticos en JSON** | Banco de preguntas por categoría en `public/preguntas.json`. |
| **Game loop y eventos de teclado** | La Viborita y Ahorcado usan temporizadores, `keydown` y `NgZone` para controlar la detección de cambios. |

## 🧭 Rutas

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/`, `/home` | Público | Página de inicio |
| `/auth/login`, `/auth/register` | Solo no autenticados | Acceso y registro |
| `/games` | Autenticado | Listado de juegos |
| `/games/ahorcado` | Autenticado | Ahorcado |
| `/games/la-viborita` | Autenticado | Snake |
| `/games/mayor-menor` | Autenticado | Mayor o Menor |
| `/games/preguntados` | Autenticado | Preguntados |
| `/chat` | Autenticado | Chat en tiempo real |
| `/top` | Autenticado | Ranking de jugadores |
| `/about-me` | Autenticado | Sobre el autor |

## ✅ Requisitos previos

- [Node.js](https://nodejs.org/) 20.19+ (recomendado LTS)
- npm 10+
- Un proyecto en [Supabase](https://supabase.com/) (gratuito)

## 🚀 Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd arcade

# 2. Instalar dependencias
npm install

# 3. Configurar el entorno (ver sección siguiente)

# 4. Levantar el servidor de desarrollo
npm start
```

La aplicación quedará disponible en **http://localhost:4200/** con recarga automática.

## 🔐 Configuración de entorno

Edita `src/app/environments/environment.ts`:

```ts
export const environment = {
    production: false,
    supabaseUrl: 'https://<tu-proyecto>.supabase.co',
    supabaseKey: '<tu-anon-public-key>',
    tokenGithub: '<opcional: token de GitHub sin permisos especiales>'
};
```

- `supabaseUrl` y `supabaseKey` se obtienen en **Project Settings → API** de Supabase. Usa siempre la clave **anon/public**, nunca la `service_role`.
- `tokenGithub` es opcional: solo evita el límite de peticiones anónimas de la API de GitHub.

## 🗄️ Modelo de datos

Tablas de Supabase que utiliza la aplicación:

| Tabla | Uso |
|-------|-----|
| `users` | Datos de perfil de los usuarios registrados. |
| `game_sessions` | Partidas jugadas (juego, puntaje, usuario); alimenta el ranking. |
| `chat_messages` | Mensajes del chat en tiempo real. |

Habilita **Realtime** sobre `chat_messages` y define políticas **Row Level Security (RLS)** para las tres tablas.

## 📜 Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Servidor de desarrollo (`ng serve`). |
| `npm run build` | Compilación de producción en `dist/`. |
| `npm run watch` | Compilación en modo desarrollo con *watch*. |
| `npm test` | Tests unitarios con Vitest. |

## 🛡️ Seguridad

- No subas claves ni tokens reales al repositorio. Mantén los valores sensibles fuera del control de versiones (por ejemplo, un `environment.ts` local ignorado en `.gitignore` y un `environment.example.ts` versionado).
- La clave `anon` de Supabase es pública por diseño, pero su seguridad depende de configurar correctamente las políticas RLS.
- Si un token de GitHub fue expuesto, **revócalo** y genera uno nuevo.

## 👤 Autor

**Juan Manuel** — [@juanma7882](https://github.com/juanma7882)

---

<p align="center">Hecho con ❤️ y Angular</p>
