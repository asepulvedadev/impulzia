// ─── Colombia API — HTTP Client ───────────────────────────────────────────────

const BASE_URL = 'https://api-colombia.com/api/v1'

export class ColombiaApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ColombiaApiError'
  }
}

type FetchOptions = {
  params?: Record<string, string | number | undefined>
  revalidate?: number
}

export async function colombiaFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { params, revalidate = 3600 } = options

  const url = new URL(`${BASE_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    })
  }

  const res = await fetch(url.toString(), {
    next: { revalidate },
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    throw new ColombiaApiError(
      res.status,
      `Colombia API error ${res.status} — ${path}`,
    )
  }

  return res.json() as Promise<T>
}
