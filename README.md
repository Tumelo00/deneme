# PS5 13.60 Research Host

A non-destructive browser/runtime research host for PlayStation 5 firmware 13.60.

Live Pages URL: https://tumelo00.github.io/deneme/

## Current build: 0.4

Build 0.3 is based on real output from a PS5 running 13.60. It runs the runtime fingerprint, Worker transfer test, and bounded memory allocation in one click:

- firmware and User-Agent parsing
- JavaScript language/runtime capabilities
- ArrayBuffer, DataView, TypedArray, SharedArrayBuffer and Atomics behavior
- Worker, Blob URL and transferable ArrayBuffer test
- local/session storage and browser storage APIs
- fetch/XHR/WebSocket/EventSource transport availability
- crypto and WebCrypto exposure
- performance timer resolution
- WebGL/WebGL2 availability and renderer information
- small, opt-in 1/4/8/16 MiB allocation sanity test
- compact fingerprint string for easy photo/reporting


## Observed target profile from build 0.2

The target PS5 13.60 reported:

- BigInt: available
- eval / Function constructor: available
- Worker: available
- Blob URL: available
- SharedArrayBuffer: unavailable
- Atomics global: available, but unusable without SharedArrayBuffer
- WebAssembly: unavailable
- WebGL / WebGL2: unavailable
- performance.now() observed resolution: 1.000000 ms
- localStorage / sessionStorage / CacheStorage: available
- IndexedDB / Service Worker: unavailable
- fetch / XHR / WebSocket / EventSource / sendBeacon: available
- WebCrypto subtle: available

Build 0.3 automatically collects the two results that were not run in the first hardware pass: transferable ArrayBuffer behavior and the bounded allocation sanity test.

## Important WebKit finding

The `AppleWebKit/605.1.15` value in the PlayStation User-Agent is a fixed compatibility label in WebKit's PlayStation port. It must not be treated as the actual WebKit source revision.

Because of that, this project prioritizes observed feature behavior over the UA version string.

Reference:
https://github.com/WebKit/WebKit/blob/main/Source/WebCore/platform/playstation/UserAgentPlayStation.cpp

## 13.60 ecosystem status researched on 2026-09-18

### ps5-payload-dev/sdk
Firmware 13.60 support was added in v0.42 / commit `4eb7012`.
This is post-exploit payload SDK support; it is not itself a browser jailbreak.

https://github.com/ps5-payload-dev/sdk

### EchoStretch/kstuff-lite
Mainline documents active 1.11 development. The latest published 1.10 release advertises firmware support through 12.70.

https://github.com/EchoStretch/kstuff-lite

### idlesauce/umtx2
A mature browser/kernel host, documented for firmware 1.00–5.50.

https://github.com/idlesauce/umtx2

### Gezine/BD-JB5
Standalone BD-J path is documented through 13.42. The documented 13.60+ procedure requires an already-jailbroken PS5 first.

https://github.com/Gezine/BD-JB5

### n0llptr/remote_lua_loader
The loader is described as firmware-independent, but requires a compatible game/save-data entrypoint and is not a normal browser chain.

https://github.com/n0llptr/remote_lua_loader

### Wamphyre/PSAITO
Claims experimental 13.00–13.60 WebKit/runtime coverage. Its own documentation says the final kernel-UAF stage can hang/panic the console and that some 13.xx assumptions still require validation.

For this reason, this repo does not copy or auto-run that destructive stage.

https://github.com/Wamphyre/PSAITO

## Test order on PS5

1. Open the live Pages URL.
2. Run **deep safe diagnostics**.
3. Run **worker / transfer test**.
4. Run **safe memory test**.
5. Photograph the **Compact fingerprint** and the worker result.

All three tests are designed to stay in normal browser JavaScript and not modify the PS5.

## Project boundary

This repository is for owned-hardware compatibility research. It does not include piracy tooling, account/credential access, PSN bypasses, or an automatically executed destructive kernel probe.

See `RESEARCH.md` for the current technical notes and `ATTRIBUTION.md` for upstream references.


## Advanced Stage A

Build 0.4 adds a launcher for the public PSAITO userland/ROP canary on PS5 13.xx.

The launcher intentionally selects `auto=hello_1320.js`, disables notifications, limits retries, and sends remote logs to the same research relay. The canary only verifies that the WebKit/userland bridge reaches a native `getpid` call. It does not intentionally run the Bagagwa kernel-UAF shot.

This advanced stage is more invasive than the baseline browser diagnostics and can still close or crash the browser if the WebKit exploit fails.

## Updated 13.60 post-exploit finding

EchoStretch/kstuff-lite mainline contains explicit 13.60 work, including commits named:

- `fix: add firmware 13.60 scalar store offset`
- `fix: correct firmware 13.60 scalar store offset`
- `feat: add firmware 13.60 fast-path offsets`

That means the post-exploit/kstuff side is further along than the latest tagged release alone suggests. The main unresolved question for this project is reaching a stable userland/native primitive and then determining which kernel entry path is actually permitted from the WebKit sandbox.
