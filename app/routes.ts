import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  // Main Layout
  layout("./layout/main-layout.tsx", [
    index("./routes/index.tsx"),
    route("about", "routes/about.tsx"),
    route("resources", "routes/resources.tsx"),
    route("features", "routes/features.tsx"),
    route("terms-of-service", "routes/terms-of-service.tsx"),
    route("privacy-policy", "routes/privacy-policy.tsx"),
    route("disclaimer", "routes/disclaimer.tsx"),
  ]),

  // Dashboard Layout
  layout("./layout/dashboard-layout.tsx", [
    route("user/dashboard", "routes/dashboard.tsx"),
  ]),

  // Auth Layout
  layout("./layout/auth-layout.tsx", [
    route("sign-up", "routes/auth/sign-up.tsx"),
    route("login", "routes/auth/login.tsx"),
    route("logout", "routes/auth/logout.tsx"),
    route("auth/google", "routes/auth/google.tsx"),
    route("auth/google/callback", "routes/auth/google.callback.tsx"),
  ]),

  // Download route (no layout needed) - resource route for file downloads
  route("download/:id", "routes/download.$id.tsx"),

  // R2 upload API route (server action for presigned URLs + confirm)
  route("api.r2-upload", "routes/api.r2-upload.tsx"),

  // 404 route
  route("404", "routes/_404.tsx"),

  // catch all route
  route("*", "routes/$.tsx"),
] satisfies RouteConfig;
