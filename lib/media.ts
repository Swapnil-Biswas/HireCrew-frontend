// Video sources are read from the environment so the page works before the
// recordings exist. Drop files in public/videos and set, for example,
// NEXT_PUBLIC_HERO_VIDEO=/videos/hero.mp4 in .env.local.
export const videos = {
  hero: process.env.NEXT_PUBLIC_HERO_VIDEO,
  implementation: process.env.NEXT_PUBLIC_IMPLEMENTATION_VIDEO,
};
