import { getBasePath } from "@toyonix/web-kit";
import { getAllNotes } from "@/lib/notes";
import { SITE_ORIGIN, site } from "@/site";

// RSS 2.0 feed, generated once at build time into out/feed.xml.
export const dynamic = "force-static";

function escape(text: string): string {
  return text.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);
}

export async function GET() {
  const home = `${SITE_ORIGIN}${getBasePath()}/`;
  const notes = await getAllNotes();
  const items = notes
    .map((note) => {
      const url = `${home}${note.slug}/`;
      return `    <item>
      <title>${escape(note.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(note.date).toUTCString()}</pubDate>
      <description>${escape(note.description)}</description>
${note.tags.map((tag) => `      <category>${escape(tag)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escape(site.title)} · toyonix</title>
    <link>${home}</link>
    <description>${escape(site.description)}</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
