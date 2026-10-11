interface Env {
  API_ORIGIN?: string
}

// Same-origin proxy to the backend, run by Cloudflare Pages. The session cookie
// is SameSite=Lax: the browser only sends it when the panel and the API share a
// site, and a *.pages.dev panel never shares one with the backend's host.
export async function onRequest({ request, env }: { request: Request; env: Env }) {
  if (!env.API_ORIGIN) return new Response('API_ORIGIN is not set', { status: 500 })
  const { pathname, search } = new URL(request.url)
  return fetch(new Request(new URL(pathname + search, env.API_ORIGIN), request))
}
