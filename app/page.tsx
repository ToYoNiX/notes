import Link from "next/link";
import {
  Card,
  CardBody,
  CardMeta,
  CardTitle,
  CardTop,
  Container,
  Display,
  Eyebrow,
  Lead,
  Section,
  SectionLabel,
  Stack,
  Tag,
  Tags,
} from "@toyonix/web-kit/react";
import { formatDate, getAllNotes } from "@/lib/notes";
import { site } from "@/site";

export default async function NotesIndex() {
  const notes = await getAllNotes();
  return (
    <Container>
      <section className="pt-24 pb-12">
        <Eyebrow>Notes</Eyebrow>
        <Display className="max-w-[14ch]">
          Journeys and <em>explorations</em>.
        </Display>
        <Lead>{site.description}</Lead>
      </section>
      <Section>
        <SectionLabel>All notes</SectionLabel>
        <Stack className="max-w-[760px]">
          {notes.map((note) => (
            <Card key={note.slug} asChild>
              <Link href={`/${note.slug}/`}>
                <CardTop>
                  <CardMeta>
                    {formatDate(note.date)} · {note.readingMinutes} min read
                  </CardMeta>
                </CardTop>
                <CardTitle className="text-[28px]">{note.title}</CardTitle>
                {note.description ? <CardBody>{note.description}</CardBody> : null}
                {note.tags.length ? (
                  <Tags>
                    {note.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </Tags>
                ) : null}
              </Link>
            </Card>
          ))}
        </Stack>
      </Section>
    </Container>
  );
}
