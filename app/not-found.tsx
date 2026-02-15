import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <h1>Not found</h1>
      <p>
        That page does not exist. Try the <Link href="/articles">articles</Link>{" "}
        index.
      </p>
    </>
  );
}

