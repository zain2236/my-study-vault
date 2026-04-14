import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
} from "react-router";

import type { Route } from "./+types/root";
import NotFoundPageComponent from "./routes/_404";
import Chatbot from "./components/ui-components/Chatbot";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  { rel: "stylesheet", href: "/app/app.css" },
   { rel: "icon", href: "/assests/fav-icon.png", type: "image/png" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {import.meta.env.DEV && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  if (typeof window !== 'undefined') {
                    const originalError = console.error;
                    console.error = function(...args) {
                      const message = args[0]?.toString() || '';
                      // Only suppress React Router critical CSS hydration warnings
                      if (message.includes('hydrated') && 
                          (message.includes('data-react-router-critical-css') || 
                           message.includes('react-router-critical-css'))) {
                        return;
                      }
                      originalError.apply(console, args);
                    };
                  }
                })();
              `,
            }}
          />
        )}
        <Meta />
        <Links />
        
      </head>
      <body suppressHydrationWarning>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <Outlet />
      <Chatbot />
    </>
  );
}
export function NotFoundPage() {
  return <NotFoundPageComponent />;
}
export function ErrorBoundary() {
  const error = useRouteError();

  let title = "Something went wrong";
  let message = "An unexpected error occurred. Please try again.";
  let status = 500;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    if (status === 404) {
      title = "Page not found";
      message = "The page you’re looking for doesn’t exist.";
    } else {
      title = error.statusText || title;
      message = (error.data as any)?.message || message;
    }
  } else if (error instanceof Error && import.meta.env.DEV) {
    message = error.message;
  }

  return (
    <main className="min-h-screen bg-[#f5f5f0] dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {status !== 500 ? `${status} – ${title}` : title}
        </h1>
        <p className="text-gray-700 dark:text-gray-300 text-sm">{message}</p>
        {error instanceof Error && import.meta.env.DEV && (
          <details className="mt-4 text-xs text-gray-500 dark:text-gray-400 whitespace-pre-wrap">
            {error.stack}
          </details>
        )}
        <a
          href="/"
          className="inline-flex mt-4 px-4 py-2 rounded-lg bg-[#d97757] text-white text-sm font-semibold hover:bg-[#c66847] transition-colors"
        >
          Go back home
        </a>
      </div>
    </main>
  );
}


