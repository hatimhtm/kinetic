# Notes for AI agents working on Kinetic

Read this whole file before changing anything. `GEMINI.md` is an identical copy, for tools that look for that name.

## What this is

Kinetic is a website template for a design and development studio: a home page with scroll scenes, `work/`,
`services/` and `contact/` pages, and `concepts/` (made-up brands that show the kind of work the studio does).
It is plain HTML, CSS and JavaScript with no build step, no framework and no npm. The motion uses GSAP,
ScrollTrigger and Lenis, kept as files in `vendor/`. The site needs no API key, no database and no environment
variables.

## Make it someone's site (do these first, with the owner)

1. **Name.** `python3 tools/rename.py "Studio Name"` renames it everywhere: `site.js`, the drawn wordmark, the
   favicons, the link-preview picture, titles, labels and alt texts. It needs `pip3 install fonttools brotli pillow`.
   Each lowercase "i" in the name gets a small lit screen as its dot (the template's signature).
2. **E-mail.** `site.js` (`STUDIO.email`) and 3 places in `contact/index.html`. Search the whole folder for the old
   address afterwards: none may be left.
3. **The person.** "Made by …" on the first screen and the two lines of "Who builds it" are in `index.html`. Each
   name in "Who builds it" is written twice (the plain line and the lit copy): change both. A long name may need a
   smaller `.wh-h` size; check it at 360 px and 1440 px wide.
4. **Promises.** "Who builds it" lists four promises. Keep only the ones the owner really keeps. A website may only
   promise what is done.
5. **Place (optional).** The template says "An independent studio." To name a city, write it in `site.js`
   (`STUDIO.city`) and put `<span data-city></span>` where it should appear.
6. **Link preview.** `python3 tools/og-base.py "Made by Owner Name"`, then
   `python3 tools/rename.py "Studio Name" --from "Studio Name"` to draw the wordmark on it.
   The four pages' `og:image` tags point at the demo's address (hatimhtm.github.io/kinetic): change them to the
   owner's domain, or link previews will show the demo's picture.
7. **Work.** Replace the concept sites with the owner's real projects when there are some: the concept slots are in
   `site.js`, the pages in `concepts/`. Never present a concept as a real client.

## Rules for any change

- Keep it static: no framework, no build step, no npm, no CDN links. Libraries stay as files in `vendor/`.
- Motion: only `transform` and `opacity` move during a scroll. Every scroll animation stays tied to the scroll
  position (`scrub: true`). Scenes are built per layout in `gsap.matchMedia()`: computer, phone, Reduce Motion.
- Reduce Motion, low-power devices and `?motion=still` must keep showing the still layouts, with every section
  readable. Test with `?motion=still` and `?motion=full`.
- The award wall ("The bar we build to") shows sites made by **other** studios, each credited to its maker with a
  link. Never present them as the studio's own work.
- Every concept site keeps its label "Concept site. Not a real business."
- Never invent clients, testimonials, numbers or awards.
- Never put a password or an API key in this folder. The site needs none.

## Check every change

```bash
python3 -m http.server 8080      # then http://localhost:8080
```

Look at every page at phone width (360 and 390 px) and computer width (1440 px): no sideways scroll, no text cut,
the longest new text fits, the scenes still play, and the browser console shows no errors.

## Publish it

1. Create a GitHub account (https://github.com/signup) and an empty private repository (no README, no licence).
2. Make the first commit with the owner's own GitHub e-mail (`git config user.email`), then push to `main`.
3. Vercel: sign in with GitHub, "Add New…" then "Project", import the repository, Framework Preset **Other**,
   leave Build Command and Output Directory empty, Deploy. Every push to `main` then updates the site.
4. Vercel's free Hobby plan is for personal, non-commercial use. A studio site that sells services should be on
   Pro. GitHub Pages, Netlify and Cloudflare Pages also host it: publish the root folder.
5. Add the owner's domain in the host's settings, then an e-mail address on that domain, and put it in the site.

`.vercelignore` keeps `README.md`, `tools/`, `.github/` and these notes off the live site.

## Where things are

- `site.js`: the studio's name, e-mail and place (`window.STUDIO`), the award wall (`window.MENU`), the concept
  slots.
- `index.html`, `main.js`, `styles.css`: the home page and its scenes.
- `work/`, `services/`, `contact/`, `pages.js`, `pages.css`: the other pages and their motion.
- `nav.js`: the bar and the phone menu. `assets/`: pictures, fonts, icons, the wordmark. `concepts/`: the concept
  sites. `vendor/`: GSAP, ScrollTrigger, Lenis. `tools/`: the rename tool, the preview-picture tool and the
  wordmark drawing.

## License

PolyForm Noncommercial 1.0.0 (see `LICENSE` and `NOTICE.md`). Keep the `Required Notice` line. Commercial use needs
a license from the author.
