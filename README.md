# PS5 13.60 Research Host

A small, non-destructive PS5 browser research host focused on firmware 13.60.

## Why this exists

The current open-source PS5 ecosystem has **13.60 payload SDK support**, but that is not the same thing as a complete public browser-to-kernel jailbreak chain.

This project deliberately separates those layers:

- **Browser / entrypoint**: this host only performs safe environment checks.
- **Kernel exploit**: not bundled until a 13.60 chain is independently verified.
- **Payload SDK**: ps5-payload-dev/sdk v0.42+ includes firmware 13.60 support.
- **Kernel patch layer**: EchoStretch/kstuff-lite is the strongest active public base we found, but its published 1.10 release advertises support through 12.70; mainline 1.11 work is tracked separately.
- **Payloads after code execution**: ps5-payload-dev tools already contain 13.60-aware payload support.

## Research conclusion

### Best foundation for 13.60 payload development
**ps5-payload-dev/sdk** — active, maintained, explicit 13.60 support, reproducible build flow.

### Best kernel-patch codebase to watch
**EchoStretch/kstuff-lite** — active, sophisticated diagnostics and performance work. Do not assume 13.60 compatibility just because the payload SDK supports 13.60.

### Best mature web-host reference
**idlesauce/umtx2** — clean and proven host structure, but its documented firmware range is only 1.00–5.50.

### Most interesting alternative entrypoint work
**n0llptr/remote_lua_loader** — active research with recent P2JB/kernel-exploit work, but it is not a documented one-click 13.60 GitHub Pages jailbreak.

### Not used as a base
**Wamphyre/PSAITO** — claims 13.xx research coverage, but its destructive kernel-UAF path can hang/panic a console and is not sufficiently independently verified for this project.

## What you can test on your PS5

Open `index.html` through GitHub Pages and press **Run safe diagnostics**.

The page reports:

- PS5 detection
- firmware parsed from the User-Agent
- WebKit version
- browser features relevant to later research
- a 13.60 readiness summary

It does **not** attempt a kernel exploit and does not modify the console.

## Upstream references

- https://github.com/ps5-payload-dev/sdk
- https://github.com/EchoStretch/kstuff-lite
- https://github.com/idlesauce/umtx2
- https://github.com/n0llptr/remote_lua_loader
- https://github.com/Gezine/BD-JB5
- https://github.com/Wamphyre/PSAITO

See `ATTRIBUTION.md` for licensing notes.

## GitHub Pages

A Pages workflow is included. In GitHub repository settings, set **Pages -> Source -> GitHub Actions** once. After that, pushes to `main` deploy automatically.

## Safety

Use only on hardware you own and control. This repository intentionally does not include piracy tooling, credential access, PSN bypasses, or destructive kernel exploit code.
