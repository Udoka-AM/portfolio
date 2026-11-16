import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts, getPost } from "@/lib/posts";
import { SITE, LINKS } from "@/content/site";
import ArticleBar from "@/components/ArticleBar";
import ShareBar from "@/components/ShareBar";
import ImageZoom from "@/components/ImageZoom";
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
  const url = `${ORIGIN}/writing/${post.slug}/`;
  // The share card is generated per post at build time by
  // ./opengraph-image.js — title, topic and byline on the brand background.
  const card = {
    url: `/writing/${post.slug}/og.png`,
    width: 1200,
    height: 630,
    alt: post.title,
    type: "image/png",
  };
  return {
    title: `${post.title} — ${SITE.name}`,
    description: post.blurb,
    authors: [{ name: SITE.name, url: ORIGIN }],
    // Metadata merges shallowly, so the feed link from the layout has to be
    // restated here or post pages lose it.
    alternates: {
      canonical: `/writing/${post.slug}/`,
      types: { "application/rss+xml": [{ url: "/feed.xml", title: `${SITE.name} — Writing` }] },
    },
    robots: post.draft ? { index: false, follow: false } : undefined,
    openGraph: {
      title: post.title,
      description: post.blurb,
      type: "article",
      url,
      siteName: SITE.name,
      locale: "en_GB",
      ...(post.date ? { publishedTime: `${post.date}T00:00:00Z` } : {}),
      authors: [ORIGIN],
      tags: post.topic ? [post.topic] : undefined,
      images: [card],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.blurb,
      site: "@Udoka_AM",
      creator: "@Udoka_AM",
      images: [{ url: card.url, alt: card.alt }],
    },
  };
}

export default async function Post({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = `${ORIGIN}/writing/${post.slug}/`;
  const others = getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);
  const x = LINKS.find((l) => l.href.includes("x.com"));
  const gh = LINKS.find((l) => l.href.includes("github.com"));
  const li = LINKS.find((l) => l.href.includes("linkedin.com"));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: post.title,
    abstract: post.blurb,
    description: post.blurb,
    url,
    image: [`${ORIGIN}/writing/${post.slug}/og.png`, ...(post.cover ? [`${ORIGIN}${post.cover}`] : [])],
    ...(post.date ? { datePublished: post.date, dateModified: post.date } : {}),
    author: { "@type": "Person", "@id": `${ORIGIN}/#person`, name: SITE.legalName, url: ORIGIN },
    publisher: { "@type": "Person", "@id": `${ORIGIN}/#person` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    wordCount: post.words,
    ...(post.topic ? { articleSection: post.topic } : {}),
  };

  const dateLabel = post.draft ? "Draft" : formatDate(post.date);

  return (
    <>
      <ArticleBar />

      <div className="wrap">
        <article className={s.post}>
          <header className={s.head}>
            {post.topic && <span className={s.topic}>{post.topic}</span>}
            <h1 className={s.title}>{post.title}</h1>
            {post.blurb && <p className={s.blurb}>{post.blurb}</p>}

            <div className={s.byline}>
              <Link href="/" className={s.author}>
                <span className={s.avatar} aria-hidden="true" />
                <span className={s.authorText}>
                  <span className={s.authorName}>{SITE.name}</span>
                  <span className={s.meta}>
                    {post.date ? <time dateTime={post.date}>{dateLabel}</time> : dateLabel}
                    <span className={s.dot}>·</span>
                    {post.readingMinutes} min read
                  </span>
                </span>
              </Link>
              <ShareBar url={url} title={post.title} />
            </div>
          </header>

          {post.toc.length >= 3 && (
            <details className={s.toc}>
              <summary>
                <span>Contents</span>
                <span className={s.tocCount}>{post.toc.length} sections</span>
              </summary>
              <ol>
                {post.toc.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`}>{h.text}</a>
                  </li>
                ))}
              </ol>
            </details>
          )}

          {/* Markdown is authored by me and rendered at build time — there is no
              user input anywhere in this path. */}
          <div className={s.body} id="post-body" dangerouslySetInnerHTML={{ __html: post.html }} />

          <footer className={s.foot}>
            <section className={s.shareEnd} aria-labelledby="share-end">
              <h2 id="share-end" className={s.endHead}>
                Found this useful? Pass it on.
              </h2>
              <ShareBar url={url} title={post.title} variant="full" />
            </section>

            <section className={s.authorCard} aria-label="About the author">
              <span className={`${s.avatar} ${s.avatarLg}`} aria-hidden="true" />
              <div>
                <p className={s.cardName}>
                  Written by <Link href="/">{SITE.name}</Link>
                </p>
                <p className={s.cardBio}>{SITE.focus}</p>
                <p className={s.cardLinks}>
                  {x && (
                    <a href={x.href} target="_blank" rel="noopener noreferrer">
                      Follow on X
                    </a>
                  )}
                  {li && (
                    <a href={li.href} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  )}
                  {gh && (
                    <a href={gh.href} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </a>
                  )}
                  <a href="/feed.xml">RSS</a>
                </p>
              </div>
            </section>

            {others.length > 0 && (
              <nav className={s.more} aria-labelledby="more-head">
                <h2 id="more-head" className={s.endHead}>
                  More writing
                </h2>
                <ul>
                  {others.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/writing/${p.slug}/`} className={s.moreItem}>
                        {p.topic && <span className={s.moreTopic}>{p.topic}</span>}
                        <span className={s.moreTitle}>{p.title}</span>
                        <span className={s.moreMeta}>
                          {formatDate(p.date)} · {p.readingMinutes} min read
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <Link href="/#writing" className={s.back}>
              ← All writing
            </Link>
          </footer>
        </article>
      </div>

      <ImageZoom scope="#post-body" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}

function formatDate(iso) {
  if (!iso) return "Undated";
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
