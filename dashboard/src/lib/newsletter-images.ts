// Puts a newsletter's pictures on a public URL, so an email sent from localhost can still load them.
// The files stay in newsletters/<id>/. Each one is uploaded to Vercel Blob under a name that includes a hash of its
// contents, so an unchanged picture is uploaded once, a changed one gets a new URL (mail apps cache by URL), and an
// old email keeps working. Needs BLOB_READ_WRITE_TOKEN (set by connecting the Blob store to the Vercel project).
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { BlobNotFoundError, head, put } from "@vercel/blob";
import { NEWSLETTER_DIR, validSlug } from "./newsletter";

export const blobConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};
const MAX_BYTES = 5 * 1024 * 1024;

export type PublishedImages = {
  /** File name in the newsletter's folder -> its public URL. */
  urls: Record<string, string>;
  uploaded: number;
  alreadyThere: number;
};

/** Uploads every picture in newsletters/<slug>/ that isn't on Blob yet and returns where each one lives. */
export async function publishImages(slug: string): Promise<PublishedImages> {
  if (!validSlug(slug)) throw new Error("Unknown newsletter.");
  if (!blobConfigured()) throw new Error("BLOB_READ_WRITE_TOKEN is not set, so photos can't be uploaded.");

  const dir = path.join(NEWSLETTER_DIR, slug);
  const files = (await readdir(dir, { withFileTypes: true }))
    .filter((e) => e.isFile() && !e.name.startsWith(".") && /^[\w.-]+$/.test(e.name) && TYPES[path.extname(e.name).toLowerCase()])
    .map((e) => e.name);

  const out: PublishedImages = { urls: {}, uploaded: 0, alreadyThere: 0 };
  await Promise.all(
    files.map(async (file) => {
      const bytes = await readFile(path.join(dir, file));
      if (bytes.length > MAX_BYTES) throw new Error(`${file} is ${(bytes.length / 1048576).toFixed(1)} MB. Keep each picture under 5 MB.`);
      const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 10);
      const pathname = `newsletters/${slug}/${hash}-${file}`;
      try {
        out.urls[file] = (await head(pathname)).url;
        out.alreadyThere++;
      } catch (e) {
        if (!(e instanceof BlobNotFoundError)) throw e;
        const blob = await put(pathname, bytes, {
          access: "public",
          addRandomSuffix: false,
          allowOverwrite: true, // same name means same contents, so a race between two uploads is harmless
          contentType: TYPES[path.extname(file).toLowerCase()],
        });
        out.urls[file] = blob.url;
        out.uploaded++;
      }
    })
  );
  return out;
}
