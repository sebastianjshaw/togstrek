/**
 * Treat remote absolute URLs (`http(s)://`) as unoptimized `<Image>` sources.
 *
 * - **Production**: matches `images.unoptimized` in `next.config.ts` — CDN images must
 *   not route through `/_next/image`, which consumes Vercel Image Optimization quotas.
 * - **Development**: avoids noisy optimizer requests / hard failures when a CDN object
 *   is missing while content is still being migrated.
 */
export function togstrekUnoptimizedRemoteImageInDev(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://");
}
