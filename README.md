# Athikari Thejesh — portfolio

Single-page portfolio for an Embedded Firmware Engineer. Plain HTML, CSS and JavaScript, no build step, no dependencies beyond Google Fonts.

## Structure

```
index.html            page markup (all sections)
css/style.css         theme tokens, layout, animations
js/main.js            nav, scroll reveal, project expanders, copy buttons, contact form, hero canvas
resume.pdf            placeholder — replace with your real resume (keep the filename)
assets/profile.svg    profile photo placeholder — replace with assets/profile.jpg and update <img src> in index.html
assets/projects/*.svg project image placeholders (adas, collar, scheduler)
assets/favicon.svg    tab icon
netlify.toml          Netlify config (also enables the contact form)
vercel.json           Vercel config (static, with cache headers)
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

## Swap in your own content

- **Photo**: drop `assets/profile.jpg` (square, at least 360×360) and change the `src` of the hero `<img>`.
- **Project images**: replace the three SVGs in `assets/projects/` with PNG/JPG at 16:9 (640×360 or larger) and update the `src` attributes.
- **Resume**: overwrite `resume.pdf`.
- **Text**: everything is plain HTML in `index.html`; sections are marked with `<!-- ===== NAME ===== -->` comments.
- **Colours / fonts**: edit the tokens at the top of `css/style.css`.

 Contact form :-

- **Netlify**: works out of the box. The form has `data-netlify="true"`; submissions appear under Site → Forms.
- **Vercel / GitHub Pages / anywhere else**: there is no backend, so the script falls back to opening the visitor's mail app with the message pre-filled. To get real submissions, point the form's `action` at a service such as Formspree or Basin and it will POST there instead.

 Deploy :-

**GitHub Pages**: push this folder to a repo, then Settings → Pages → Source: `main` / root. The site is static, so no workflow is needed.

**Netlify**: drag the folder onto app.netlify.com, or connect the repo. `netlify.toml` sets publish dir to `.`.

**Vercel**: `vercel` from this folder, or import the repo. `vercel.json` marks it as a static site.
