Togstrek media layout
====================

Do NOT commit multi-gigabyte originals to this repository.

Recommended:
  - Store masters on object storage (e.g. Cloudflare R2, S3, Backblaze B2).
  - Serve via a CDN hostname (e.g. media.togstrek.com) referenced in .env as
    NEXT_PUBLIC_MEDIA_BASE_URL.

Optional local folder during migration only:
  public/media/originals/  → gitignored; use for temporary copies, then delete.

Small assets that *can* live in Git (logos, icons) stay under public/brand/ etc.

See src/config/togstrek-media.ts for URL helpers and Tulum path examples.
