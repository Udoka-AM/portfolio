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

## Once the account is unblocked

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
