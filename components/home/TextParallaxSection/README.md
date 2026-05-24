# TextParallaxSection

Text parallax on scroll, adapted from [Olivier Larose — Text Parallax](https://blog.olivierlarose.com/tutorials/text-parallax).

## Stack

- Framer Motion `useScroll` + `useTransform`
- Global Lenis from `LenisProvider` (no local Lenis instance)
- Next.js `Image` for slide photos

## Assets

`/public/text-parallax/images/{1,2,3}.jpg` — from [olivierlarose/text-parallax](https://github.com/olivierlarose/text-parallax).

Slide copy and offsets live in `config.ts`.
