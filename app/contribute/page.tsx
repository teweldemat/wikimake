import Markdown from "@/components/Markdown";
import { getContributePage } from "@/lib/content";

export const metadata = {
  title: "Contribute | Wikimake",
};

export const dynamic = "force-static";

export default function ContributePage() {
  const contribute = getContributePage();
  return <Markdown content={contribute.content} />;
}

