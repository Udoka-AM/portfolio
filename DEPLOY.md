# Deploying

Target: **udokaam.dev** (registered at Hostinger) served from Vercel, deploying
automatically on every push to `main`.

## Blocked: Vercel account

As of 2026-09-01 the Vercel team `udokas-projects-ca144697` cannot create new
projects. The API returns:

```
402 resource_creation_blocked
"Your Team exceeded our fair use limits and has been blocked."
https://vercel.link/fair-use
```

Reads work (listing teams and projects is fine); only resource creation is
blocked, and it is account-wide — two different project names returned the same
error. This has to be resolved from the Vercel dashboard before anything below
can happen.


## Cloudflare Pages (free) — the current plan

Vercel is blocked (above), so this is the route. The site is a static export,
so nothing in the code changes.

**Step 1 — needs you, requires a Cloudflare login.**
At dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git,
pick `Udoka-AM/portfolio`. Build settings:

| Setting | Value |
|---|---|
| Framework preset | Next.js (Static HTML Export) |
| Build command | `npm run build` |
| Output directory | `out` |

That build needs `output: "export"` in `next.config.mjs`. It is **not** committed
— the repo currently builds for a Node host. Add it when Cloudflare is confirmed
as the target:

```js
const nextConfig = { reactStrictMode: true, output: "export" };
```

Verified locally: the export builds clean at ~1.1MB, fonts self-hosted, no
external requests.

**Step 2 — the apex domain wrinkle.**
`udokaam.dev` is an apex domain, and apex records cannot be CNAMEs. Cloudflare
Pages resolves this with CNAME flattening, which requires the zone to be on
Cloudflare nameservers. So pointing the apex at Pages means **moving DNS from
Hostinger to Cloudflare** — Hostinger stays the registrar, Cloudflare becomes
the DNS host.

That is a bigger change than swapping two records, which is why it has not been
done. The alternative is serving from `www.udokaam.dev` and redirecting the
apex, which keeps DNS at Hostinger but makes `www` the canonical URL.

Cloudflare prints the exact nameservers when the zone is added. Applying them at
Hostinger is one API call from here.

**Step 3 — DNS.** Once the Pages project exists and Cloudflare has shown its
nameservers or CNAME target, the cutover from the current records is a single
step. Existing zone, for reference:

| Type | Name | Value | What it is |
|---|---|---|---|
| A | `@` | `2.57.91.91` | Hostinger parking |
| CNAME | `www` | `udokaam.dev.` | www to apex |

No MX records, so no email is affected.

## Domain renewal

The `.DEV` subscription is `non_renewing` with auto-renew **off**. It expires
**2027-09-01** and will not be charged. Turn auto-renew on to keep the domain.

## If Vercel unblocks instead


1. **Create the project.** Import `Udoka-AM/portfolio` at
   vercel.com/new. Framework auto-detects as Next.js; no build settings needed.
   Production branch is `main`.

2. **Add the domain.** Project → Settings → Domains → add `udokaam.dev`.
   Add `www.udokaam.dev` too and let Vercel redirect it to the apex.

3. **Point DNS at Vercel.** Vercel prints the exact records when you add the
   domain — use those, not these, if they differ. Current standard values:

   | Type | Name | Value |
   |---|---|---|
   | A | `@` | `76.76.21.21` |
   | CNAME | `www` | `cname.vercel-dns.com` |

   The existing Hostinger records to replace:

   | Type | Name | Value | What it is |
   |---|---|---|---|
   | A | `@` | `2.57.91.91` | Hostinger parking page |
   | CNAME | `www` | `udokaam.dev.` | points www at the apex |

   There are **no MX records** on the zone, so replacing these breaks no email.

4. **Verify.** `dig +short udokaam.dev` should return the Vercel A record, and
   the site should serve over HTTPS once Vercel issues the certificate (usually
   under a minute, occasionally longer on first issue).

## Notes

- The apex A record currently has a 50-second TTL, so cutover is fast and there
  is no benefit to changing DNS before the Vercel project exists. Pointing the
  domain at Vercel early just serves a Vercel 404 instead of a parking page.
- If Vercel stays blocked, this is a static Next.js build and will deploy
  unchanged to Cloudflare Pages or Netlify. Hostinger can also host it directly
  (it has Node.js build support), which would keep domain and hosting together.

## Commit identity

This repo pins the author locally so it does not follow the global git config:

```
user.name  = Udoka_AM
user.email = udoka.eth@gmail.com
```
