# Research notes — PS5 13.60

Date: 2026-09-18

## Baseline observed on the target console

The first host build returned:

- firmware: 13.60
- User-Agent WebKit label: 605.1.15
- WebAssembly: unavailable
- BigInt: unavailable
- Worker: available
- SharedArrayBuffer: unavailable
- Atomics global: available
- IndexedDB: unavailable
- Service Worker: unavailable
- Performance API: available
- TextEncoder: available
- crypto.getRandomValues: available

Build 0.2 exists to turn those simple booleans into behavior-level results.

## Important correction: 605.1.15 is not the source revision

WebKit's PlayStation User-Agent implementation hard-codes the compatibility string `605.1.15` in `versionForUAString()`.

Source:
https://github.com/WebKit/WebKit/blob/main/Source/WebCore/platform/playstation/UserAgentPlayStation.cpp

Therefore a vulnerability cannot be selected merely because a desktop/iOS Safari build also reports 605.1.15. Firmware-specific behavior and code/offset evidence matter more.

## Public project comparison

### ps5-payload-dev/sdk
https://github.com/ps5-payload-dev/sdk

- 13.60 support added 2026-08-02.
- Useful after native/payload execution is already available.
- Does not supply the browser entrypoint.

### EchoStretch/kstuff-lite
https://github.com/EchoStretch/kstuff-lite

- Active 1.11 mainline development.
- Published 1.10 release states 3.00–12.70 support.
- Treat 13.60 as unconfirmed unless the project explicitly adds it or it is validated on hardware.

### idlesauce/umtx2
https://github.com/idlesauce/umtx2

- Mature PSFree + UMTX host architecture.
- Documented firmware support is 1.00–5.50.
- Useful as an architectural reference, not a 13.60 chain.

### Gezine/BD-JB5
https://github.com/Gezine/BD-JB5

- Standalone support is documented through 13.42.
- 13.60+ documentation explicitly says the PS5 must already be jailbroken before applying the BD-J unpatch path.

### n0llptr/remote_lua_loader
https://github.com/n0llptr/remote_lua_loader

- Described as firmware-independent.
- Requires a compatible Artemis-engine game and save-data workflow.
- This is a different entrypoint family from a GitHub Pages browser chain.

### Wamphyre/PSAITO
https://github.com/Wamphyre/PSAITO

- Claims experimental WebKit research coverage for 09.00–13.60 and a console procedure for 13.00–13.60.
- Its README distinguishes dump-backed offsets from interpolated assumptions.
- It states that the final kernel UAF stage can hang or panic the PS5.
- The project itself notes that survival of the WebKit SSV bug and sandbox access to required AIO syscalls remain firmware-dependent questions.

For our host, PSAITO is treated as a research lead rather than silently copied into an automatic chain.

## Build 0.2 questions

The next console run should answer:

1. Does a Blob-created Worker actually start on 13.60?
2. Can ArrayBuffer ownership be transferred/detached between main thread and Worker?
3. Is the Atomics object merely exposed while SharedArrayBuffer remains unavailable?
4. Are dynamic code generation paths (`eval` and `Function`) enabled?
5. What timer resolution is exposed by `performance.now()`?
6. Is WebGL available, and what renderer string is reported?
7. Which storage and transport APIs are actually usable?
8. Can ordinary 1/4/8/16 MiB ArrayBuffers be allocated and touched reliably?

These results narrow the browser-runtime model without attempting a kernel exploit.


## 2026-09-18 update: narrowed bottleneck

Fresh public research narrows the 13.60 problem considerably.

### Userland / WebKit side

Wamphyre/PSAITO publishes 13.00-13.60 offset profiles and a documented userland canary. Its `hello_1320.js` payload only logs loader progress and calls `getpid` through the bridge. Build 0.4 launches that hosted canary directly instead of copying PSAITO source into this repository, because PSAITO's package metadata marks the project UNLICENSED.

### Kernel-entry side

Community testing on 13.40 reports that the userland chain can reach ROP/native calls, while AIO-family syscalls needed by one kernel path are blocked with EPERM from the WebKit sandbox. PSAITO's current work therefore includes a syscall census and alternative research paths.

### Post-exploit side

EchoStretch/kstuff-lite mainline contains explicit firmware-13.60 offset work. This is distinct from the older tagged release compatibility statement and indicates that 13.60 post-exploit support is actively being prepared/verified.

### Next decision gate

1. Run Advanced Stage A on the target 13.60 console.
2. If `getpid` completes, the WebKit/userland bridge is proven on this hardware.
3. Only then run a non-destructive sandbox/AIO reachability gate.
4. Do not automatically run the destructive kernel-UAF shot.


## Build 0.4.3: notify parameter collision

The first real 13.60 Advanced Stage A run reached deep into PSAITO's userland setup but stopped before the native-call commit. The captured log showed:

- WebKit base resolved.
- RW carrier created.
- libkernel base resolved.
- getpid import resolved.
- PSAITO reported `NOTIFY-TARGET ... libkernel-rva=0x4740 ... offline-verified-fw=11.60`.

For firmware 13.60, PSAITO's own offsets table specifies notify offset `0x48b0`.

Root cause: this launcher passed `notify=0` to disable notifications. PSAITO's index page first writes the firmware-specific notify offset into its runtime query, then forwards the incoming `notify` parameter and overwrites that offset. Therefore `notify=0` collides with PSAITO's offset parameter and prevents the intended 13.60 notify profile from reaching the exploit.

Build 0.4.3 removes the launcher-side `notify=0` override and allows PSAITO to populate the 13.60 offset list normally.
