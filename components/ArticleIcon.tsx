// Per-article line-art icon (public/icons/<slug>.svg). Decorative, so it is
// hidden from assistive tech; the adjacent title carries the meaning.
export default function ArticleIcon({
  slug,
  size = 32,
  className = "cardIcon",
}: {
  slug: string;
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG in /public; Image is unnecessary
    <img
      className={className}
      src={`/icons/${slug}.svg`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
    />
  );
}
