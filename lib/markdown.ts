import { access } from "node:fs/promises";
import path from "node:path";
import type { Element, Root } from "hast";
import { imageSizeFromFile } from "image-size/fromFile";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { withBasePath } from "@toyonix/web-kit";

const PUBLIC_DIR = path.join(process.cwd(), "public");

/**
 * Makes root-relative URLs in notes work under this app's basePath ("/images/x.webp" →
 * "/notes/images/x.webp"), and gives local images their real width/height (no layout shift)
 * plus lazy loading. A missing local image fails the build.
 */
function rehypeSiteUrls() {
  return async (tree: Root, file: { path?: string }) => {
    const images: Element[] = [];
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "img") images.push(node);
      const href = node.properties.href;
      if (node.tagName === "a" && typeof href === "string" && href.startsWith("/")) {
        node.properties.href = withBasePath(href);
      }
    });

    await Promise.all(
      images.map(async (img) => {
        const src = img.properties.src;
        if (typeof src !== "string" || !src.startsWith("/")) return;
        const local = path.join(PUBLIC_DIR, decodeURIComponent(src));
        try {
          await access(local);
        } catch {
          throw new Error(`${file.path ?? "note"}: image not found: public${src}`);
        }
        const { width, height } = await imageSizeFromFile(local);
        img.properties = {
          ...img.properties,
          src: withBasePath(src),
          width,
          height,
          loading: "lazy",
          decoding: "async",
        };
      }),
    );
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeSiteUrls)
  .use(rehypeStringify);

/** Markdown → HTML. Raw HTML in the Markdown is dropped (remark-rehype's default). */
export async function renderMarkdown(markdown: string, sourcePath?: string): Promise<string> {
  const file = await processor.process({ value: markdown, path: sourcePath });
  return String(file);
}
