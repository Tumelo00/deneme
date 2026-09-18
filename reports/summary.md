# PS5 13.60 automated research summary

Generated: 2026-09-18T03:56:23.762375+00:00

## Latest baseline run

- Run: `mu6ezizt-ed8o4q108bktn`
- Fingerprint: `FW=13.60|UA-WK=605.1.15|W=1|BLOB=1|SAB=0|ATOM=1|ATOMUSE=0|WASM=0|BIGINT=1|EVAL=1|FUNC=1|WEBGL=0|WKR=1|XFER=1|MEM=1|TRES=1.000000 ms`

## Latest Advanced Stage A

- Run: `mu6ezktn-hcsy82pivjpg`
- Verdict: **INCOMPLETE — no successful canary marker captured**
- BRIDGE-BOOT seen: `False`
- getpid success seen: `False`
- DONE seen: `False`

### Captured PSAITO log lines
```text
a1-rmu6f0w1u-s29-note-KERNEL-IMPORTS-1-object=0x0-close=0x80022f4e0:RESOLVED-error=0x8002177d0:RESOLVED
a1-rmu6f0w1u-s45-note-NOTIFY-PLAN-MISMATCH-ready=false-arena=true-filled=false-collator=false-compare=true-request=true-target=true-carrier-armed=false-repeat-block=true
a1-rmu6f0w1u-s28-note-LIBC-BASE-0xNaN-equations=0-pass=true
a1-rmu6f0w1u-s16-note-SSV-RETURNED-CLEARED-length=327681-predecessor-cleared=true
a1-rmu6f0w1u-s40-note-NATIVE-EXECUTABLE-HEX-604500000008000020ba7a001000000040ba7a0010000000291d932b08000000821d932b080000009833eb2808000000582aeb2808000000
a1-rmu6f0w1u-s37-note-NOTIFY-CONTEXT-B+48-rdi=0-device-B+60-rcx=0-nonblocking-B+e0=notification-export-rsi=request-rdx=0xc30
a1-rmu6f0w1u-s32-note-ARENA-CELL-view=0x1000bf0280-backing=0x1000ed0000-size=0x10000-header-pass=true-sentinel-pass=true
a1-rmu6f0w1u-s2-note-ATTEMPT-START-attempt-persisted=true-auto=true-hard-max=3-capture-ms=50-compose-ms=100-retry-ms=3000
a1-rmu6f0w1u-s43-note-MODULE-IMPORT-LEAK-MISMATCH-rw=true-function=true-native=true-base=true-repeat=true-got=true-requirements=true-libc=true-kernel=true-restore=true
a1-rmu6f0w1u-s33-note-COLLATOR-cell=0x10031e24d8-m_collator=0x10031e24f0-original=0x8811fc640-compare=0x1000a38618-search-prewarmed=false
a1-rmu6f0w1u-s27-note-LIBC-IMPORTS-2-strerror=0x0:OTHER-memchr=0x0:OTHER
a1-rmu6f0w1u-s25-note-REQUIREMENTS-BASE-0xNaN-paired=true-pass=true
a1-rmu6f0w1u-s42-note-IMPORT-WINDOW-B-HEX-0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
a1-rmu6f0w1u-s15-note-PREDECESSOR-FILLED-qwords=65536-fake=0x1000708450
a1-rmu6f0w1u-s18-note-HOLDER-cell=0x1000708480-header-pass=true
a1-rmu6f0w1u-s12-note-ADDROF-POINTERS-HOST=0x1000708440-TARGET=0x1000708480-HOST2=0x1000708440-TARGET2=0x1000708480
a1-rmu6f0w1u-s36-note-NOTIFY-TARGET-0x80020c740-libkernel-rva=0x4740-address-ok=true-offline-verified-fw=11.60-xotext-not-read=true
a1-rmu6f0w1u-s31-note-KERNEL-BASE-0x800208000-equations=3-object-anchor=false-pass=true
a1-rmu6f0w1u-s17-note-RW-CARRIER-sid=0x8a30-vector=0x1001e2e300-length=0x100-mode=0x58
a1-rmu6f0w1u-s14-note-SSV-GROOM-ENTER-n=512
a1-rmu6f0w1u-s38-note-NOTIFY-REQUEST-size=0xc30-message-offset=0x2d-ascii=true-layout-pass=true-prewarm-result=1
a1-rmu6f0w1u-s41-note-IMPORT-WINDOW-A-HEX-00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
a1-rmu6f0w1u-s1-note-BOOT-rev=renderer-notify-auto-proof-2-k=2-n=512-attempt=1-armed=true-loop=relentless
a1-rmu6f0w1u-s3-note-SSV-BUILD-k=2-n=512
a1-rmu6f0w1u-s10-note-ADDROF-RETURNED-renderer-notify-auto-proof-2
a1-rmu6f0w1u-s39-note-RW-HEADER-HEX-308a0000002808006841b0001000000000e3e20110000000000100000000000000000000000000005800000074160000
a1-rmu6f0w1u-s35-note-NOTIFY-TRAMPOLINE-0x8002256fa-libkernel-rva=0x1d6fa-natural-rsp=true-bytes=488b8fe000000051488b4f60488b7f48c3
a1-rmu6f0w1u-s22-note-WEBKIT-BASE-0x828e5c000-parseInt-rva=0x1ea18-constructor-rva=0x56a58-text-size=0x2c7c000
a1-rmu6f0w1u-s5-note-SSV-STORE-ENTER-writer-ref=0xfffe
a1-rmu6f0w1u-s6-note-SSV-STORED-fake-host-and-rop-holder-not-serialized
a1-rmu6f0w1u-s7-note-ADDROF-PREP-BEGIN-slots=9000000-bytes=72000000
a1-rmu6f0w1u-s46-note-AUTO-RETRY-AFTER-FAILURE-attempt=1
a1-rmu6f0w1u-s24-note-REQUIREMENTS-IMPORTS-A=0x0-B=0x0
a1-rmu6f0w1u-s23-note-IMPORT-WINDOWS-A=0x82c351708+0xd0-B=0x82c351860+0x38-address-ok=true-read-twice=true-canonical=true
a1-rmu6f0w1u-s13-note-FAKE-ADDRESS-host=0x1000708440-fake=0x1000708450-delta=0x10
a1-rmu6f0w1u-s4-note-SSV-BUILT-duplicate-index=2
a1-rmu6f0w1u-s20-note-NATIVE-EXECUTABLE-P=0x1001d08680-sid=0x4560
a1-rmu6f0w1u-s26-note-LIBC-IMPORTS-1-cxa_finalize=0x0:OTHER-strlen=0x0:OTHER
a1-rmu6f0w1u-s19-note-JSFUNCTION-parseInt=0x10009657c0-sid=0x6cc0-executable=0x1001d08680
a1-rmu6f0w1u-s44-note-ROOTS-LIVE-rw-mirror=3c-guard-byte=a5-parseInt-type=function-length-word=51515151
a1-rmu6f0w1u-s9-note-ADDROF-WRAPPER-READY-wait=50ms
a1-rmu6f0w1u-s34-note-NOTIFY-ARENA-B=0x1000ed0100-V=0x1000ed0300-virtual-slot=0x1000ed0428
a1-rmu6f0w1u-s8-note-ADDROF-CARRIER-DONE-host-holder-host-holder
a1-rmu6f0w1u-s21-note-NATIVE-CALL-TARGET-parseInt=0x828eb3398-constructor=0x828eb2a58
a1-rmu6f0w1u-s30-note-KERNEL-IMPORTS-2-getpid=0x800223860:RESOLVED-pthread_getspecific=0x0:OTHER
a1-rmu6f0w1u-s11-note-ADDROF-COPY-chars=924176-source-covered=true
a1-rmu6f0w1u-s47-note-SURVIVED-NO-COMMIT-T1000
a2-rmu6f0w1u-s49-note-SSV-BUILD-k=2-n=512
a2-rmu6f0w1u-s52-note-SSV-STORED-fake-host-and-rop-holder-not-serialized
a2-rmu6f0w1u-s48-note-ATTEMPT-START-attempt-persisted=true-auto=true-hard-max=3-capture-ms=50-compose-ms=100-retry-ms=3000
a2-rmu6f0w1u-s53-note-ADDROF-PREP-BEGIN-slots=9000000-bytes=72000000
a2-rmu6f0w1u-s50-note-SSV-BUILT-duplicate-index=2
a2-rmu6f0w1u-s51-note-SSV-STORE-ENTER-writer-ref=0xfffe
a2-rmu6f0w1u-s60-note-SSV-GROOM-ENTER-n=512
a2-rmu6f0w1u-s59-note-FAKE-ADDRESS-host=0x1003509040-fake=0x1003509050-delta=0x10
a2-rmu6f0w1u-s58-note-ADDROF-POINTERS-HOST=0x1003509040-TARGET=0x1003509080-HOST2=0x1003509040-TARGET2=0x1003509080
a2-rmu6f0w1u-s54-note-ADDROF-CARRIER-DONE-host-holder-host-holder
a2-rmu6f0w1u-s56-note-ADDROF-RETURNED-renderer-notify-auto-proof-2
a2-rmu6f0w1u-s57-note-ADDROF-COPY-chars=34478608-source-covered=true
a2-rmu6f0w1u-s55-note-ADDROF-WRAPPER-READY-wait=50ms
a2-rmu6f0w1u-s65-note-AUTO-RETRY-CANCELLED-reason=placement-throw-storage-safe=false-retry-safe=true-candidate-safe=true-candidate-mutated=false-commit=false-armed=false
a3-rmu6f0w1u-s70-note-SSV-STORE-ENTER-writer-ref=0xfffe
a4-rmu6f183l-s1-note-BOOT-rev=renderer-notify-auto-proof-2-k=2-n=512-attempt=4-armed=true-loop=relentless
```

