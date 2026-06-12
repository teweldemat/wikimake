// Renders a trusted in-repo HTML fragment (content/*.html, validated by
// scripts/validate-content.mjs, which rejects scripts and event handlers).
export default function Html({ content }: { content: string }) {
  return <div className="prose" dangerouslySetInnerHTML={{ __html: content }} />;
}
