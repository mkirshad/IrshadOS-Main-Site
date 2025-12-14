import { getCollection, type CollectionEntry } from "astro:content";

export type AppStatus = "live" | "coming-soon";
export type EbookStatus = "free" | "coming-soon";

export type App = {
  name: string;
  slug: string;
  short_description: string;
  long_description?: string;
  tags: string[];
  status: AppStatus;
  url?: string;
  repo_url?: string;
  icon?: string;
};

export type Ebook = {
  title: string;
  slug: string;
  author: string;
  description: string;
  category?: string;
  tags: string[];
  language: string;
  cover_image?: string;
  download_url?: string;
  status: EbookStatus;
};

const DEFAULT_API_BASE_URL = "https://api.irshados.com";
const API_TIMEOUT_MS = 1200;
const API_CACHE_TTL_MS = 60_000;
const API_FAILURE_BACKOFF_MS = 60_000;

let apiAppsCache: { fetchedAt: number; value: App[] } | null = null;
let apiAppsLastFailureAt = 0;
let apiEbooksCache: { fetchedAt: number; value: Ebook[] } | null = null;
let apiEbooksLastFailureAt = 0;

function getApiBaseUrl() {
  return (import.meta.env.IRSHADOS_API_BASE_URL as string | undefined) || DEFAULT_API_BASE_URL;
}

async function safeFetchJson<T>(url: string, timeoutMs = 2000): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function isUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function normalizeApp(input: unknown): App | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;

  const name = typeof raw.name === "string" ? raw.name : null;
  const slug = typeof raw.slug === "string" ? raw.slug : null;
  const short_description =
    typeof raw.short_description === "string" ? raw.short_description : null;

  if (!name || !slug || !short_description) return null;

  const status: AppStatus = raw.status === "live" ? "live" : "coming-soon";

  return {
    name,
    slug,
    short_description,
    long_description: typeof raw.long_description === "string" ? raw.long_description : undefined,
    tags: asStringArray(raw.tags),
    status,
    url: isUrl(raw.url) ? raw.url : undefined,
    repo_url: isUrl(raw.repo_url) ? raw.repo_url : undefined,
    icon: typeof raw.icon === "string" ? raw.icon : undefined,
  };
}

function normalizeEbook(input: unknown): Ebook | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;

  const title = typeof raw.title === "string" ? raw.title : null;
  const slug = typeof raw.slug === "string" ? raw.slug : null;
  const author = typeof raw.author === "string" ? raw.author : null;
  const description = typeof raw.description === "string" ? raw.description : null;

  if (!title || !slug || !author || !description) return null;

  const status: EbookStatus = raw.status === "free" ? "free" : "coming-soon";
  const language = typeof raw.language === "string" && raw.language ? raw.language : "en";

  return {
    title,
    slug,
    author,
    description,
    category: typeof raw.category === "string" ? raw.category : undefined,
    tags: asStringArray(raw.tags),
    language,
    cover_image: typeof raw.cover_image === "string" ? raw.cover_image : undefined,
    download_url: typeof raw.download_url === "string" ? raw.download_url : undefined,
    status,
  };
}

function unwrapArrayPayload(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;

  if (Array.isArray(raw.apps)) return raw.apps;
  if (Array.isArray(raw.ebooks)) return raw.ebooks;
  if (Array.isArray(raw.data)) return raw.data;
  return null;
}

async function getAppsFromApi(): Promise<App[] | null> {
  const now = Date.now();
  if (apiAppsCache && now - apiAppsCache.fetchedAt < API_CACHE_TTL_MS) return apiAppsCache.value;
  if (apiAppsLastFailureAt && now - apiAppsLastFailureAt < API_FAILURE_BACKOFF_MS) return null;

  const apiBase = getApiBaseUrl();
  const apiPayload = await safeFetchJson<unknown>(
    `${apiBase.replace(/\/$/, "")}/public/apps`,
    API_TIMEOUT_MS,
  );

  const apiArray = unwrapArrayPayload(apiPayload);
  if (!apiArray) {
    apiAppsLastFailureAt = Date.now();
    return null;
  }

  const normalized = apiArray
    .map(normalizeApp)
    .filter((v): v is App => Boolean(v))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (normalized.length === 0 && apiArray.length > 0) {
    apiAppsLastFailureAt = Date.now();
    return null;
  }

  apiAppsCache = { fetchedAt: Date.now(), value: normalized };
  return normalized;
}

async function getEbooksFromApi(): Promise<Ebook[] | null> {
  const now = Date.now();
  if (apiEbooksCache && now - apiEbooksCache.fetchedAt < API_CACHE_TTL_MS) {
    return apiEbooksCache.value;
  }
  if (apiEbooksLastFailureAt && now - apiEbooksLastFailureAt < API_FAILURE_BACKOFF_MS) return null;

  const apiBase = getApiBaseUrl();
  const apiPayload = await safeFetchJson<unknown>(
    `${apiBase.replace(/\/$/, "")}/public/ebooks`,
    API_TIMEOUT_MS,
  );

  const apiArray = unwrapArrayPayload(apiPayload);
  if (!apiArray) {
    apiEbooksLastFailureAt = Date.now();
    return null;
  }

  const normalized = apiArray
    .map(normalizeEbook)
    .filter((v): v is Ebook => Boolean(v))
    .sort((a, b) => a.title.localeCompare(b.title));

  if (normalized.length === 0 && apiArray.length > 0) {
    apiEbooksLastFailureAt = Date.now();
    return null;
  }

  apiEbooksCache = { fetchedAt: Date.now(), value: normalized };
  return normalized;
}

export async function getApps(): Promise<App[]> {
  const fromApi = await getAppsFromApi();
  if (fromApi) return fromApi;

  const localEntries = await getCollection("apps");
  return localEntries
    .map((entry) => ({
      name: entry.data.name,
      slug: entry.slug,
      short_description: entry.data.short_description,
      long_description: entry.data.long_description,
      tags: entry.data.tags,
      status: entry.data.status,
      url: entry.data.url,
      repo_url: entry.data.repo_url,
      icon: entry.data.icon,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getEbooks(): Promise<Ebook[]> {
  const fromApi = await getEbooksFromApi();
  if (fromApi) return fromApi;

  const localEntries = await getCollection("ebooks");
  return localEntries
    .map((entry) => ({
      title: entry.data.title,
      slug: entry.slug,
      author: entry.data.author,
      description: entry.data.description,
      category: entry.data.category,
      tags: entry.data.tags,
      language: entry.data.language,
      cover_image: entry.data.cover_image,
      download_url: entry.data.download_url,
      status: entry.data.status,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getAppDetail(
  slug: string,
): Promise<
  | { kind: "api"; app: App }
  | { kind: "local"; app: App; entry: CollectionEntry<"apps"> }
  | null
> {
  const fromApi = await getAppsFromApi();
  const matchFromApi = fromApi?.find((a) => a.slug === slug);
  if (matchFromApi) return { kind: "api", app: matchFromApi };

  const localEntries = await getCollection("apps");
  const entry = localEntries.find((e) => e.slug === slug);
  if (!entry) return null;

  const app: App = {
    name: entry.data.name,
    slug: entry.slug,
    short_description: entry.data.short_description,
    long_description: entry.data.long_description,
    tags: entry.data.tags,
    status: entry.data.status,
    url: entry.data.url,
    repo_url: entry.data.repo_url,
    icon: entry.data.icon,
  };

  return { kind: "local", app, entry };
}

export async function getEbookDetail(
  slug: string,
): Promise<
  | { kind: "api"; ebook: Ebook }
  | { kind: "local"; ebook: Ebook; entry: CollectionEntry<"ebooks"> }
  | null
> {
  const fromApi = await getEbooksFromApi();
  const matchFromApi = fromApi?.find((e) => e.slug === slug);
  if (matchFromApi) return { kind: "api", ebook: matchFromApi };

  const localEntries = await getCollection("ebooks");
  const entry = localEntries.find((e) => e.slug === slug);
  if (!entry) return null;

  const ebook: Ebook = {
    title: entry.data.title,
    slug: entry.slug,
    author: entry.data.author,
    description: entry.data.description,
    category: entry.data.category,
    tags: entry.data.tags,
    language: entry.data.language,
    cover_image: entry.data.cover_image,
    download_url: entry.data.download_url,
    status: entry.data.status,
  };

  return { kind: "local", ebook, entry };
}
