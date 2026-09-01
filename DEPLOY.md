# Deploying

**Live: https://udokaam.dev** — GitHub Pages, published by
`.github/workflows/pages.yml` on every push to `main`.

## How it works

`next build` with `output: "export"` emits `out/` (~1.1MB of static files). The
workflow uploads that as a Pages artifact and deploys it. Auth is `GITHUB_TOKEN`
plus the `id-token` permission — **there are no repository secrets to manage.**

Two files in `public/` matter, and both end up in `out/`:

- `CNAME` — claims `udokaam.dev` for the Pages site.
- `.nojekyll` — Jekyll ignores paths starting with `_`, which would strip the
  entire `_next/` bundle. The artifact deploy does not run Jekyll, so this is
  belt-and-braces.

To deploy: push to `main`. To rebuild without a commit: re-run the workflow from
the Actions tab, or `gh workflow run pages.yml`.

## DNS

Registrar and DNS both stay at Hostinger. GitHub Pages serves apex domains from
static A records, so no nameserver migration was needed.

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153`, `.109.153`, `.110.153`, `.111.153` |
| CNAME | `www` | `udoka-am.github.io.` |

`www.udokaam.dev` redirects to the apex. The zone has no MX records, so mail is
unaffected. TTL is 300s.

TLS is Let's Encrypt, issued automatically and renewed by GitHub.

## Why not Vercel or Cloudflare

Both were tried first and both were blocked by account/network issues, not by
anything in this repo:

- **Vercel** returns `402 resource_creation_blocked` — "Your Team exceeded our
  fair use limits and has been blocked" — for every project creation.
- **Cloudflare** serves a bot challenge on `dash.cloudflare.com` to this
  connection (`cf-mitigated: challenge`, IP in NG routed via LHR), while every
  other Cloudflare property returns 200. No dashboard means no API token.

The site is a plain static export, so it will deploy unchanged to any of them if
either clears later.

## Outstanding

- **HTTPS enforcement**: set via the API (`https_enforced: true`) but GitHub's
  edge had not begun redirecting `http://` to `https://` at time of writing.
  This propagates on its own; verify with
  `curl -sI http://udokaam.dev | grep -i location`.
- `#cv` in the nav anchors to the footer. Point it at a real CV.
- `content/writing.js` entries take an optional `href`; without one they render
  as plain text rather than a dead link.
- Ecosystems count in `content/ledger.js` is still flagged `TODO`.
- No `opengraph-image`, so the link previews as a bare URL.
- **The domain is set not to renew.** The `.DEV` subscription is `non_renewing`
  with auto-renew off and expires **2027-09-01**. Turn auto-renew on at
  Hostinger to keep it.

## Commit identity

Pinned repo-locally so it does not follow the global git config:

```
user.name  = Udoka_AM
user.email = udoka.eth@gmail.com
```
