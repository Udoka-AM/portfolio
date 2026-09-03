import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts, getPost } from "@/lib/posts";
import { SITE } from "@/content/site";
import s from "./post.module.css";

const ORIGIN = "https://udokaam.dev";

// Drafts get a page so they can be previewed and shared, but they are kept out
// of the sitemap and marked noindex until dated.
export function generateStaticParams() {
  return getAllPosts({ includeDrafts: true }).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  // Next 15+ passes params as a Promise; reading it synchronously yields
  // undefined and silently renders the 404 page instead.
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — ${SITE.name}`,
    description: post.blurb,
    alternates: { canonical: `/writing/${post.slug}/` },
    robots: post.draft ? { index: false, follow: false } : undefined,
    openGraph: {
      title: post.title,
      description: post.blurb,
      type: "article",
      url: `${ORIGIN}/writing/${post.slug}/`,
      images: [{ url: "/og.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.blurb,
      creator: "@Udoka_AM",
      images: ["/og.png"],
    },
  };
}

export default async function Post({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: post.title,
    abstract: post.blurb,
    url: `${ORIGIN}/writing/${post.slug}/`,
    ...(post.date ? { datePublished: post.date } : {}),
    author: { "@type": "Person", "@id": `${ORIGIN}/#person`, name: SITE.legalName },
    publisher: { "@type": "Person", "@id": `${ORIGIN}/#person` },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${ORIGIN}/writing/${post.slug}/` },
    wordCount: post.words,
  };

  return (
    <div className="wrap">
      <article className={s.post}>
        <Link href="/#writing" className={s.back}>
          ← Writing
        </Link>

        <header className={s.head}>
          <span className={s.topic}>[{post.topic}]</span>
          <h1 className={s.title}>{post.title}</h1>
          <p className={s.blurb}>{post.blurb}</p>
          <p className={s.meta}>
            {post.draft ? "Draft" : formatDate(post.date)}
            <span className={s.dot}>·</span>
            {post.readingMinutes} min read
          </p>
        </header>

        {/* Markdown is authored by me and rendered at build time — there is no
            user input anywhere in this path. */}
        <div className={s.body} dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "Undated";
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
