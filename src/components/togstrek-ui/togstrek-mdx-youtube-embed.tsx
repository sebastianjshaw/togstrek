export type TogstrekMdxYouTubeEmbedProps = {
  /** YouTube video ID, e.g. the `v=` value from a watch URL. */
  id?: string;
  /** Accessible title for the embedded player frame. */
  title?: string;
};

/** Responsive 16:9 YouTube embed for place/hiking/other-work MDX content. */
export function TogstrekMdxYouTubeEmbed({
  id,
  title,
}: TogstrekMdxYouTubeEmbedProps) {
  if (!id || !title) return null;

  return (
    <div className="togstrek-mdx-youtube-embed relative mt-[var(--tt-space-6)] aspect-video w-full max-w-[min(58rem,100%)] overflow-hidden rounded-[var(--tt-radius-lg)] bg-tt-surface-muted">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={title}
        className="absolute inset-0 h-full w-full"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
