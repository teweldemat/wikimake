import type { GitFileMeta } from "@/lib/git";

function isoDate(iso: string): string {
  // git provides ISO with timezone; keep display stable and compact.
  const i = iso.indexOf("T");
  return i === -1 ? iso : iso.slice(0, i);
}

export default function GitMetaLine({
  git,
  label = "Last edited",
}: {
  git?: GitFileMeta;
  label?: string;
}) {
  if (!git?.last) return null;

  const date = isoDate(git.last.date);
  const commitTitle = `${git.last.hash} ${git.last.subject}`.trim();

  return (
    <p className="gitMeta">
      {label}{" "}
      <time dateTime={git.last.date} title={git.last.date}>
        {date}
      </time>
      {" \u00b7 "}
      <span title={commitTitle}>{git.last.shortHash}</span>
      {" \u00b7 "}
      <span>{git.last.name}</span>
    </p>
  );
}

