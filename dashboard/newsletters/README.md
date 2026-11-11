# Newsletters

Each newsletter is a folder here. Write it, push it, then send it from **/admin** on the site.

```
newsletters/
  2026-11-kickoff/        <- the folder name is the newsletter's id (letters, numbers, - and _)
    newsletter.mdx        <- the text
    hull.jpg              <- any images it uses, in the same folder
```

To start one, copy `welcome/` and edit it. Folders that start with `_` or `.` are ignored.

## The file

A header, then the body. The body is Markdown, plus a few tags for things Markdown can't do (that is what makes
this MDX instead of Markdown).

```mdx
---
subject: Hull is printed          # required: the email subject line
preview: Four weeks, one hull.    # optional: the grey text next to the subject in the inbox
date: 2026-11-04                  # optional: shown under the logo as "November 2026"; also orders the list
---

# A heading

Normal paragraphs, **bold**, *italic*, [links](https://haav.build/join) and lists work as in Markdown.
Links that start with / point at haav.build.

![Alt text for a plain image](hull.jpg)

<Figure src="hull.jpg" alt="Describe the picture" caption="Optional caption underneath." />

<Button href="/join">Become a member</Button>

<Sponsor src="acme.png" alt="Acme logo" name="Acme">donated the epoxy.</Sponsor>
```

- **Sponsors**: `<Sponsor src alt name>what they gave</Sponsor>` shows the logo in a box on the left and the text beside it.
  Add `width="90"` (pixels, default 170) to shrink a squarish logo. Write the tag on one line, and use `.png`, not `.svg`.
  Do not use a lowercase `<img>` tag: MDX skips the path fix and the picture will not load.
- **Images** are files in the same folder, named in `src`. Use `.jpg` or `.png` (some mail apps, notably desktop
  Outlook, cannot show `.webp`), and keep each under about 1 MB. Always fill in `alt`.
- **Where the email's pictures load from.** With `BLOB_READ_WRITE_TOKEN` set (it is in `.env.local` once the Blob store is
  connected), **Send preview**, **Send to team**, **Send to everyone** and the **Upload photos** button first upload any
  picture in the folder that isn't up yet to Vercel Blob, and the email links to those public URLs. So you can send from
  localhost without deploying. An unchanged picture is uploaded once; a swapped one gets a new URL automatically.
  Without the token, the email falls back to `haav.build/newsletters/<id>/`, which only has the pictures once the site is
  deployed with your files.
- Do not write a bare `<` or `{` in text; MDX reads them as code. Write `&lt;` or `\{`.
- The logo header, the footer and the unsubscribe link are added automatically. The template lives in
  [`../src/emails/newsletter.tsx`](../src/emails/newsletter.tsx).

## Sending

1. Open **/admin** and enter the passcode.
2. **Preview** shows the email in the page. **Upload photos** puts the folder's pictures on their public URL without
   sending anything. **Send preview** emails it to you alone.
3. **Send to team…** opens a list of your subscribers: tick the people and send them an ordinary email (marked [Team]),
   as many times as you like. It does not count as sending the newsletter. Your ticks are remembered in the browser.
4. **Send to everyone** sends it to the whole list as a Resend broadcast. Each newsletter can be sent once; the
   page shows when it went out.
