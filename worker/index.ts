interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
  API_ORIGIN?: string
}

// Same-origin proxy to the backend. The session cookie is SameSite=Lax: the
// browser only sends it when the panel and the API share a site, and a
// *.workers.dev panel never shares one with the backend's host.
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname, search } = new URL(request.url)
    if (!pathname.startsWith('/api/')) return env.ASSETS.fetch(request)
    if (!env.API_ORIGIN) return new Response('API_ORIGIN is not set', { status: 500 })
    return fetch(new Request(new URL(pathname + search, env.API_ORIGIN), request))
  },
}
