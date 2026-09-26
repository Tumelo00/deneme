# PS5 13.60 automated research summary

Generated: 2026-09-26T06:54:30.861408+00:00

## Latest baseline run

- Run: `mu6ezizt-ed8o4q108bktn`
- Fingerprint: `FW=13.60|UA-WK=605.1.15|W=1|BLOB=1|SAB=0|ATOM=1|ATOMUSE=0|WASM=0|BIGINT=1|EVAL=1|FUNC=1|WEBGL=0|WKR=1|XFER=1|MEM=1|TRES=1.000000 ms`

## Latest Advanced run

- Run: `mu6hyzm8-yizvx1`
- Verdict: **PASS — Stage A handoff + bridge/native getpid completed**
- Stage A userland handoff: `True`
- Bridge/native stage seen: `True`
- getpid success seen: `True`
- capability census seen: `True`
- static gadget map seen: `False`
- pivot/save discovery seen: `False`
- scanless setjmp probe seen: `False`
- DONE seen: `True`
- 13.60 notify offset observed: `True`

### Stage markers
```text
92963072
libkernelBase=34423488512

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=DIRECT_GETPID_START
ctx=1
getpidPtr=34423601248
webkitBase=35192963072
libkernelBase=34423488512

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=DIRECT_GETPID_START
ctx=1
getpidPtr=34423601248
webkitBase=35192963072
libkernelBase=34423488512

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=DIRECT_GETPID_PASS
pid=211
getpidPtr=34423601248
mode=NATURAL_NATIVE_CALL

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=DIRECT_GETPID_PASS
pid=211
getpidPtr=34423601248
mode=NATURAL_NATIVE_CALL

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=DIRECT_GETPID_START
ctx=1
getpidPtr=34423601248
webkitBase=35192963072
libkernelBase=34423488512

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=DIRECT_GETPID_PASS
pid=211
getpidPtr=34423601248
mode=NATURAL_NATIVE_CALL

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_PROBE
name=geteuid
num=25
rva=0x1bd20
value=1

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_PROBE
name=getegid
num=43
rva=0x1d3c0
value=1

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_PROBE
name=getppid
num=39
rva=0x1b760
value=54

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_PROBE
name=geteuid
num=25
rva=0x1bd20
value=1

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_PROBE
name=getuid
num=24
rva=0x1c9b0
value=1

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_PROBE
name=getegid
num=43
rva=0x1d3c0
value=1

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_PROBE
name=getegid
num=43
rva=0x1d3c0
value=1

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_PROBE
name=getppid
num=39
rva=0x1b760
value=54

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_PROBE
name=getuid
num=24
rva=0x1c9b0
value=1

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_PROBE
name=getuid
num=24
rva=0x1c9b0
value=1

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_PROBE
name=getppid
num=39
rva=0x1b760
value=54

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_PROBE
name=geteuid
num=25
rva=0x1bd20
value=1

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_CENSUS_PASS
pid=211
getppid=54
getuid=1
geteuid=1
getegid=1
getgid=1
is_in_sandbox=1
sched_yield=0
sandbox_value=1
mode=NATURAL_NATIVE_CALL

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_PROBE
name=is_in_sandbox
num=585
rva=0x1d040
value=1

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_PROBE
name=getgid
num=47
rva=0x1b1e0
value=1

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_PROBE
name=is_in_sandbox
num=585
rva=0x1d040
value=1

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_PROBE
name=getgid
num=47
rva=0x1b1e0
value=1

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_PROBE
name=sched_yield
num=331
rva=0x1bd80
value=0

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_PROBE
name=getgid
num=47
rva=0x1b1e0
value=1

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_CENSUS_PASS
pid=211
getppid=54
getuid=1
geteuid=1
getegid=1
getgid=1
is_in_sandbox=1
sched_yield=0
sandbox_value=1
mode=NATURAL_NATIVE_CALL

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_CENSUS_PASS
pid=211
getppid=54
getuid=1
geteuid=1
getegid=1
getgid=1
is_in_sandbox=1
sched_yield=0
sandbox_value=1
mode=NATURAL_NATIVE_CALL

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_PROBE
name=sched_yield
num=331
rva=0x1bd80
value=0

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_PROBE
name=sched_yield
num=331
rva=0x1bd80
value=0

advanced_stage=B
run=mu6hyzm8-yizvx1
firmware=13.60
phase=CAPABILITY_PROBE
name=is_in_sandbox
num=585
rva=0x1d040
value=1
```

### Captured PSAITO log lines
```text

```

