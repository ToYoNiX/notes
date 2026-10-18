import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { renderMarkdown } from "./markdown";

/**
 * Notes are Markdown files in content/: content/<slug>.md becomes /notes/<slug>/.
 *
 * Front matter:
 *   title: string            (required)
 *   date: YYYY-MM-DD         (required)
 *   description: string      (optional, used in lists, meta tags, and the feed)
 *   tags: [a, b]             (optional)
 *   draft: true              (optional; drafts are not built at all)
 *
 * Invalid front matter fails the build, naming the file.
 */

const CONTENT_DIR = path.join(process.cwd(), "content");
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const WORDS_PER_MINUTE = 220;

export interface NoteMeta {
  slug: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  description: string;
  tags: string[];
  readingMinutes: number;
}

export interface Note extends NoteMeta {
  html: string;
}

interface ParsedNote extends NoteMeta {
  body: string;
  file: string;
}

function fail(file: string, message: string): never {
  throw new Error(`content/${file}: ${message}`);
}

function toDate(file: string, value: unknown): string {
  // YAML turns unquoted dates into Date objects (at UTC midnight).
  const date = value instanceof Date ? value : typeof value === "string" ? new Date(value) : undefined;
  if (!date || Number.isNaN(date.getTime())) fail(file, "front matter needs a valid `date` (YYYY-MM-DD)");
  return date.toISOString().slice(0, 10);
}

async function parseNote(file: string): Promise<ParsedNote | null> {
  const slug = file.replace(/\.md$/, "");
  if (!SLUG.test(slug)) fail(file, "file names must be lowercase-kebab (they become the URL)");

  const { data, content } = matter(await readFile(path.join(CONTENT_DIR, file), "utf8"));
  if (data.draft === true) return null;
  if (typeof data.title !== "string" || !data.title.trim()) fail(file, "front matter needs a `title`");
  if (data.description !== undefined && typeof data.description !== "string") {
    fail(file, "`description` must be a string");
  }
  const tags: unknown = data.tags ?? [];
  if (!Array.isArray(tags) || !tags.every((tag) => typeof tag === "string")) {
    fail(file, "`tags` must be a list of strings");
  }

  return {
    slug,
    file,
    title: data.title.trim(),
    date: toDate(file, data.date),
    description: (data.description as string | undefined)?.trim() ?? "",
    tags,
    readingMinutes: Math.max(1, Math.round(content.split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE)),
    body: content,
  };
}

let pending: Promise<ParsedNote[]> | undefined;

function loadNotes(): Promise<ParsedNote[]> {
  pending ??= (async () => {
    const files = (await readdir(CONTENT_DIR)).filter((file) => file.endsWith(".md"));
    const notes = (await Promise.all(files.map(parseNote))).filter((note) => note !== null);
    return notes.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
  })();
  return pending;
}

/** Published notes, newest first. */
export async function getAllNotes(): Promise<NoteMeta[]> {
  return (await loadNotes()).map(({ slug, title, date, description, tags, readingMinutes }) => ({
    slug,
    title,
    date,
    description,
    tags,
    readingMinutes,
  }));
}

export async function getNote(slug: string): Promise<Note> {
  const note = (await loadNotes()).find((candidate) => candidate.slug === slug);
  if (!note) throw new Error(`No published note "${slug}"`);
  const { body, file, ...meta } = note;
  return { ...meta, html: await renderMarkdown(body, `content/${file}`) };
}

/** "Nov 7, 2025" (dates are calendar dates, so format in UTC). */
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(date));
}
