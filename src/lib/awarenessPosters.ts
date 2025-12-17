import type { ImageMetadata } from "astro";

export type PosterLanguage = "en" | "ur";

export type AwarenessPoster = {
  id: string;
  fileName: string;
  image: ImageMetadata;
  title: string;
  caption: string;
  alt: string;
  language?: PosterLanguage;
  dir?: "ltr" | "rtl";
  order: number;
};

type PosterModule = { default: ImageMetadata };

type PosterMeta = Pick<
  AwarenessPoster,
  "title" | "caption" | "alt" | "language" | "dir" | "order"
>;

const posterModules = import.meta.glob<PosterModule>(
  "../../Docs/Awareness-Posters/*.{png,jpg,jpeg}",
  { eager: true },
);

const metaByFileName: Record<string, PosterMeta> = {
  "Protect Our Parks — Protect Our Rights.png": {
    title: "Protect Our Parks — Protect Our Rights",
    caption: "No café on park land; keep commercial activity on commercial plots.",
    alt: "Awareness poster for Abdalians Cooperative Housing Society (ACHS) Lahore: Protect Our Parks — Protect Our Rights (English).",
    language: "en",
    dir: "ltr",
    order: 10,
  },
  "achs_oath_over_manifesto_poster_v2.png": {
    title: "Your Oath > Any Party Manifesto",
    caption:
      "A Management Committee serves under the Constitution, laws, and Society By-Laws — if a manifesto conflicts with the oath, choose the oath.",
    alt: "Awareness poster for Abdalians Cooperative Housing Society (ACHS) Lahore: Your Oath is above any party manifesto.",
    language: "en",
    dir: "ltr",
    order: 15,
  },
  "Copy of Protect Our Parks — Protect Our Rights.png": {
    title: "اپنے پارکس بچائیں — اپنے رائٹس بچائیں",
    caption: "پارک کی زمین پر کمرشل سرگرمی نہیں — کمرشل پلاٹس پر خوش آمدید۔",
    alt: "Awareness poster for Abdalians Cooperative Housing Society (ACHS) Lahore: Protect Our Parks — Protect Our Rights (Urdu).",
    language: "ur",
    dir: "rtl",
    order: 20,
  },
  "Shawarma-in-the-park.jpeg": {
    title: "Save the Park from Commercial Activities",
    caption: "A hypothetical satire: why park-land commerce doesn’t fit jogging parks.",
    alt: "Satire awareness poster for Abdalians Cooperative Housing Society (ACHS) Lahore: Save the Park from Commercial Activities.",
    language: "en",
    dir: "ltr",
    order: 30,
  },
  "Sharma-in-the-park2.jpeg": {
    title: "میں پارک ہوں…",
    caption: "میری زمین کو منافع کیلئے مت چھیڑو۔",
    alt: "Urdu awareness poster for Abdalians Cooperative Housing Society (ACHS) Lahore: do not use park land for profit.",
    language: "ur",
    dir: "rtl",
    order: 40,
  },
  "abdalians_transition_poster_v6.png": {
    title: "Perceived Management Transition",
    caption: "Why some residents feel decline — keep decisions within constitution and by-laws.",
    alt: "Awareness poster for Abdalians Cooperative Housing Society (ACHS) Lahore: Perceived Management Transition.",
    language: "en",
    dir: "ltr",
    order: 50,
  },
};

function fileNameFromPath(path: string) {
  const parts = path.split("/");
  return parts.at(-1) ?? path;
}

function toId(input: string) {
  return input
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function humanizeFileName(fileName: string) {
  return fileName
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/^copy of\s+/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const awarenessPosters: AwarenessPoster[] = Object.entries(posterModules)
  .map(([path, mod]) => {
    const fileName = fileNameFromPath(path);
    const meta = metaByFileName[fileName];
    const title = meta?.title ?? humanizeFileName(fileName);
    const caption = meta?.caption ?? "Awareness poster.";
    const alt = meta?.alt ?? title;

    return {
      id: toId(fileName),
      fileName,
      image: mod.default,
      title,
      caption,
      alt,
      language: meta?.language,
      dir: meta?.dir,
      order: meta?.order ?? 999,
    };
  })
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
