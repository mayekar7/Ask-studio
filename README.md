# Ask Studios

Photography studio website built with [Astro](https://astro.build), GSAP and Lenis.

## Run locally

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
npm run preview  # serve the built site
```

## Structure

```
public/img/            photos
src/pages/index.astro  page assembly
src/layouts/Base.astro <head>, fonts, global styles, script
src/components/        Nav, Hero, About, Services, Gallery, Stories, Cta, Footer, Lightbox
src/styles/global.css  all styles
src/scripts/main.js    interactions and animations (gallery + testimonial data live here)
```
