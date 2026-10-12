# BREAKING ($BREAKING)

**When it hits the news, it burns.**

A landing page that runs like a 24/7 news broadcast. It watches twelve beats (names and words) in the world's news via the GDELT Project, computes each beat's heat (coverage now vs. its own 7-day normal) every 15 minutes and issues burn orders when a beat breaks:

| Tier | Heat | Order |
|---|---|---|
| Watch | ×2 | none |
| Urgent | ×3 | 0.1 SOL (1×) |
| Bulletin | ×5 | 0.3 SOL (3×) |
| Flash | ×10 | 1.0 SOL (10×) |

One order per beat every 6 hours, daily cap 3 SOL. Everything is set in `CONFIG`.

## Files

- `index.html`: the whole site (one file, its own WebGL globe, no libraries)
- `api/gdelt.js`: a small cached proxy for GDELT that Vercel runs as a function. **Keep it.** It shares one cached answer per query across all visitors, so the site never hits GDELT's limit of one request per 5 seconds.
- `vercel.json`: gives the proxy enough time to retry when GDELT is busy
- `og.jpg`: share image for X (1200×630)

## Fill in at launch (top of the script in `index.html`)

```js
const CONFIG = {
  ca: "",          // the $BREAKING mint address. Turns on Buy links, the CA box and the live burned count
  x: "",           // your X link
  dexscreener: "", // optional
  site: "",        // e.g. "breaking.fun", printed on Break Cards
  launch: "",      // launch time, e.g. "2026-10-10T18:00:00Z". Orders before it show as Backtest
  burnWallet: "",  // the public address of the wallet that buys and burns. Its burns show as fills
  ...
}
```

- Without `ca` the CA box says "Posted here and on X at launch" and Buy goes to pump.fun.
- Without `launch` every order is shown as **Backtest** (what the wire would have ordered). Set it at launch so new orders show as **Issued**.
- With `burnWallet` set, every burn of $BREAKING from that wallet appears on the record as **Filled** with a Solscan link. Fills settle the oldest open order first.

## How burns work (be honest about this when you post)

The site computes orders automatically and they are the same for everyone. At launch **you** fill them: claim creator fees, buy $BREAKING with the order's SOL and burn it from the burn wallet (for example with Sol Incinerator or `spl-token burn`). The fill shows up on the record by itself. The site says a bot comes next. Don't call it fully automatic until it is.

## Deploy (GitHub → Vercel)

1. Push the whole folder (including `api/` and `vercel.json`) to a new GitHub repo.
2. In Vercel: Add New Project → pick the repo → Framework Preset **Other** → no build command → Deploy.
3. After deploy, check:
   - The pill next to the logo says **LIVE** (red). If it says PREVIEW, the proxy isn't running: make sure `api/gdelt.js` was pushed.
   - The wire fills its 12 beats (the first visit after a deploy takes up to a minute, then it's cached and instant).
   - Type a name in Check the heat and make a Break Card.
   - Fonts (Big Shoulders, Schibsted Grotesk, Chivo Mono, DM Serif Display) and the 3D globe on a real GPU.
   - The X preview: paste the link in an X post draft and confirm the og image shows.

## Editing beats

`CONFIG.beats` holds the twelve words. Phrases with spaces go in double quotes (`'"Federal Reserve"'`). GDELT rejects very short words, so use full names (`"Elon Musk"`, not `Elon`). Keep wars, attacks and disasters off the list.

Data: the GDELT Project (free, no key). Not financial advice.
