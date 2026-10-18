import { getBasePath } from "@toyonix/web-kit";
import { getAllNotes } from "@/lib/notes";
import { SITE_ORIGIN, site } from "@/site";

// JSON Feed 1.1 (https://jsonfeed.org), generated once at build time into out/feed.json.
// The root site reads it in the browser to show the latest notes, so publishing a note only
// redeploys notes. Keep it a valid JSON Feed; "_toyonix" is a JSON Feed extension object.
export const dynamic = "force-static";

export async function GET() {
  const home = `${SITE_ORIGIN}${getBasePath()}/`;
  const notes = await getAllNotes();
  return Response.json(
    {
      version: "https://jsonfeed.org/version/1.1",
      title: `${site.title} · toyonix`,
      home_page_url: home,
      feed_url: `${home}feed.json`,
      description: site.description,
      language: "en",
      items: notes.map((note) => ({
        id: `${home}${note.slug}/`,
        url: `${home}${note.slug}/`,
        title: note.title,
        summary: note.description || undefined,
        date_published: `${note.date}T00:00:00Z`,
        tags: note.tags.length ? note.tags : undefined,
        _toyonix: { reading_minutes: note.readingMinutes },
      })),
    },
    { headers: { "content-type": "application/feed+json; charset=utf-8" } },
  );
}
