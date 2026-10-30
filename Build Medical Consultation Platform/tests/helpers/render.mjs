import { createServer } from "vite"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"

export async function createRenderer() {
  const server = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    ssr: {
      external: [
        "react",
        "react-dom",
        "react-router-dom",
        "lucide-react",
        "@supabase/supabase-js",
      ],
    },
  })
  return {
    async render(path, props = {}, route = "/") {
      const { default: Component } = await server.ssrLoadModule(path)
      const { AuthProvider } = await server.ssrLoadModule(
        "/src/features/auth/AuthProvider.tsx",
      )
      return renderToStaticMarkup(
        createElement(
          MemoryRouter,
          { initialEntries: [route] },
          createElement(AuthProvider, null, createElement(Component, props)),
        ),
      )
    },
    close: () => server.close(),
  }
}
