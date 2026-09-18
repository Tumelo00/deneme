# PS5 13.60 automated research summary

Generated: 2026-09-18T05:03:48.420206+00:00

## Latest baseline run

- Run: `mu6ezizt-ed8o4q108bktn`
- Fingerprint: `FW=13.60|UA-WK=605.1.15|W=1|BLOB=1|SAB=0|ATOM=1|ATOMUSE=0|WASM=0|BIGINT=1|EVAL=1|FUNC=1|WEBGL=0|WKR=1|XFER=1|MEM=1|TRES=1.000000 ms`

## Latest Advanced run

- Run: `mu6hsk3i-8o1rb8`
- Verdict: **PASS — Stage A handoff + bridge/native getpid completed**
- Stage A userland handoff: `True`
- Bridge/native stage seen: `True`
- getpid success seen: `True`
- DONE seen: `True`
- 13.60 notify offset observed: `True`

### Stage markers
```text
advanced_stage=A
run=mu6hsk3i-8o1rb8
firmware=13.60
phase=ATTEMPT_ARMED
build=0.6.3
max=1
n=512
fresh_cycle=1
fresh_max=3
stageb=direct-getpid-no-bridge
notify=0x48b0
gps=0x334e238

advanced_stage=A
run=mu6hsk3i-8o1rb8
firmware=13.60
phase=ATTEMPT_ARMED
build=0.6.3
max=1
n=512
fresh_cycle=1
fresh_max=3
stageb=direct-getpid-no-bridge
notify=0x48b0
gps=0x334e238

advanced_stage=A
run=mu6hsk3i-8o1rb8
firmware=13.60
phase=USERLAND_HANDOFF
ctx=1
webkitBase=35192963072
libkernelBase=34423488512

advanced_stage=A
run=mu6hsk3i-8o1rb8
firmware=13.60
phase=USERLAND_HANDOFF
ctx=1
webkitBase=35192963072
libkernelBase=34423488512

advanced_stage=A
run=mu6hsk3i-8o1rb8
firmware=13.60
phase=USERLAND_HANDOFF
ctx=1
webkitBase=35192963072
libkernelBase=34423488512

advanced_stage=B
run=mu6hsk3i-8o1rb8
firmware=13.60
phase=DIRECT_GETPID_START
ctx=1
getpidPtr=34423601248
webkitBase=35192963072
libkernelBase=34423488512

advanced_stage=B
run=mu6hsk3i-8o1rb8
firmware=13.60
phase=DIRECT_GETPID_PASS
pid=211
getpidPtr=34423601248
mode=NATURAL_NATIVE_CALL

advanced_stage=B
run=mu6hsk3i-8o1rb8
firmware=13.60
phase=DIRECT_GETPID_START
ctx=1
getpidPtr=34423601248
webkitBase=35192963072
libkernelBase=34423488512

advanced_stage=B
run=mu6hsk3i-8o1rb8
firmware=13.60
phase=DIRECT_GETPID_PASS
pid=211
getpidPtr=34423601248
mode=NATURAL_NATIVE_CALL

advanced_stage=B
run=mu6hsk3i-8o1rb8
firmware=13.60
phase=DIRECT_GETPID_PASS
pid=211
getpidPtr=34423601248
mode=NATURAL_NATIVE_CALL

advanced_stage=B
run=mu6hsk3i-8o1rb8
firmware=13.60
phase=DIRECT_GETPID_START
ctx=1
getpidPtr=34423601248
webkitBase=35192963072
libkernelBase=34423488512
```

### Captured PSAITO log lines
```text

```

