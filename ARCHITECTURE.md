# How the Multi-Shop System Works

## The idea

One website, many shops. Instead of building and hosting a separate app for every shop, all shops share the exact same app and the exact same database — but each shop only ever sees its own data.

## How a shop gets its own address

Each shop gets its own web address, like:

- `shopa.yourdomain.com`
- `shopb.yourdomain.com`

These all point to the same app. When someone visits `shopa.yourdomain.com`, the app looks at which address was typed and figures out "this is Shop A," then only shows Shop A's data — invoices, customers, products, everything.

## How data stays separate

Every piece of data in the database — every sale, every customer, every product — is tagged with which shop it belongs to. When Shop A asks for its sales invoices, the database only ever hands back rows tagged with Shop A's ID. Even if there were a mistake somewhere in the app's code, the database itself refuses to hand one shop's data to another shop. This is enforced at the database level, not just in the app.

## How login works

Each person logs in with an email and password (handled by Supabase, the same service that stores all the data). After logging in, the app checks which shop(s) that person is allowed to see. A cashier at Shop A can only ever see Shop A's data — even if they typed Shop B's address directly into the browser.

## Step by step: what happens when someone visits the site

1. Someone types `shopa.yourdomain.com` into their browser.
2. The app reads the address and works out "which shop is 'shopa'?"
3. If they're not logged in, they're sent to the login page.
4. If they are logged in, the app checks: is this person allowed to see Shop A?
5. If yes — it fetches only Shop A's invoices, customers, and products, and shows the dashboard.
6. If they try a different shop's address without permission, they see nothing for that shop.

In one line:

```
Visitor → shopa.yourdomain.com → app checks the address → app checks login →
database (filtered to Shop A only) → dashboard shown
```

## Adding a new shop later

Once the address setup below is done once, adding a new shop is just adding one row to the shops table in the database — no new hosting, no new deployment, no new code to write.

## What needs to be set up once

- A single web app (already built), deployed once.
- A domain name (e.g. `yourdomain.com`) with a "wildcard" DNS setting so any `[anything].yourdomain.com` points to that same app.
- One shared database (Supabase) that stores every shop's data, kept apart by a "shop ID" tag on every record.

That's the whole idea: **one app, one database, many front doors.**
