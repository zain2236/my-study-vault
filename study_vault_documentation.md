# Study Vault — Complete Project Documentation

> **Purpose of this document**: This is an exhaustive, LLM-friendly reference for every aspect of the **Study Vault** codebase. It is designed so that a language model can be fine-tuned or prompted with this document and accurately answer *any* question about the project's architecture, code, data flow, configuration, or deployment.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack (with Versions)](#2-technology-stack-with-versions)
3. [Project Directory Structure](#3-project-directory-structure)
4. [Configuration Files](#4-configuration-files)
5. [Database Schema (Prisma)](#5-database-schema-prisma)
6. [Routing Architecture](#6-routing-architecture)
7. [Layouts](#7-layouts)
8. [Pages & Route Handlers](#8-pages--route-handlers)
9. [Authentication System](#9-authentication-system)
10. [Session Management](#10-session-management)
11. [File Upload Workflow (R2 Pre-signed URLs)](#11-file-upload-workflow-r2-pre-signed-urls)
12. [File Download System](#12-file-download-system)
13. [AI-Powered Document Summarization](#13-ai-powered-document-summarization)
14. [Component Architecture](#14-component-architecture)
15. [Utility Modules (Complete Reference)](#15-utility-modules-complete-reference)
16. [Styling & Design System](#16-styling--design-system)
17. [SEO Strategy](#17-seo-strategy)
18. [Deployment & DevOps](#18-deployment--devops)
19. [Environment Variables](#19-environment-variables)
20. [Data Flow Diagrams](#20-data-flow-diagrams)
21. [Error Handling Patterns](#21-error-handling-patterns)
22. [Security Considerations](#22-security-considerations)

---

## 1. Project Overview

### What is Study Vault?

**Study Vault** is a full-stack, server-side rendered web application that allows university students to:

- **Upload** educational resources (PDFs, DOCX, JPG, PNG) to cloud storage (Cloudflare R2)
- **Organize** resources by semester, subject, and resource type (Notes, Assignment, Quiz, Date Sheet, Syllabus, Past Papers)
- **Publish** resources to make them publicly available to other students
- **Browse & Search** public resources using debounced search with cursor-based pagination
- **Download** resources (with download count tracking)
- **Summarize** PDF and DOCX files using AI (Groq + LLaMA 3.3 70B model)
- **Manage** their personal dashboard with filtering, upload, delete, publish/unpublish capabilities

### Key Architectural Decisions

| Decision | Choice | Reason |
|---|---|---|
| Framework | React Router v7 (full-stack SSR) | Successor to Remix; provides loaders, actions, and SSR out of the box |
| Package Manager | pnpm | Fast, disk-efficient |
| Styling | TailwindCSS v4 | Utility-first CSS with Vite plugin integration |
| Database | PostgreSQL (Supabase-hosted) | Relational data with Prisma ORM |
| File Storage | Cloudflare R2 (S3-compatible) | Cost-effective object storage with S3 API compatibility |
| Authentication | Cookie-based sessions + Google OAuth 2.0 | Stateless cookies, no external auth library |
| AI | Groq API (OpenAI-compatible) with LLaMA 3.3 70B | Fast inference for document summarization |
| Deployment | Vercel (primary) + Docker support | Vercel preset for React Router; Docker for self-hosting |

### Live URL

`https://study-vault-platform.vercel.app`

---

## 2. Technology Stack (with Versions)

### Core Runtime & Framework

| Technology | Version | Role |
|---|---|---|
| **React** | `^19.2.3` | UI library |
| **React DOM** | `^19.2.3` | React DOM renderer |
| **React Router** | `7.12.0` | Full-stack framework (SSR, routing, loaders, actions) |
| **@react-router/node** | `7.12.0` | Node.js adapter for React Router |
| **@react-router/serve** | `7.12.0` | Production server for React Router |
| **@react-router/dev** | `7.12.0` (dev) | Dev server and build tooling |
| **TypeScript** | `^5.9.2` | Type safety |
| **Vite** | `^7.1.7` | Build tool and dev server |
| **vite-tsconfig-paths** | `^5.1.4` | Resolve TypeScript path aliases in Vite |

### Database & ORM

| Technology | Version | Role |
|---|---|---|
| **Prisma** | `^7.3.0` (dev) | Database schema management, migrations, type-safe queries |
| **@prisma/client** | `^7.3.0` | Auto-generated type-safe database client |
| **@prisma/adapter-pg** | `^7.3.0` | PostgreSQL adapter for Prisma (uses `pg` driver) |
| **pg** | `^8.18.0` | PostgreSQL client for Node.js |

### Cloud Storage (Cloudflare R2)

| Technology | Version | Role |
|---|---|---|
| **@aws-sdk/client-s3** | `^3.987.0` | S3-compatible client for R2 operations (PUT, GET, DELETE, HEAD) |
| **@aws-sdk/s3-request-presigner** | `^3.987.0` | Generate pre-signed URLs for direct client uploads |

### Authentication & Security

| Technology | Version | Role |
|---|---|---|
| **bcryptjs** | `^3.0.3` | Password hashing (12 salt rounds) |
| **Node.js crypto** | Built-in | Token generation (randomBytes) and hashing (SHA-256) |

### Email

| Technology | Version | Role |
|---|---|---|
| **nodemailer** | `^8.0.1` | SMTP email sending (via Brevo/Sendinblue) |

### AI & Document Processing

| Technology | Version | Role |
|---|---|---|
| **openai** | `^6.33.0` | OpenAI-compatible SDK (pointed at Groq API) |
| **pdf-parse** | `^2.4.5` | Extract text from PDF files |
| **mammoth** | `^1.12.0` | Extract text from DOCX files |
| **react-markdown** | `^10.1.0` | Render AI-generated markdown summaries in the UI |

### UI

| Technology | Version | Role |
|---|---|---|
| **TailwindCSS** | `^4.1.13` | Utility-first CSS framework |
| **@tailwindcss/vite** | `^4.1.13` (dev) | TailwindCSS Vite plugin |
| **lucide-react** | `^0.563.0` | Icon library (SVG icons as React components) |

### Deployment

| Technology | Version | Role |
|---|---|---|
| **@vercel/react-router** | `^1.2.5` | Vercel deployment preset for React Router |
| **dotenv** | `^17.2.3` | Environment variable loading |
| **isbot** | `^5.1.31` | Bot detection for SSR optimization |

### Type Definitions (devDependencies)

| Package | Version |
|---|---|
| `@types/node` | `^22` |
| `@types/nodemailer` | `^7.0.11` |
| `@types/pg` | `^8.16.0` |
| `@types/react` | `^19.2.7` |
| `@types/react-dom` | `^19.2.3` |

---

## 3. Project Directory Structure

```
student-valut-project/
├── .dockerignore                    # Docker build exclusions
├── .env                             # Environment variables (NOT committed)
├── .gitignore                       # Git exclusions
├── .react-router/                   # Auto-generated React Router types
├── .vercel/                         # Vercel deployment config
├── Dockerfile                       # Multi-stage Docker build
├── README.md                        # Basic project README
├── docker-compose.yml               # Local PostgreSQL via Docker
├── package.json                     # Dependencies and scripts
├── pnpm-lock.yaml                   # Lock file
├── pnpm-workspace.yaml              # PNPM workspace config
├── prisma/                          # Prisma schema & migrations
│   ├── schema.prisma                # Database schema definition
│   └── migrations/                  # SQL migration files
│       ├── 20260211190751_init/     # Initial migration
│       └── migration_lock.toml      # Migration lock
├── prisma.config.ts                 # Prisma configuration (datasource URLs)
├── react-router.config.ts           # React Router config (SSR, prerender, Vercel preset)
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite configuration (plugins)
├── test-pdf.js                      # PDF parsing test script
├── upload_process.md                # Upload workflow documentation
├── generated/                       # Auto-generated Prisma client output
│   └── prisma/
├── public/                          # Static assets
│   └── assests/                     # (Note: typo in folder name)
│       ├── fav-icon.png             # Favicon (165KB)
│       └── logo-image.png           # Logo image (154KB)
├── build/                           # Production build output
├── app/                             # Application source code
│   ├── app.css                      # Global styles (fonts, Tailwind import, theme)
│   ├── root.tsx                     # Root component (HTML shell, error boundary)
│   ├── routes.ts                    # Route definitions (all routes)
│   ├── layout/                      # Layout components
│   │   ├── main-layout.tsx          # Public pages layout (Navbar + Footer)
│   │   ├── dashboard-layout.tsx     # Dashboard layout (Header + Sidebar)
│   │   └── auth-layout.tsx          # Auth pages layout (centered card)
│   ├── routes/                      # Route files (pages + API endpoints)
│   │   ├── $.tsx                    # Catch-all → redirects to /404
│   │   ├── _404.tsx                 # Custom 404 page
│   │   ├── index.tsx                # Landing/home page
│   │   ├── about.tsx                # About page
│   │   ├── features.tsx             # Features page
│   │   ├── resources.tsx            # Public resources browse page
│   │   ├── dashboard.tsx            # User dashboard (protected)
│   │   ├── download.$id.tsx         # File download endpoint
│   │   ├── api.r2-upload.tsx        # R2 upload API (pre-signed URL + confirm)
│   │   ├── api.summarize.tsx        # AI summarization API
│   │   ├── disclaimer.tsx           # Disclaimer page
│   │   ├── privacy-policy.tsx       # Privacy policy page
│   │   ├── terms-of-service.tsx     # Terms of service page
│   │   └── auth/                    # Authentication routes
│   │       ├── login.tsx            # Login page
│   │       ├── sign-up.tsx          # Sign-up page
│   │       ├── logout.tsx           # Logout action
│   │       ├── google.tsx           # Google OAuth redirect
│   │       ├── google.callback.tsx  # Google OAuth callback
│   │       ├── forgot-password.tsx  # Forgot password page
│   │       └── reset-password.tsx   # Reset password page
│   ├── components/                  # Reusable UI components
│   │   ├── dashboard-components/
│   │   │   ├── Header.tsx           # Dashboard top nav bar
│   │   │   ├── Sidebar.tsx          # Semester filter sidebar
│   │   │   ├── ResourceCard.tsx     # Dashboard resource card (21KB - full-featured)
│   │   │   └── StatCard.tsx         # Dashboard stat card
│   │   ├── home-page-components/
│   │   │   ├── Hero.tsx             # Landing page hero section
│   │   │   ├── Features.tsx         # Features showcase section
│   │   │   ├── HowItWorks.tsx       # How it works section
│   │   │   ├── Benefits.tsx         # Benefits section
│   │   │   └── CallToAction.tsx     # CTA section
│   │   ├── layout-components/
│   │   │   ├── Navbar.tsx           # Main navigation bar
│   │   │   └── Footer.tsx           # Footer
│   │   ├── resources-page-components/
│   │   │   ├── BrowseResourceCard.tsx # Public resource card
│   │   │   ├── PageHeader.tsx       # Resources page header with search
│   │   │   ├── SearchBar.tsx        # Search input component
│   │   │   ├── FilterButton.tsx     # Filter toggle button
│   │   │   ├── RefineDropdown.tsx   # Advanced filter dropdown
│   │   │   ├── StatCard.tsx         # Stats card
│   │   │   ├── StatsBanner.tsx      # Stats banner
│   │   │   ├── EmptyState.tsx       # No results state
│   │   │   ├── LoadMoreButton.tsx   # Load more pagination button
│   │   │   └── index.ts            # Barrel exports
│   │   ├── ui-components/
│   │   │   ├── DeleteConfirmModal.tsx # Delete confirmation modal
│   │   │   └── index.ts            # Barrel exports
│   │   ├── privacy-policy-component/ # Privacy policy page sections (12 files)
│   │   ├── disclaimer-component/     # Disclaimer page sections (9 files)
│   │   └── terms-of-service-component/ # ToS page sections (14 files)
│   └── utils/                       # Utility modules
│       ├── prisma.server.ts         # Prisma client singleton
│       ├── ai/
│       │   └── summarize.server.ts  # AI summarization pipeline
│       ├── cookie-session/
│       │   └── session.server.ts    # Cookie session management
│       ├── crypto/
│       │   └── token.server.ts      # Token generation & hashing
│       ├── debounce/
│       │   └── debounce.ts          # Generic debounce utility functions
│       ├── delete-file/
│       │   └── file-delete.server.ts # File deletion (local + R2)
│       ├── download/
│       │   └── download-helpers.server.ts # MIME types, paths, file existence
│       ├── email/
│       │   └── email.server.ts      # Password reset email (Nodemailer + Brevo)
│       ├── format/
│       │   └── file-format.ts       # File size formatting, file type extraction
│       ├── google-auth/
│       │   └── google-auth.server.ts # Google OAuth 2.0 (zero-dependency)
│       ├── handle-time/
│       │   └── relative-time.ts     # Relative time formatting ("2 hours ago")
│       ├── hooks/
│       │   └── use-debounce.ts      # React hooks: useDebounce, useDebouncedCallback
│       ├── pagination/
│       │   └── cursor-pagination.server.ts # Cursor pagination types & helpers
│       ├── password/
│       │   └── password.server.ts   # bcrypt hash & verify
│       ├── prisma/
│       │   ├── dashboard-prisma.server.ts # Dashboard-specific Prisma queries
│       │   └── resource-prisma.server.ts  # Resource-specific Prisma queries
│       ├── r2/
│       │   └── r2.server.ts         # Cloudflare R2 operations (S3Client)
│       ├── resources/
│       │   ├── resource-filters.ts  # Client-side filter logic
│       │   ├── resource-pagination.server.ts # Server-side paginated queries
│       │   └── resource-transform.server.ts  # DB → UI data transformation
│       ├── storage/
│       │   └── storage-error-handler.server.ts # Storage error classification
│       └── validation/
│           └── auth-validation.server.ts # Email & password validation
```

---

## 4. Configuration Files

### 4.1 `package.json`

```json
{
  "name": "",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "react-router build",
    "dev": "react-router dev",
    "start": "react-router-serve ./build/server/nodejs_eyJydW50aW1lIjoibm9kZWpzIn0/index.js",
    "typecheck": "react-router typegen && tsc",
    "postinstall": "prisma generate"
  }
}
```

**Key points:**
- `"type": "module"` — Uses ES modules natively
- `postinstall` runs `prisma generate` automatically after `pnpm install`
- `dev` starts the React Router dev server with HMR
- `build` creates the production build
- `start` serves the production build using `react-router-serve`

### 4.2 `vite.config.ts`

```typescript
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
});
```

**Plugins:**
1. `tailwindcss()` — TailwindCSS v4 Vite plugin (replaces PostCSS setup)
2. `reactRouter()` — React Router Vite plugin (handles SSR, code splitting, route compilation)
3. `tsconfigPaths()` — Enables `~/` path alias (mapped to `./app/*`)

### 4.3 `react-router.config.ts`

```typescript
import { vercelPreset } from "@vercel/react-router/vite";
import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  presets: [vercelPreset()],
  async prerender() {
    return ["/about", "/privacy-policy", "/disclaimer", "/terms-of-service", "/404"];
  },
} satisfies Config;
```

**Key points:**
- `ssr: true` — Server-side rendering is enabled by default
- `vercelPreset()` — Configures the build output for Vercel deployment
- `prerender()` — Pre-renders static pages at build time for performance and SEO

### 4.4 `tsconfig.json`

```json
{
  "include": ["**/*", "**/.server/**/*", "**/.client/**/*", ".react-router/types/**/*"],
  "compilerOptions": {
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "types": ["node", "vite/client"],
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "rootDirs": [".", "./.react-router/types"],
    "baseUrl": ".",
    "paths": { "~/*": ["./app/*"] },
    "esModuleInterop": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "strict": true
  }
}
```

**Key points:**
- Path alias `~/*` maps to `./app/*` (e.g., `import X from '~/utils/prisma.server'`)
- `strict: true` — Full TypeScript strict mode
- `verbatimModuleSyntax: true` — Requires explicit `import type` for type-only imports
- `.server` suffix convention: files ending in `.server.ts` are only included in server bundles

### 4.5 `prisma.config.ts`

```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: process.env["DATABASE_URL"],
    shadowDatabaseUrl: process.env["DIRECT_URL"],
  },
});
```

**`DATABASE_URL`**: Uses Supabase pooler connection (port `5432`).
**`DIRECT_URL`**: Direct connection (port `6543`), used for migrations/shadow database.

### 4.6 `pnpm-workspace.yaml`

```yaml
onlyBuiltDependencies:
  - esbuild
```

Restricts native binary builds to only `esbuild` for faster installs.

---

## 5. Database Schema (Prisma)

### 5.1 Schema File: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

The Prisma client is generated into the `generated/prisma/` directory (gitignored, rebuilt on install via `postinstall` script).

### 5.2 Models

#### `User` Model

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `Int` | `@id @default(autoincrement())` | Primary key, auto-incrementing |
| `user_name` | `String` | — | Display name |
| `email` | `String` | `@unique` | Unique email address |
| `password` | `String?` | — | Nullable; null for Google-only accounts |
| `googleId` | `String?` | `@unique` | Google subject ID for OAuth |
| `profileImg` | `String?` | — | Google profile picture URL |
| `created_at` | `DateTime` | `@default(now())` | Account creation timestamp |
| `updated_at` | `DateTime` | `@updatedAt` | Last update timestamp |
| `resources` | `Resource[]` | — | One-to-many relation |
| `resetTokens` | `PasswordResetToken[]` | — | One-to-many relation |

#### `Resource` Model

| Field | Type | Attributes | Description |
|---|---|---|---|
| `Id` | `Int` | `@id @default(autoincrement())` | Primary key (note: capital `Id`) |
| `title` | `String` | — | Resource title |
| `subject` | `String` | — | Subject name (e.g., "Data Structures") |
| `semester` | `Int` | — | Semester number (1–8) |
| `resource_type` | `String` | — | Type: Notes, Assignment, Quiz, Date Sheet, Syllabus, Past Papers |
| `file_path` | `String` | — | R2 object key (e.g., `user-1/1713000000-file.pdf`) or legacy `/uploads/...` path |
| `file_size` | `BigInt` | — | File size in bytes |
| `downloads` | `Int` | `@default(0)` | Download counter |
| `isPublic` | `Boolean` | `@default(false)` | Whether resource is publicly visible |
| `user_id` | `Int` | — | Foreign key to `User.id` |
| `user` | `User` | `@relation(fields: [user_id], references: [id])` | Owner relation |
| `created_at` | `DateTime` | `@default(now())` | Upload timestamp |
| `updated_at` | `DateTime` | `@updatedAt` | Last update timestamp |

#### `PasswordResetToken` Model

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `Int` | `@id @default(autoincrement())` | Primary key |
| `token` | `String` | `@unique` | SHA-256 hash of the raw token |
| `userId` | `Int` | — | Foreign key to `User.id` |
| `user` | `User` | `@relation(fields: [userId], references: [id], onDelete: Cascade)` | Cascade delete when user is deleted |
| `expiresAt` | `DateTime` | — | Token expiry (1 hour from creation) |
| `used` | `Boolean` | `@default(false)` | Whether token has been used |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |

### 5.3 Prisma Client Singleton

**File:** `app/utils/prisma.server.ts`

```typescript
import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export default prisma;
```

Uses the **PrismaPg driver adapter** instead of Prisma's default query engine. This connects to PostgreSQL using the `pg` npm package directly, which is required for edge/serverless environments and Supabase pooled connections.

---

## 6. Routing Architecture

### 6.1 Route Definition File: `app/routes.ts`

The application uses **programmatic route configuration** (not file-based routing). Routes are organized into **four groups**:

```typescript
export default [
  // 1. MAIN LAYOUT — Public pages with Navbar + Footer
  layout("./layout/main-layout.tsx", [
    index("./routes/index.tsx"),                         // /
    route("about", "routes/about.tsx"),                   // /about
    route("resources", "routes/resources.tsx"),           // /resources
    route("features", "routes/features.tsx"),             // /features
    route("terms-of-service", "routes/terms-of-service.tsx"),
    route("privacy-policy", "routes/privacy-policy.tsx"),
    route("disclaimer", "routes/disclaimer.tsx"),
  ]),

  // 2. DASHBOARD LAYOUT — Protected pages with Header + Sidebar
  layout("./layout/dashboard-layout.tsx", [
    route("user/dashboard", "routes/dashboard.tsx"),      // /user/dashboard
  ]),

  // 3. AUTH LAYOUT — Centered card layout
  layout("./layout/auth-layout.tsx", [
    route("sign-up", "routes/auth/sign-up.tsx"),          // /sign-up
    route("login", "routes/auth/login.tsx"),              // /login
    route("logout", "routes/auth/logout.tsx"),            // /logout
    route("auth/google", "routes/auth/google.tsx"),       // /auth/google
    route("auth/google/callback", "routes/auth/google.callback.tsx"),
    route("forgot-password", "routes/auth/forgot-password.tsx"),
    route("reset-password", "routes/auth/reset-password.tsx"),
  ]),

  // 4. STANDALONE ROUTES — No layout wrapper
  route("download/:id", "routes/download.$id.tsx"),       // /download/:id
  route("api.r2-upload", "routes/api.r2-upload.tsx"),     // /api.r2-upload
  route("api/summarize", "routes/api.summarize.tsx"),     // /api/summarize
  route("404", "routes/_404.tsx"),                        // /404
  route("*", "routes/$.tsx"),                             // Catch-all → /404
] satisfies RouteConfig;
```

### 6.2 Route Summary Table

| Path | Layout | Auth Required | Type | Description |
|---|---|---|---|---|
| `/` | Main | No | Page | Landing page |
| `/about` | Main | No | Page | About page (pre-rendered) |
| `/resources` | Main | No | Page | Public resource browser |
| `/features` | Main | No | Page | Features page |
| `/terms-of-service` | Main | No | Page | Terms (pre-rendered) |
| `/privacy-policy` | Main | No | Page | Privacy policy (pre-rendered) |
| `/disclaimer` | Main | No | Page | Disclaimer (pre-rendered) |
| `/user/dashboard` | Dashboard | **Yes** | Page | User resource dashboard |
| `/sign-up` | Auth | No (redirects if logged in) | Page | Registration |
| `/login` | Auth | No (redirects if logged in) | Page | Login |
| `/logout` | Auth | — | Action only | Destroys session |
| `/auth/google` | Auth | No | Redirect | Redirects to Google consent |
| `/auth/google/callback` | Auth | No | Loader only | Handles OAuth callback |
| `/forgot-password` | Auth | No | Page | Request reset link |
| `/reset-password` | Auth | No | Page | Set new password |
| `/download/:id` | None | No | Loader only | File download (binary response) |
| `/api.r2-upload` | None | **Yes** | Action only | R2 upload API |
| `/api/summarize` | None | **Yes** | Action only | AI summarize API |
| `/404` | None | No | Page | 404 page |
| `*` | None | No | Redirect | Catch-all → /404 |

---

## 7. Layouts

### 7.1 Main Layout (`app/layout/main-layout.tsx`)

**Used by:** All public-facing pages (home, about, resources, features, legal pages)

**Loader:** Checks if user is logged in via `getUserId(request)` and passes `isLoggedIn` boolean to the `Navbar`.

**Structure:**
```
<Navbar isLoggedIn={boolean} />
<main>
  <Outlet />  ← child route content
</main>
<Footer />
```

### 7.2 Dashboard Layout (`app/layout/dashboard-layout.tsx`)

**Used by:** `/user/dashboard`

**Loader:**
1. Checks authentication — redirects to `/login` if not authenticated
2. Fetches user profile from database (`user_name`, `profileImg`)
3. Returns user info or fallback data on database error

**Features:**
- **Sidebar** with semester filters (1–8) — clicking a semester updates URL params
- **Header** with search bar (debounced with 500ms delay)
- **Semester counts** communicated from child route via `window.dashboardSemesterCounts` + `CustomEvent('dashboardCountsUpdated')`
- Search updates URL with debounced value; URL changes trigger loader revalidation

**Structure:**
```
<div className="min-h-screen">
  <Header sidebarOpen setSidebarOpen userInfo searchQuery onSearchChange />
  <div className="max-w-7xl mx-auto flex">
    <Sidebar sidebarOpen setSidebarOpen selectedSemester onSemesterClick semesterCounts />
    <main className="flex-1 p-4 lg:p-8">
      <Outlet />  ← dashboard.tsx content
    </main>
  </div>
</div>
```

### 7.3 Auth Layout (`app/layout/auth-layout.tsx`)

**Used by:** All authentication pages (login, sign-up, logout, forgot-password, reset-password, Google OAuth)

**Structure:**
```
<div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
  <!-- Background decoration blobs -->
  <div className="max-w-md w-full">
    <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-5">
      <Outlet />  ← auth form content
    </div>
  </div>
</div>
```

---

## 8. Pages & Route Handlers

### 8.1 Home Page (`routes/index.tsx`)

- **Path:** `/`
- **SEO:** Comprehensive meta tags (Open Graph, Twitter Cards, Schema.org `WebSite` with `SearchAction`)
- **Components:** `<Hero />`, `<Features />`, `<HowItWorks />`, `<Benefits />`, `<CallToAction />`
- **No loader/action** — purely presentational

### 8.2 Dashboard (`routes/dashboard.tsx`) — **MOST COMPLEX ROUTE**

- **Path:** `/user/dashboard`
- **Auth:** Redirects to `/login` if not authenticated

#### Loader
- Accepts URL params: `cursor`, `search`, `semester`, `type`
- Returns a **deferred promise** (`resourcesPromise`) that resolves to:
  - `resources: any[]` — Paginated resource list
  - `nextCursor: string | null` — For cursor-based pagination
  - `hasMore: boolean` — Whether more results exist
  - `semesterCounts: Record<number, number>` — Count of resources per semester
  - `error: string | null` — Error message if any

#### Action (handles multiple intents via `intent` form field)

| Intent | Behavior |
|---|---|
| `load-more` | Fetches next page via cursor pagination |
| `publish` / `unpublish` | Toggles `isPublic` flag on a resource |
| `download` | Validates resource ownership, checks file existence (local or R2), returns download URL |
| `delete` | Deletes file from storage (R2 or local), then deletes database record |

#### `shouldRevalidate`
Returns `false` for `load-more` and `download` intents to prevent full page revalidation.

#### Client-Side Features
- **Upload modal** with drag-and-drop file selection
- **3-phase upload process** (prepare → upload → confirm) with progress bar
- **File validation**: max 20MB, allowed types: PDF, DOCX, DOC, JPG, JPEG, PNG
- **Cursor-based "Load More" pagination** using React Router's `useFetcher`
- **Resource type filter** buttons (All Types, Notes, Assignment, Quiz)
- **Loading skeleton** (`CardsSkeleton`) shown via React `Suspense` + `Await`

### 8.3 Resources Browse Page (`routes/resources.tsx`)

- **Path:** `/resources`
- **Auth:** Not required (public page)

#### Loader
- Accepts URL params: `cursor`, `search`, `semester`, `type`
- Fetches paginated **public** resources (only `isPublic: true`)
- Also fetches `totalCount` and `userCount` for stats display
- Returns deferred promise

#### Action
- `load-more`: Fetches next page
- `download`: Validates resource exists, checks file in storage, returns download URL

#### Client-Side Features
- **Debounced search** (500ms) via `useDebounce` hook
- **Semester filter** with count badges
- **Resource type filter** dropdown
- **URL sync**: Filters sync to URL params for shareable/bookmarkable state
- **Skeleton loading** fallback

### 8.4 Download Route (`routes/download.$id.tsx`)

- **Path:** `/download/:id`
- **Type:** Loader-only (returns binary Response, no UI)

#### Flow:
1. Parse and validate resource ID from URL params
2. Look up resource in database (without incrementing download count)
3. Check file existence in storage:
   - **Local files**: Path starts with `/uploads/` → use `existsSync`
   - **R2 files**: Use `objectExistsInR2()` (HeadObject)
4. **Only if file exists**: increment download count in database
5. Read file buffer (from local disk or R2)
6. Return `Response` with binary data, correct `Content-Type`, and `Content-Disposition: attachment`

**Error handling:** Redirects to `/resources?error=<code>` on any failure (invalid ID, resource not found, file not found, read error).

### 8.5 R2 Upload API (`routes/api.r2-upload.tsx`)

- **Path:** `/api.r2-upload`
- **Auth:** Required (checks `getUserId`)

#### Two intents:

**`get-upload-url`:**
1. Validates file metadata (name, type, size ≤ 20MB)
2. Sanitizes filename: `file.name.replace(/[^a-zA-Z0-9.-]/g, '-')`
3. Creates R2 object key: `user-${userId}/${Date.now()}-${sanitizedName}`
4. Generates pre-signed PUT URL (1-hour expiry) via `@aws-sdk/s3-request-presigner`
5. Returns `{ ok: true, uploadUrl, fileKey }`

**`confirm-upload`:**
1. Validates all required metadata fields (title, semester, subject, resource_type, fileKey, fileSize)
2. Creates `Resource` record in database with the R2 key as `file_path`
3. Returns `{ ok: true, resourceId }`

### 8.6 AI Summarize API (`routes/api.summarize.tsx`)

- **Path:** `/api/summarize`
- **Auth:** Required

#### Flow:
1. Verify user owns the resource via `getUserResourceById()`
2. Check file is summarizable (`.pdf` or `.docx` only)
3. Call `summarizeResource()` pipeline:
   - Fetch file buffer from R2
   - Extract text (pdf-parse for PDF, mammoth for DOCX)
   - Send to Groq API (LLaMA 3.3 70B) with summarization prompt
4. Return `{ ok: true, summary }`

---

## 9. Authentication System

### 9.1 Email/Password Registration (`routes/auth/sign-up.tsx`)

1. **Loader:** If user is already logged in → redirect to `/user/dashboard`
2. **Action:**
   - Validate: username required, email format, password ≥ 8 chars
   - Check if email already exists in database
   - Hash password with bcrypt (12 salt rounds)
   - Create user in database
   - Create session cookie and redirect to `/user/dashboard`

### 9.2 Email/Password Login (`routes/auth/login.tsx`)

1. **Loader:** If user is already logged in → redirect to `/user/dashboard`
2. **Action:**
   - Validate email format
   - Find user by email
   - If user has no password (Google-only account) → show appropriate error message
   - Verify password with bcrypt
   - Create session cookie and redirect to `/user/dashboard`
3. **UI:** Shows OAuth error messages from URL params (e.g., after failed Google sign-in)

### 9.3 Google OAuth 2.0

**Implementation:** Zero external dependencies. Uses Google's REST endpoints directly with `fetch()`.

#### Flow:

1. **`/auth/google`** (Loader):
   - If authenticated → redirect to dashboard
   - Build Google consent URL with params: `client_id`, `redirect_uri`, `response_type=code`, `scope=openid email profile`, `access_type=offline`, `prompt=consent`
   - Redirect to Google

2. **`/auth/google/callback`** (Loader):
   - Extract `code` from URL query params
   - Exchange authorization code for tokens via `POST https://oauth2.googleapis.com/token`
   - Fetch user info via `GET https://www.googleapis.com/oauth2/v2/userinfo`
   - Check `verified_email` — reject if unverified
   - **Find or create user:**
     - Search by `googleId` OR `email`
     - If found: link Google account if not already linked, update profile image
     - If not found: create new user (no password — Google-only)
   - Create session cookie and redirect to dashboard

### 9.4 Password Reset

#### Forgot Password (`routes/auth/forgot-password.tsx`)

1. Validate email
2. **Always return success** (prevents email enumeration)
3. If user exists and has a password:
   - Rate limit: max 3 active tokens per user (oldest deleted)
   - Generate 32-byte random token → SHA-256 hash stored in database
   - Token expires in 1 hour
   - Send email with link: `{APP_URL}/reset-password?token={rawToken}`

#### Reset Password (`routes/auth/reset-password.tsx`)

1. **Loader:** Validate token from URL query — hash it, look up in database, check not used/expired
2. **Action:**
   - Validate password (≥8 chars) & confirm match
   - Re-validate token (race condition protection)
   - Within a Prisma transaction:
     - Update user's password (bcrypt hash)
     - Mark token as used
     - Delete all other tokens for this user
   - Redirect to `/login?reset=success`

### 9.5 Logout (`routes/auth/logout.tsx`)

- Action-only route (no UI)
- Destroys the session cookie and redirects to `/`

---

## 10. Session Management

**File:** `app/utils/cookie-session/session.server.ts`

Uses React Router's built-in `createCookieSessionStorage`:

```typescript
const authSession = createCookieSessionStorage({
  cookie: {
    name: "auth_session",
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: true,
    secrets: [process.env.SESSION_SECRET],
    maxAge: 60 * 60 * 24 * 30,  // 30 days
  },
});
```

**Cookie properties:**
- **`httpOnly: true`** — Not accessible via JavaScript (XSS protection)
- **`secure: true`** — Only sent over HTTPS
- **`sameSite: "lax"`** — CSRF protection (sent with top-level navigations)
- **`secrets`** — Used for signing/encrypting the cookie value
- **`maxAge: 30 days`** — Cookie expires after 30 days

**Exported functions:**
- `getUserId(request)` — Extracts `userId` from session cookie
- `createLoginSession(userId, redirectTo)` — Creates session, sets cookie, redirects
- `logout(request)` — Destroys session, redirects to `/`

---

## 11. File Upload Workflow (R2 Pre-signed URLs)

### Complete Flow Diagram

```
Client (Browser)                    Server                     Cloudflare R2
     │                                │                            │
     │ 1. User fills form +           │                            │
     │    selects file                 │                            │
     │                                │                            │
     │ 2. POST /api.r2-upload         │                            │
     │    intent=get-upload-url       │                            │
     │    fileName, fileType, fileSize│                            │
     │ ──────────────────────────────>│                            │
     │                                │ 3. Validate file meta      │
     │                                │ 4. Sanitize filename       │
     │                                │ 5. Generate key:           │
     │                                │    user-{id}/{ts}-{name}   │
     │                                │ 6. Create pre-signed URL   │
     │                                │    (PutObjectCommand,      │
     │                                │     1-hour expiry)         │
     │ <──────────────────────────────│                            │
     │    { uploadUrl, fileKey }      │                            │
     │                                │                            │
     │ 7. PUT {uploadUrl}             │                            │
     │    Content-Type: {fileType}    │                            │
     │    Body: raw file bytes        │                            │
     │ ──────────────────────────────────────────────────────────> │
     │                                │                            │ 8. Store file
     │ <────────────────────────────────────────────────────────── │
     │    200 OK                      │                            │
     │                                │                            │
     │ 9. POST /api.r2-upload         │                            │
     │    intent=confirm-upload       │                            │
     │    fileKey, fileSize,          │                            │
     │    title, semester,            │                            │
     │    subject, resource_type      │                            │
     │ ──────────────────────────────>│                            │
     │                                │ 10. Create Resource        │
     │                                │     in database with       │
     │                                │     file_path = fileKey    │
     │ <──────────────────────────────│                            │
     │    { ok: true, resourceId }   │                            │
```

### Key Implementation Details

- **Client-side progress tracking:** Uses `XMLHttpRequest` (not `fetch`) for upload to get `xhr.upload.onprogress` events
- **3-phase UI:** "Preparing upload..." → "Uploading... 42%" → "Saving resource..."
- **File validation (client-side):** Max 20MB; allowed: PDF, DOCX, DOC, JPG, JPEG, PNG
- **File validation (server-side):** Same checks repeated in the API route
- **R2 key format:** `user-{userId}/{timestamp}-{sanitized-filename}`
- Each user gets their own folder in R2

---

## 12. File Download System

### Flow

```
Client                             Server                    R2 / Local Storage
  │                                  │                            │
  │ 1. Click download button         │                            │
  │    → POST /user/dashboard        │                            │
  │      intent=download             │                            │
  │      resourceId=42               │                            │
  │ ────────────────────────────────>│                            │
  │                                  │ 2. Verify ownership        │
  │                                  │ 3. Check file existence    │
  │                                  │    (HeadObject for R2,     │
  │                                  │     existsSync for local)  │
  │ <────────────────────────────────│                            │
  │    { downloadUrl: /download/42 } │                            │
  │                                  │                            │
  │ 4. GET /download/42              │                            │
  │ ────────────────────────────────>│                            │
  │                                  │ 5. Get resource from DB    │
  │                                  │ 6. Re-check file exists    │
  │                                  │ 7. Increment downloads     │
  │                                  │ 8. Read file buffer        │
  │                                  │    ────────────────────── >│
  │                                  │    <────────────────────── │
  │ <────────────────────────────────│                            │
  │    Binary response with:         │                            │
  │    Content-Type: application/pdf │                            │
  │    Content-Disposition: attach.  │                            │
  │    Content-Length: 1234567       │                            │
```

### Dual Storage Support

The system supports **both** legacy local storage (`/uploads/...` paths) and R2 cloud storage:
- Paths starting with `/uploads/` → local filesystem (`public/uploads/`)
- All other paths → Cloudflare R2 object keys

---

## 13. AI-Powered Document Summarization

### Pipeline (`app/utils/ai/summarize.server.ts`)

```
File in R2 → Fetch Buffer → Extract Text → Truncate → LLaMA 3.3 70B → Summary
```

#### Step 1: Fetch File
Uses `getObjectBufferFromR2()` to download the complete file buffer from Cloudflare R2.

#### Step 2: Extract Text

| File Type | Library | Method |
|---|---|---|
| `.pdf` | `pdf-parse` (`PDFParse` class) | `new PDFParse({ data: buffer })` → `parser.getText()` |
| `.docx` | `mammoth` | `mammoth.extractRawText({ buffer })` → `result.value` |

#### Step 3: Summarize with AI

**API Configuration:**
```typescript
const client = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.AI_API_KEY,
});
```

**Model:** `llama-3.3-70b-versatile` (hosted on Groq)

**Request parameters:**
- `max_tokens: 1500`
- `temperature: 0.3` (more deterministic output)
- Text truncated to **60,000 characters** (≈15k tokens) to avoid limits

**System prompt:**
> "You are a helpful academic assistant. Summarize the following document concisely. Focus on key points, main arguments, and important details. Use bullet points and clear headings where appropriate. Keep the summary informative yet concise."

#### Supported File Types
Only `.pdf` and `.docx` — checked by `isSummarizable()` function.

---

## 14. Component Architecture

### 14.1 Dashboard Components

#### `ResourceCard.tsx` (21KB — largest component)
Renders each resource card on the user's dashboard. Includes:
- Resource type icon and badge
- Title, subject, semester
- File size and download count
- **Publish/Unpublish** toggle (uses `useFetcher` for optimistic UI)
- **Download** button (validates file existence via action, then opens `/download/:id`)
- **Summarize** button (only for PDF/DOCX; calls `/api/summarize`, renders markdown result)
- **Delete** button (shows confirmation modal)
- Action menu (three-dot dropdown)

#### `Header.tsx` — Dashboard top navigation
- Logo, search input, user avatar/name, profile dropdown
- Mobile hamburger menu toggle

#### `Sidebar.tsx` — Semester filter sidebar
- "All Resources" button + 8 semester filter buttons
- Shows resource count badges per semester
- Responsive: off-canvas on mobile, fixed on desktop

#### `StatCard.tsx` — Stat display card

### 14.2 Home Page Components

| Component | Description |
|---|---|
| `Hero.tsx` (8KB) | Full-width hero with headline, subtitle, CTA buttons, animated stats |
| `Features.tsx` (7KB) | Grid of feature cards with icons |
| `HowItWorks.tsx` (2.3KB) | Step-by-step process explanation |
| `Benefits.tsx` (3.3KB) | Problem/solution benefits section |
| `CallToAction.tsx` (1.7KB) | Final CTA section with sign-up link |

### 14.3 Layout Components

| Component | Description |
|---|---|
| `Navbar.tsx` (7.7KB) | Main navigation. Shows login/sign-up if not logged in; dashboard link if logged in. Mobile responsive with hamburger menu |
| `Footer.tsx` (9.9KB) | Full footer with links, social media, newsletter signup area |

### 14.4 Resources Page Components

| Component | Description |
|---|---|
| `BrowseResourceCard.tsx` (6.7KB) | Public resource card with download button |
| `PageHeader.tsx` (2.4KB) | Page title, description, search input, filter toggles |
| `SearchBar.tsx` (1.4KB) | Search input component |
| `FilterButton.tsx` (0.8KB) | Individual filter toggle button |
| `RefineDropdown.tsx` (4.9KB) | Advanced filters dropdown (semester, type) |
| `StatCard.tsx` (1.4KB) | Stats display card |
| `StatsBanner.tsx` (0.6KB) | Horizontal banner with stat cards |
| `EmptyState.tsx` (1.3KB) | "No results found" state with clear filters button |
| `LoadMoreButton.tsx` (1KB) | Cursor-based load-more button |

### 14.5 Legal Page Components

- **Privacy Policy:** 12 section components (Introduction, Information Collection, How We Use, Data Sharing, Cookies, Security, Privacy Rights, Contact, Navigation Sidebar, etc.)
- **Disclaimer:** 9 section components
- **Terms of Service:** 14 section components (Acceptable Use, User Accounts, Content, IP, Prohibited Content, Termination, etc.)

### 14.6 UI Components

| Component | Description |
|---|---|
| `DeleteConfirmModal.tsx` (2.2KB) | Confirmation dialog for resource deletion with cancel/confirm buttons |

---

## 15. Utility Modules (Complete Reference)

### 15.1 `utils/prisma.server.ts` — Prisma Client
Singleton Prisma client with PrismaPg adapter. See [Section 5.3](#53-prisma-client-singleton).

### 15.2 `utils/cookie-session/session.server.ts` — Sessions
Cookie session storage. See [Section 10](#10-session-management).

### 15.3 `utils/password/password.server.ts` — Password Hashing

```typescript
import bcrypt from "bcryptjs";
const SALT_ROUNDS = 12;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
```

### 15.4 `utils/validation/auth-validation.server.ts` — Input Validation

| Function | Logic |
|---|---|
| `validateEmail(email)` | Trims, checks non-empty, validates with regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| `validatePasswordLength(password, minLength=8)` | Trims, checks non-empty, checks `length >= minLength` |

Both return `string | null` — error message or null if valid.

### 15.5 `utils/crypto/token.server.ts` — Token Utilities

```typescript
import { randomBytes, createHash } from "crypto";

export function generateToken(): string {
  return randomBytes(32).toString("hex");  // 64-char hex string
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
```

The raw token is sent in the email link; only the SHA-256 hash is stored in the database.

### 15.6 `utils/google-auth/google-auth.server.ts` — Google OAuth

Zero external dependencies. Three functions:

| Function | Description |
|---|---|
| `getGoogleAuthURL()` | Builds Google OAuth consent URL with client_id, redirect_uri, scopes |
| `getGoogleTokens(code)` | Exchanges authorization code for tokens via POST to `https://oauth2.googleapis.com/token` |
| `getGoogleUserInfo(accessToken)` | Fetches user profile from `https://www.googleapis.com/oauth2/v2/userinfo` |

**Redirect URI:** `{APP_URL}/auth/google/callback`

### 15.7 `utils/email/email.server.ts` — Email Sending

Uses **Nodemailer** with **Brevo (Sendinblue) SMTP**.

**Transporter config:**
```typescript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,      // smtp-relay.brevo.com
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,    // Brevo SMTP login
    pass: process.env.SMTP_PASS,    // Brevo API key
  },
});
```

**`sendPasswordResetEmail(toEmail, resetUrl)`:**
- In development: logs the reset URL to console
- Sends styled HTML email with StudyVault branding
- **Never throws** — errors are logged but swallowed (prevents email enumeration)

### 15.8 `utils/r2/r2.server.ts` — Cloudflare R2 Operations

Uses `@aws-sdk/client-s3` with R2-compatible endpoint:

```typescript
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});
```

| Function | S3 Command | Description |
|---|---|---|
| `createPresignedUploadUrl(options)` | `PutObjectCommand` + `getSignedUrl` | Pre-signed PUT URL (default 1-hour expiry) |
| `deleteObjectFromR2(key)` | `DeleteObjectCommand` | Delete object; returns boolean |
| `objectExistsInR2(key)` | `HeadObjectCommand` | Check existence; returns boolean |
| `getObjectBufferFromR2(key)` | `GetObjectCommand` | Read object; converts stream to Buffer |

### 15.9 `utils/delete-file/file-delete.server.ts` — File Deletion

- `deleteFileLocally(filePath)` — Deletes from `public/{filePath}` with existence check
- `deleteFileSafely(filePath)` — Smart deletion:
  - If path starts with `/uploads/` → delete locally
  - Otherwise → delete from R2 via `deleteObjectFromR2()`
  - **Never throws** — logs errors, returns boolean

### 15.10 `utils/download/download-helpers.server.ts` — Download Helpers

| Function | Description |
|---|---|
| `getMimeType(filePath)` | Maps extension to MIME type (pdf, docx, doc, jpg, jpeg, png) |
| `sanitizeFileName(title)` | Replaces non-alphanumeric chars with hyphens |
| `getFullFilePath(relativePath)` | Joins `process.cwd() + 'public' + relativePath` |
| `fileExists(relativePath)` | Checks local file existence with `existsSync` |
| `generateDownloadFileName(title, filePath)` | Creates download filename: `{sanitized-title}{extension}` |

### 15.11 `utils/resources/resource-pagination.server.ts` — Paginated Queries

**`getPaginatedResources(params)`:**
- Builds Prisma `where` clause from filters (semester, type, search, cursor, userId)
- **If `userId` provided:** Filters by `user_id` (dashboard — user's own resources)
- **If no `userId`:** Filters by `isPublic: true` (public browse page)
- **Cursor pagination:** Fetches `limit + 1` items; if extra item exists → `hasMore = true`
- **Cursor method:** Uses `created_at` timestamp comparison (not Prisma's `cursor` API)
- **Search:** Case-insensitive `contains` on `title` and `subject` fields
- **Ordering:** `created_at: 'desc'` (newest first)
- **Default page size:** 6 items

### 15.12 `utils/resources/resource-transform.server.ts` — Data Transformation

Transforms database `Resource` objects into `TransformedResource` for the UI:

```typescript
interface TransformedResource {
  id: number;
  title: string;
  subject: string;
  semester: number;
  type: string;         // resource_type
  fileType: string;     // e.g., "PDF" (extracted from file_path)
  size: string;         // e.g., "2.4 MB" (formatted from file_size)
  uploadedBy: string;   // user.user_name
  uploadedDate: string; // e.g., "2 hours ago" (relative time)
  downloads: number;
}
```

### 15.13 `utils/resources/resource-filters.ts` — Client-Side Filters

| Function | Description |
|---|---|
| `filterResources(resources, filters)` | Filters by semester, type, and search query (client-side) |
| `calculateSemesterCounts(resources)` | Counts resources per semester (1–8) |
| `hasActiveFilters(filters)` | Returns true if any filter is non-default |

### 15.14 `utils/prisma/dashboard-prisma.server.ts` — Dashboard Queries

| Function | Description |
|---|---|
| `getUserResources(userId)` | All resources for a user (ordered by newest) |
| `getUserResourceById(resourceId, userId)` | Single resource with ownership check |
| `updateResourcePublishStatus(resourceId, isPublic)` | Toggle publish flag |
| `createResource(data)` | Create new resource record |
| `deleteResource(resourceId)` | Delete resource by ID |
| `getResourceById(resourceId)` | Get resource without user check |
| `getUserSemesterCounts(userId)` | Count resources per semester for sidebar badges |

### 15.15 `utils/prisma/resource-prisma.server.ts` — Resource Queries

| Function | Description |
|---|---|
| `getResourceForDownload(resourceId)` | Gets `file_path`, `title`, `isPublic` (for download route) |
| `incrementResourceDownload(resourceId)` | Atomic `downloads: { increment: 1 }` |
| `getTotalPublicResourceCount()` | Count of `isPublic: true` resources |
| `getTotalResourceCount()` | Count of all resources |
| `getTotalUserCount()` | Count of all users |

### 15.16 `utils/pagination/cursor-pagination.server.ts` — Pagination Primitives

```typescript
export const DEFAULT_PAGE_SIZE = 6;

export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
  searchQuery?: string;
}

export interface CursorPaginationResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
```

- `parseCursor(cursor)` — Parses string to number or undefined
- `createSearchConditions(searchQuery)` — Creates Prisma OR condition for `title` and `subject` with case-insensitive `contains`

### 15.17 `utils/hooks/use-debounce.ts` — React Debounce Hooks

- `useDebounce<T>(value, delay=500)` — Returns debounced value
- `useDebouncedCallback<T>(callback, delay=500)` — Returns debounced callback function

### 15.18 `utils/debounce/debounce.ts` — Vanilla Debounce Functions

- `debounce(func, wait)` — Standard debounce
- `debounceWithImmediate(func, wait, immediate=false)` — Debounce with optional immediate execution

### 15.19 `utils/handle-time/relative-time.ts` — Relative Time

`getRelativeTime(date, now?)` — Converts Date to human-readable relative time:
- `"just now"` (< 60 seconds)
- `"5 min ago"`, `"3 hours ago"`, `"2 days ago"`, `"1 week ago"`, `"3 months ago"`, `"1 year ago"`

### 15.20 `utils/format/file-format.ts` — File Formatting

- `formatFileSize(bytes)` — e.g., `1048576` → `"1 MB"`
- `getFileType(filePath)` — e.g., `"user-1/file.pdf"` → `"PDF"`

### 15.21 `utils/storage/storage-error-handler.server.ts` — Storage Error Classification

`analyzeStorageError(error)` → Returns `StorageErrorInfo`:
- Classifies errors as: permission (`EACCES`), space (`ENOSPC`), path (`ENOENT`), or general storage
- Provides user-friendly error messages

### 15.22 `utils/ai/summarize.server.ts` — AI Summarization

See [Section 13](#13-ai-powered-document-summarization) for full details.

---

## 16. Styling & Design System

### 16.1 Global CSS (`app/app.css`)

```css
/* Google Fonts - loaded first */
@import url('https://fonts.googleapis.com/css2?family=Ovo&family=Outfit:wght@400;500;600;700;800&display=swap');

/* TailwindCSS v4 */
@import "tailwindcss";

@theme {
  --font-heading: "Outfit", ui-sans-serif, system-ui, sans-serif, ...;
  --font-body: "Ovo", ui-serif, serif, ...;
}

html, body {
  @apply bg-[#f5f5f0] dark:bg-gray-800;
  font-family: var(--font-body);
}

h1, h2, h3, h4, h5, h6, button {
  font-family: var(--font-heading);
}
```

### 16.2 Typography

| Usage | Font Family | Weight |
|---|---|---|
| Headings & buttons | **Outfit** (sans-serif) | 400–800 |
| Body text | **Ovo** (serif) | 400 |

### 16.3 Color Palette

| Role | Color | Hex | Usage |
|---|---|---|---|
| **Primary** | Warm orange/terracotta | `#d97757` | CTAs, links, accents, brand identity |
| **Primary hover** | Darker terracotta | `#c66847` | Button hover states |
| **Background** | Off-white/cream | `#f5f5f0` | Page backgrounds (light mode) |
| **Dark mode background** | Dark gray | `gray-800` / `gray-900` | Dark mode backgrounds |
| **Text** | Gray 900 | — | Primary text (light mode) |
| **Text (dark)** | Gray 100 | — | Primary text (dark mode) |

### 16.4 Design Patterns

- **Dark mode:** Supported via `dark:` Tailwind prefix (uses `prefers-color-scheme`)
- **Responsive:** Mobile-first with `sm:`, `md:`, `lg:` breakpoints
- **Animations:** Pulse, bounce, hover scale (`hover:scale-[1.02]`), backdrop blur (`backdrop-blur-sm`)
- **Background decorations:** Large blurred circles (`blur-3xl`, `opacity-5/10`) as decorative elements
- **Cards:** White with rounded corners (`rounded-2xl`), shadows (`shadow-lg`, `shadow-2xl`)
- **Hover effects:** Translation (`hover:-translate-y-2`), shadow change, color transitions
- **Gradients:** `bg-linear-to-r from-[#d97757] to-[#c66847]` (primary gradient)
- **Icon library:** Lucide React — all icons are SVG components

---

## 17. SEO Strategy

### 17.1 Meta Tags

Every page includes comprehensive meta tags:

- **Title** & **description** with targeted keywords
- **Open Graph** tags (og:type, og:url, og:title, og:description, og:site_name, og:locale)
- **Twitter Card** tags (twitter:card, twitter:title, twitter:description, twitter:site)
- **Robots directive** (`index, follow` for public pages; `noindex, nofollow` for auth pages)
- **Theme color:** `#d97757`
- **Mobile optimization** tags (viewport, apple-mobile-web-app-capable)

### 17.2 Schema.org Markup

**Home page:** `WebSite` type with `SearchAction`:
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Study Vault",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://studyvault.com/resources?q={search_term_string}"
  }
}
```

**Resources page:** `CollectionPage` with `ItemList`

**Features page:** `WebPage` as part of `WebSite`

### 17.3 Pre-rendering

Static pages are pre-rendered at build time:
- `/about`, `/privacy-policy`, `/disclaimer`, `/terms-of-service`, `/404`

### 17.4 Performance

- Deferred data loading with React `Suspense` + `Await`
- Skeleton loaders during data fetching
- `shouldRevalidate` returns `false` for pagination and download actions to avoid unnecessary data refetching

---

## 18. Deployment & DevOps

### 18.1 Vercel Deployment (Primary)

**Configuration:** `@vercel/react-router` preset in `react-router.config.ts`

Builds optimized for Vercel's serverless platform with:
- Automatic SSR
- Pre-rendered static pages
- Edge-compatible Prisma client (via PrismaPg adapter)

### 18.2 Docker Deployment

**`Dockerfile`** — Multi-stage build:

```dockerfile
# Stage 1: Install ALL dependencies
FROM node:20-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

# Stage 2: Install production-only dependencies
FROM node:20-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

# Stage 3: Build the app
FROM node:20-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

# Stage 4: Production image
FROM node:20-alpine
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["npm", "run", "start"]
```

**`.dockerignore`:**
```
.react-router
build
node_modules
README.md
```

### 18.3 Docker Compose (Local Development Database)

```yaml
services:
  postgres:
    image: postgres:latest
    container_name: student-vault-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: root
      POSTGRES_PASSWORD: root@123
      POSTGRES_DB: student_vault_db
    ports:
      - "1127:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
```

Maps host port `1127` to container port `5432`.

### 18.4 `.gitignore`

```
.DS_Store
.env
/node_modules/
/.react-router/
/build/
/generated/prisma
```

---

## 19. Environment Variables

| Variable | Required | Description | Example |
|---|---|---|---|
| `SESSION_SECRET` | Yes | Secret for signing session cookies | `your-session-key` |
| `DATABASE_URL` | Yes | PostgreSQL connection string (pooled) | `postgresql://user:pass@host:5432/db` |
| `DIRECT_URL` | Yes | Direct PostgreSQL URL (for migrations) | `postgresql://user:pass@host:6543/db` |
| `R2_BUCKET_NAME` | Yes | Cloudflare R2 bucket name | `study-vault` |
| `R2_ACCESS_KEY_ID` | Yes | R2 API access key | `a82f8f...` |
| `R2_SECRET_ACCESS_KEY` | Yes | R2 API secret key | `f918c1...` |
| `R2_ACCOUNT_ID` | Yes | Cloudflare account ID | `f109d9...` |
| `R2_TOKEN_VALUE` | No | R2 API token (unused in code) | `KjFQGq...` |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID | `909532...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret | `GOCSPX-...` |
| `APP_URL` | Yes | Application base URL | `https://study-vault-platform.vercel.app` |
| `SMTP_HOST` | Yes | SMTP server hostname | `smtp-relay.brevo.com` |
| `SMTP_PORT` | Yes | SMTP server port | `587` |
| `SMTP_FROM` | Yes | Sender email address | `syedzain2236@gmail.com` |
| `SMTP_USER` | Yes | SMTP authentication username | `a39928001@smtp-brevo.com` |
| `SMTP_PASS` | Yes | SMTP authentication password | `xsmtpsib-...` |
| `AI_API_KEY` | Yes | Groq API key for AI summarization | `gsk_CxYVf...` |

---

## 20. Data Flow Diagrams

### 20.1 Authentication Flow

```mermaid
flowchart TD
    A[User visits /login] --> B{Already logged in?}
    B -->|Yes| C[Redirect to /user/dashboard]
    B -->|No| D[Show login form]
    D --> E{Auth method}
    E -->|Email/Password| F[POST /login]
    F --> G[Validate email/password]
    G --> H{Valid?}
    H -->|No| I[Show error]
    H -->|Yes| J[Create session cookie]
    J --> C
    E -->|Google| K[GET /auth/google]
    K --> L[Redirect to Google consent]
    L --> M[User authenticates]
    M --> N[GET /auth/google/callback?code=...]
    N --> O[Exchange code for tokens]
    O --> P[Fetch Google user info]
    P --> Q[Find or create user]
    Q --> J
```

### 20.2 Resource Lifecycle

```mermaid
flowchart TD
    A[User on Dashboard] --> B[Click Upload]
    B --> C[Fill form: title, subject, semester, type]
    C --> D[Select file - drag/drop or click]
    D --> E[Client validates: type + size]
    E --> F[POST /api.r2-upload - get-upload-url]
    F --> G[Server validates + generates pre-signed URL]
    G --> H[Client uploads directly to R2 via PUT]
    H --> I[POST /api.r2-upload - confirm-upload]
    I --> J[Server creates Resource in DB]
    J --> K[Resource visible on dashboard - isPublic=false]
    K --> L{User action}
    L -->|Publish| M[Toggle isPublic=true]
    M --> N[Resource visible on /resources]
    L -->|Download| O[GET /download/:id]
    O --> P[Increment download count, return binary]
    L -->|Summarize| Q[POST /api/summarize]
    Q --> R[Fetch from R2, extract text, AI summary]
    L -->|Delete| S[Delete from R2 + DB]
    L -->|Unpublish| T[Toggle isPublic=false]
```

---

## 21. Error Handling Patterns

### 21.1 Root Error Boundary (`root.tsx`)

Catches all unhandled errors. Displays appropriate UI for:
- **404 errors:** Custom 404 page component
- **Route errors:** Status code + status text
- **Uncaught errors:** Generic message (stack trace shown in dev mode only)
- "Go back home" button with brand styling

### 21.2 Deferred Data Errors

Dashboard and Resources pages use `Suspense` + `Await`:
- **Loading state:** Skeleton UI
- **Error state:** Error message with retry button
- **Resolved state:** Normal content

### 21.3 Action Error Pattern

All actions return structured error objects:
```typescript
return { error: 'User-friendly error message' };
// or
return Response.json({ ok: false, error: '...', phase: '...' }, { status: 400 });
```

### 21.4 Storage Error Classification

The `storage-error-handler.server.ts` classifies errors:
- `EACCES` → Permission error
- `ENOSPC` → Disk space error
- `ENOENT` → Path not found error
- Generic → Storage unavailable

### 21.5 Email Error Handling

- Password reset email errors are **silently logged** (never thrown)
- Always returns success to prevent email enumeration attacks

---

## 22. Security Considerations

### 22.1 Authentication Security

| Measure | Implementation |
|---|---|
| Password hashing | bcrypt with 12 salt rounds |
| Session cookies | httpOnly, secure, sameSite: lax |
| Cookie signing | SESSION_SECRET environment variable |
| Token storage | SHA-256 hash in DB; raw token in email link |
| Token expiry | 1-hour window for password reset |
| Token rate limiting | Max 3 active tokens per user |
| Email enumeration prevention | Forgot-password always returns success |
| OAuth verification | Checks `verified_email` from Google |

### 22.2 File Upload Security

| Measure | Implementation |
|---|---|
| File type validation | Server-side MIME type + extension check |
| File size limit | 20MB maximum (validated client + server) |
| File name sanitization | `name.replace(/[^a-zA-Z0-9.-]/g, '-')` |
| Pre-signed URLs | 1-hour expiry; files uploaded directly to R2, not through server |
| User isolation | Each user's files stored in `user-{id}/` prefix |
| Ownership verification | Resource actions verify `user_id` matches session |

### 22.3 Input Validation

| Field | Validation |
|---|---|
| Email | Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| Password | Minimum 8 characters |
| File metadata | All fields required; file size > 0 and ≤ 20MB |
| Resource ID | Parsed to number, checked for NaN |

### 22.4 CSRF Protection

- Session cookies use `sameSite: "lax"` which prevents CSRF on non-GET requests from cross-origin sites
- All mutations use POST/form submissions through React Router's `Form` component

### 22.5 XSS Protection

- React's JSX automatically escapes rendered content
- `httpOnly` cookies prevent session theft via XSS
- `dangerouslySetInnerHTML` only used for the hydration warning suppression script (dev-only)

---

*This document was generated on April 13, 2026, and reflects the current state of the Study Vault codebase.*
