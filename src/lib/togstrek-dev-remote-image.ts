/**
 * In development, bypass the Next.js image optimizer for remote `src` values.
 * Missing CDN files (404) otherwise spam the dev terminal and can surface as
 * hard failures while content is still being migrated.
 */
export function togstrekUnoptimizedRemoteImageInDev(src: string): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    (src.startsWith("http://") || src.startsWith("https://"))
  );
}
