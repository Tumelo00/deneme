(function(){
  "use strict";

  var meta=window.__PS5_STAGEB_META||{};
  var rid=String(meta.rid||"unknown");
  var TOPIC=String(meta.topic||"");
  var UP=String(meta.up||"https://wamphyre.github.io/PSAITO/");
  var REV=String(meta.rev||"6a5170c0df19206837893d57924d39ee4a2e6886");

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
    try{ localStorage.setItem("ps5-1360-last-stageb",msg); }catch(_){}
    relay("PS5 13.60 ADV-B "+rid,msg);
  }

  function loadScript(src){
    return new Promise(function(resolve,reject){
      var s=document.createElement("script");
      s.src=src;
      s.onload=resolve;
      s.onerror=function(){reject(new Error("load failed: "+src));};
      document.head.appendChild(s);
    });
  }

  if(!window.__PS5_CTX){
    report("BRIDGE_ABORT","reason=no-ps5-ctx");
    return;
  }

  report("BRIDGE_LOAD_START",
    "ctx=1\nwebkitBase="+String(window.__PS5_CTX.webkitBase||0)+
    "\nlibkernelBase="+String(window.__PS5_CTX.libkernelBase||0));

  var NativeURLSearchParams=window.URLSearchParams;
  var restored=false;

  function restore(){
    if(restored) return;
    restored=true;
    try{window.URLSearchParams=NativeURLSearchParams;}catch(_){}
  }

  try{
    window.URLSearchParams=function(init){
      var p=new NativeURLSearchParams(init);
      var originalGet=p.get.bind(p);
      p.get=function(k){
        if(String(k)==="notify") return "0";
        return originalGet(k);
      };
      return p;
    };
    window.URLSearchParams.prototype=NativeURLSearchParams.prototype;
  }catch(_){}

  window.onBridgeReady=function(ps5){
    restore();
    var mode=ps5&&ps5.mode?String(ps5.mode):"UNKNOWN";
    report("BRIDGE_READY","mode="+mode);

    try{
      var pid=window.syscall(window.SYSCALL.getpid);
      report("GETPID_PASS","mode="+mode+"\npid="+String(pid));
      var st=document.getElementById("status");
      if(st) st.textContent="GETPID PASS — mode="+mode+" pid="+String(pid);
    }catch(e){
      var err=String(e&&e.message||e).slice(0,220);
      report("GETPID_FAIL","mode="+mode+"\nerror="+err);
      var st2=document.getElementById("status");
      if(st2) st2.textContent="GETPID FAIL — mode="+mode+" — "+err;
    }
  };

  loadScript(UP+"modules/bridge.js?v="+encodeURIComponent(REV)+"&_="+Date.now())
    .then(function(){
      report("BRIDGE_SCRIPT_LOADED");
      try{
        if(typeof window.onUserland!=="function")
          throw new Error("bridge-onUserland-missing");
        window.onUserland();
      }catch(e){
        restore();
        report("BRIDGE_BOOT_FAIL","error="+String(e&&e.message||e).slice(0,220));
      }
    })
    .catch(function(e){
      restore();
      report("BRIDGE_LOAD_FAIL","error="+String(e&&e.message||e).slice(0,220));
    });

  setTimeout(restore,15000);
}());
