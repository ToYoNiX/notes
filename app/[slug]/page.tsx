import type { Metadata } from "next";
import Link from "next/link";
import {
  Button,
  ButtonRow,
  Container,
  Display,
  Eyebrow,
  Lead,
  Prose,
  TableOfContents,
  Tag,
  Tags,
} from "@toyonix/web-kit/react";
import { formatDate, getAllNotes, getNote } from "@/lib/notes";

interface Props {
  params: Promise<{ slug: string }>;
}

// Static export: only notes that exist at build time.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getAllNotes()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const note = await getNote((await params).slug);
  return {
    title: note.title,
    description: note.description || undefined,
    openGraph: {
      type: "article",
      title: note.title,
      description: note.description,
      publishedTime: note.date,
    },
  };
}

export default async function NotePage({ params }: Props) {
  const note = await getNote((await params).slug);
  return (
    <Container>
      <article className="pt-20 pb-8">
        <header className="mb-10 max-w-[68ch]">
          <Eyebrow>
            <time dateTime={note.date}>{formatDate(note.date)}</time> · {note.readingMinutes} min read
          </Eyebrow>
          <Display className="text-[clamp(38px,5.5vw,64px)]">{note.title}</Display>
          {note.description ? <Lead className="mb-6">{note.description}</Lead> : null}
          {note.tags.length ? (
            <Tags>
              {note.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </Tags>
          ) : null}
        </header>
        {/* Wide screens: sticky "On this page" column. Phones: a button opening a slide-in menu. */}
        <div className="tx-with-toc">
          <Prose as="div" dropcap dangerouslySetInnerHTML={{ __html: note.html }} />
          <TableOfContents items={note.toc} />
        </div>
      </article>
      <ButtonRow className="pb-8">
        <Button asChild variant="secondary">
          <Link href="/">← All notes</Link>
        </Button>
      </ButtonRow>
    </Container>
  );
}
