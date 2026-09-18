(function () {
  "use strict";

  var ua = navigator.userAgent || "";
  var state = {
    meta: {},
    tests: [],
    worker: { status: "not-run" },
    memory: { status: "not-run" }
  };

  function parseFirmware(text) {
    var patterns = [
      /PlayStation 5\/(\d+\.\d+)/i,
      /RNPS\/(\d+\.\d+)/i,
      /PlayStation 5\s+(\d+\.\d+)/i
    ];
    for (var i = 0; i < patterns.length; i++) {
      var m = text.match(patterns[i]);
      if (m) return m[1];
    }
    return null;
  }

  function parseWebKitLabel(text) {
    var m = text.match(/AppleWebKit\/([\d.]+)/i);
    return m ? m[1] : null;
  }

  function isPS5(text) {
    return /PlayStation 5|RNPS/i.test(text);
  }

  function setText(id, value) {
    var node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  function detail(value) {
    if (value === true) return "yes";
    if (value === false) return "no";
    if (value === null || typeof value === "undefined") return "unknown";
    return String(value);
  }

  function runTest(group, name, fn) {
    var row = { group: group, name: name, ok: false, detail: "" };
    try {
      var value = fn();
      if (typeof value === "object" && value && "ok" in value) {
        row.ok = !!value.ok;
        row.detail = detail(value.detail);
      } else {
        row.ok = !!value;
        row.detail = detail(value);
      }
    } catch (e) {
      row.ok = false;
      row.detail = "threw: " + (e && e.name ? e.name : "Error") + (e && e.message ? " - " + e.message : "");
    }
    state.tests.push(row);
    return row;
  }

  function testStorage(kind) {
    try {
      var s = window[kind];
      var key = "__ps5_research_probe__";
      s.setItem(key, "1");
      var ok = s.getItem(key) === "1";
      s.removeItem(key);
      return ok;
    } catch (e) {
      return false;
    }
  }

  function timingResolution() {
    if (!(window.performance && typeof performance.now === "function")) return { ok: false, detail: "performance.now unavailable" };
    var last = performance.now();
    var min = Infinity;
    for (var i = 0; i < 5000; i++) {
      var now = performance.now();
      var d = now - last;
      if (d > 0 && d < min) min = d;
      last = now;
    }
    return { ok: min !== Infinity, detail: min === Infinity ? "no positive delta observed" : min.toFixed(6) + " ms" };
  }

  function webglInfo() {
    try {
      var c = document.createElement("canvas");
      var gl = c.getContext("webgl") || c.getContext("experimental-webgl");
      if (!gl) return { ok: false, detail: "context unavailable" };
      var vendor = gl.getParameter(gl.VENDOR);
      var renderer = gl.getParameter(gl.RENDERER);
      var ext = gl.getExtension("WEBGL_debug_renderer_info");
      if (ext) {
        vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || vendor;
        renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || renderer;
      }
      return { ok: true, detail: String(vendor) + " / " + String(renderer) };
    } catch (e) {
      return { ok: false, detail: e.name || "error" };
    }
  }

  function collectMeta() {
    var fw = parseFirmware(ua) || "unknown";
    state.meta = {
      build: "0.3",
      timestamp: new Date().toISOString(),
      device: isPS5(ua) ? "PlayStation 5" : "Other / unknown",
      firmware: fw,
      userAgentWebKitLabel: parseWebKitLabel(ua) || "unknown",
      userAgentWebKitLabelIsStaticOnPlayStation: isPS5(ua),
      userAgent: ua,
      language: navigator.language || "unknown",
      online: typeof navigator.onLine === "boolean" ? navigator.onLine : null,
      hardwareConcurrency: typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : null,
      deviceMemory: typeof navigator.deviceMemory === "number" ? navigator.deviceMemory : null,
      crossOriginIsolated: typeof window.crossOriginIsolated === "boolean" ? window.crossOriginIsolated : null,
      protocol: location.protocol,
      origin: location.origin || (location.protocol + "//" + location.host),
      screen: {
        width: screen && screen.width,
        height: screen && screen.height,
        devicePixelRatio: window.devicePixelRatio || 1
      }
    };
  }

  function runDiagnostics() {
    collectMeta();
    state.tests = [];

    runTest("JavaScript", "eval", function () { return window.eval("1+1") === 2; });
    runTest("JavaScript", "Function constructor", function () { return (new Function("return 7"))() === 7; });
    runTest("JavaScript", "Proxy", function () { return typeof Proxy !== "undefined"; });
    runTest("JavaScript", "Reflect", function () { return typeof Reflect !== "undefined"; });
    runTest("JavaScript", "Symbol", function () { return typeof Symbol !== "undefined"; });
    runTest("JavaScript", "Promise", function () { return typeof Promise !== "undefined"; });
    runTest("JavaScript", "Promise.finally", function () { return typeof Promise !== "undefined" && typeof Promise.prototype.finally === "function"; });
    runTest("JavaScript", "async function syntax", function () {
      if (typeof Function === "undefined") return false;
      return typeof (new Function("return (async function(){return 1;})"))() === "function";
    });
    runTest("JavaScript", "generator syntax", function () {
      if (typeof Function === "undefined") return false;
      return typeof (new Function("return (function*(){yield 1;})"))() === "function";
    });
    runTest("JavaScript", "BigInt", function () { return typeof BigInt !== "undefined"; });
    runTest("JavaScript", "BigInt64Array", function () { return typeof BigInt64Array !== "undefined"; });
    runTest("JavaScript", "WeakRef", function () { return typeof WeakRef !== "undefined"; });
    runTest("JavaScript", "FinalizationRegistry", function () { return typeof FinalizationRegistry !== "undefined"; });

    runTest("Memory", "ArrayBuffer", function () {
      var b = new ArrayBuffer(64);
      return b.byteLength === 64;
    });
    runTest("Memory", "DataView", function () {
      var b = new ArrayBuffer(8);
      var v = new DataView(b);
      v.setUint32(0, 0x12345678, true);
      return { ok: v.getUint32(0, true) === 0x12345678, detail: "little-endian read/write" };
    });
    runTest("Memory", "Uint8Array", function () {
      var a = new Uint8Array(8);
      a[7] = 0x5a;
      return a[7] === 0x5a;
    });
    runTest("Memory", "SharedArrayBuffer", function () { return typeof SharedArrayBuffer !== "undefined"; });
    runTest("Memory", "Atomics global", function () { return typeof Atomics !== "undefined"; });
    runTest("Memory", "Atomics usable", function () {
      if (typeof Atomics === "undefined") return { ok: false, detail: "Atomics missing" };
      if (typeof SharedArrayBuffer === "undefined") return { ok: false, detail: "Atomics exists but SharedArrayBuffer is unavailable" };
      var sab = new SharedArrayBuffer(4);
      var a = new Int32Array(sab);
      var previous = Atomics.add(a, 0, 1);
      return { ok: previous === 0 && a[0] === 1, detail: "SharedArrayBuffer-backed operation" };
    });

    runTest("Concurrency", "Worker", function () { return typeof Worker !== "undefined"; });
    runTest("Concurrency", "SharedWorker", function () { return typeof SharedWorker !== "undefined"; });
    runTest("Concurrency", "MessageChannel", function () { return typeof MessageChannel !== "undefined"; });
    runTest("Concurrency", "BroadcastChannel", function () { return typeof BroadcastChannel !== "undefined"; });
    runTest("Concurrency", "Blob URL", function () {
      if (typeof Blob === "undefined" || !window.URL || typeof URL.createObjectURL !== "function") return false;
      var u = URL.createObjectURL(new Blob(["x"], { type: "text/plain" }));
      URL.revokeObjectURL(u);
      return !!u;
    });

    runTest("Storage", "localStorage", function () { return testStorage("localStorage"); });
    runTest("Storage", "sessionStorage", function () { return testStorage("sessionStorage"); });
    runTest("Storage", "IndexedDB", function () { return typeof indexedDB !== "undefined"; });
    runTest("Storage", "CacheStorage", function () { return typeof caches !== "undefined"; });
    runTest("Storage", "Service Worker", function () { return "serviceWorker" in navigator; });

    runTest("Networking", "fetch", function () { return typeof fetch === "function"; });
    runTest("Networking", "XMLHttpRequest", function () { return typeof XMLHttpRequest !== "undefined"; });
    runTest("Networking", "WebSocket", function () { return typeof WebSocket !== "undefined"; });
    runTest("Networking", "EventSource", function () { return typeof EventSource !== "undefined"; });
    runTest("Networking", "sendBeacon", function () { return typeof navigator.sendBeacon === "function"; });

    runTest("Crypto", "crypto.getRandomValues", function () {
      if (!(window.crypto && typeof crypto.getRandomValues === "function")) return false;
      var a = new Uint32Array(2);
      crypto.getRandomValues(a);
      return a[0] !== 0 || a[1] !== 0;
    });
    runTest("Crypto", "WebCrypto subtle", function () { return !!(window.crypto && crypto.subtle); });

    runTest("Timing", "Performance API", function () { return !!(window.performance && typeof performance.now === "function"); });
    runTest("Timing", "performance.now resolution", timingResolution);
    runTest("Timing", "requestAnimationFrame", function () { return typeof requestAnimationFrame === "function"; });

    runTest("Browser", "TextEncoder", function () { return typeof TextEncoder !== "undefined"; });
    runTest("Browser", "TextDecoder", function () { return typeof TextDecoder !== "undefined"; });
    runTest("Browser", "structuredClone", function () { return typeof structuredClone === "function"; });
    runTest("Browser", "queueMicrotask", function () { return typeof queueMicrotask === "function"; });
    runTest("Browser", "MutationObserver", function () { return typeof MutationObserver !== "undefined"; });
    runTest("Browser", "WebAssembly", function () { return typeof WebAssembly !== "undefined"; });
    runTest("Graphics", "WebGL", webglInfo);
    runTest("Graphics", "WebGL2", function () {
      try {
        var c = document.createElement("canvas");
        return !!c.getContext("webgl2");
      } catch (e) {
        return false;
      }
    });

    renderAll();
  }

  function runWorkerTest(done) {
    var report = document.getElementById("workerReport");
    report.textContent = "Running...";
    state.worker = { status: "running" };

    if (typeof Worker === "undefined" || typeof Blob === "undefined" || !window.URL || typeof URL.createObjectURL !== "function") {
      state.worker = { status: "unsupported", detail: "Worker or Blob URL unavailable" };
      renderAll();
      if (typeof done === "function") done();
      return;
    }

    var source =
      "self.onmessage=function(e){" +
      "var b=e.data&&e.data.buffer;" +
      "var first=-1;try{if(b&&b.byteLength){first=new Uint8Array(b)[0];}}catch(x){}" +
      "self.postMessage({pong:true,byteLength:b?b.byteLength:-1,first:first,atomics:typeof Atomics!=='undefined',sab:typeof SharedArrayBuffer!=='undefined'});" +
      "};";
    var url = URL.createObjectURL(new Blob([source], { type: "application/javascript" }));
    var worker;
    var timeout;

    try {
      worker = new Worker(url);
      var buffer = new ArrayBuffer(1024);
      new Uint8Array(buffer)[0] = 0x5a;
      var before = buffer.byteLength;

      worker.onmessage = function (e) {
        clearTimeout(timeout);
        var after = buffer.byteLength;
        state.worker = {
          status: "ok",
          transferableDetachedOnMainThread: after === 0,
          mainBefore: before,
          mainAfter: after,
          workerReply: e.data
        };
        try { worker.terminate(); } catch (_) {}
        try { URL.revokeObjectURL(url); } catch (_) {}
        renderAll();
        if (typeof done === "function") done();
      };

      worker.onerror = function (e) {
        clearTimeout(timeout);
        state.worker = { status: "error", detail: (e && e.message) ? e.message : "worker error" };
        try { worker.terminate(); } catch (_) {}
        try { URL.revokeObjectURL(url); } catch (_) {}
        renderAll();
        if (typeof done === "function") done();
      };

      try {
        worker.postMessage({ buffer: buffer }, [buffer]);
      } catch (transferError) {
        worker.postMessage({ buffer: buffer });
        state.worker.transferListError = transferError.name + ": " + transferError.message;
      }

      timeout = setTimeout(function () {
        state.worker = { status: "timeout", detail: "No reply within 4 seconds" };
        try { worker.terminate(); } catch (_) {}
        try { URL.revokeObjectURL(url); } catch (_) {}
        renderAll();
        if (typeof done === "function") done();
      }, 4000);
    } catch (e) {
      state.worker = { status: "error", detail: e.name + ": " + e.message };
      try { URL.revokeObjectURL(url); } catch (_) {}
      renderAll();
      if (typeof done === "function") done();
    }
  }

  function runMemoryTest() {
    var sizes = [1, 4, 8, 16];
    var results = [];
    for (var i = 0; i < sizes.length; i++) {
      var mib = sizes[i];
      try {
        var b = new ArrayBuffer(mib * 1024 * 1024);
        var a = new Uint8Array(b);
        a[0] = 0x11;
        a[a.length - 1] = 0x22;
        results.push({ mib: mib, ok: a[0] === 0x11 && a[a.length - 1] === 0x22 });
        b = null;
        a = null;
      } catch (e) {
        results.push({ mib: mib, ok: false, error: e.name + ": " + e.message });
        break;
      }
    }
    state.memory = { status: "complete", buffers: results };
    renderAll();
  }

  function compactFingerprint() {
    var map = {};
    var timer = "?";
    for (var i = 0; i < state.tests.length; i++) {
      map[state.tests[i].name] = state.tests[i].ok ? 1 : 0;
      if (state.tests[i].name === "performance.now resolution") timer = state.tests[i].detail || "?";
    }
    var memOk = 0;
    if (state.memory && state.memory.status === "complete" && state.memory.buffers && state.memory.buffers.length) {
      memOk = 1;
      for (var j = 0; j < state.memory.buffers.length; j++) {
        if (!state.memory.buffers[j].ok) memOk = 0;
      }
    }
    return [
      "FW=" + (state.meta.firmware || "?"),
      "UA-WK=" + (state.meta.userAgentWebKitLabel || "?"),
      "W=" + (map.Worker || 0),
      "BLOB=" + (map["Blob URL"] || 0),
      "SAB=" + (map.SharedArrayBuffer || 0),
      "ATOM=" + (map["Atomics global"] || 0),
      "ATOMUSE=" + (map["Atomics usable"] || 0),
      "WASM=" + (map.WebAssembly || 0),
      "BIGINT=" + (map.BigInt || 0),
      "EVAL=" + (map.eval || 0),
      "FUNC=" + (map["Function constructor"] || 0),
      "WEBGL=" + (map.WebGL || 0),
      "WKR=" + (state.worker && state.worker.status === "ok" ? 1 : 0),
      "XFER=" + (state.worker && state.worker.transferableDetachedOnMainThread ? 1 : 0),
      "MEM=" + memOk,
      "TRES=" + timer
    ].join("|");
  }

  function runAllTests() {
    state.worker = { status: "not-run" };
    state.memory = { status: "not-run" };
    setText("runStatus", "Step 1/3: runtime fingerprint...");
    runDiagnostics();
    setText("runStatus", "Step 2/3: Worker + transferable ArrayBuffer...");
    runWorkerTest(function () {
      setText("runStatus", "Step 3/3: bounded 1/4/8/16 MiB allocation...");
      runMemoryTest();
      state.meta.completedAll03 = true;
      state.meta.completedAt = new Date().toISOString();
      setText("runStatus", "Complete. Press Send Report and the result will be relayed without any login.");
      renderAll();
      updateSendButton();
      try { document.getElementById("compact").scrollIntoView(true); } catch (_) {}
    });
  }

  function getRelayTopic() {
    var h = location.hash || "";
    var m = h.match(/(?:^#|[&#])relay=([A-Za-z0-9_-]{8,120})/);
    return m ? m[1] : "";
  }

  function makeRunId() {
    var suffix = "";
    try {
      var a = new Uint32Array(2);
      crypto.getRandomValues(a);
      suffix = a[0].toString(36) + a[1].toString(36);
    } catch (_) {
      suffix = Math.floor(Math.random() * 0x7fffffff).toString(36);
    }
    return Date.now().toString(36) + "-" + suffix;
  }

  function buildRelayMessages() {
    if (!state.meta.relayRunId) state.meta.relayRunId = makeRunId();
    var id = state.meta.relayRunId;
    var failed = [];
    var all = [];
    for (var i = 0; i < state.tests.length; i++) {
      var t = state.tests[i];
      all.push(t.name + "=" + (t.ok ? "1" : "0"));
      if (!t.ok) failed.push(t.name + ": " + t.detail);
    }
    return [
      "run=" + id + "\npart=1/3\n" + compactFingerprint() + "\nworker=" + JSON.stringify(state.worker),
      "run=" + id + "\npart=2/3\nmemory=" + JSON.stringify(state.memory) + "\nfailed=" + (failed.length ? failed.join(" | ") : "none"),
      "run=" + id + "\npart=3/3\nall=" + all.join("|")
    ];
  }

  function publishRelayMessage(topic, title, message, done) {
    var url = "https://ntfy.sh/" + encodeURIComponent(topic) + "/publish?title=" + encodeURIComponent(title) + "&message=" + encodeURIComponent(message) + "&tags=computer";
    var finished = false;
    function finish(ok) {
      if (finished) return;
      finished = true;
      done(ok);
    }
    try {
      if (typeof fetch === "function") {
        fetch(url, { method: "GET" }).then(function (r) {
          finish(!!r);
        }).catch(function () {
          try {
            var img = new Image();
            img.onload = function () { finish(true); };
            img.onerror = function () { finish(true); };
            img.src = url;
            setTimeout(function () { finish(true); }, 1200);
          } catch (_) { finish(false); }
        });
        setTimeout(function () {
          if (!finished) {
            try {
              var img2 = new Image();
              img2.onload = function () { finish(true); };
              img2.onerror = function () { finish(true); };
              img2.src = url;
            } catch (_) {}
          }
        }, 2500);
        return;
      }
      var img3 = new Image();
      img3.onload = function () { finish(true); };
      img3.onerror = function () { finish(true); };
      img3.src = url;
      setTimeout(function () { finish(true); }, 1200);
    } catch (e) {
      finish(false);
    }
  }

  function sendRelayReport() {
    var topic = getRelayTopic();
    if (!(state.meta && state.meta.completedAll03)) return;
    if (!topic) {
      setText("runStatus", "Relay key missing. Open the private relay link I gave you, then run the test again.");
      return;
    }
    var btn = document.getElementById("sendReport");
    if (btn) btn.disabled = true;
    var messages = buildRelayMessages();
    var pos = 0;
    var failed = false;
    function next() {
      if (pos >= messages.length) {
        state.meta.relaySentAt = new Date().toISOString();
        state.meta.relayTopicPresent = true;
        renderAll();
        setText("runStatus", failed ? "Report attempted; one relay request may have failed. Press Send Report once more if needed." : "Report sent. Just tell me: gönderdim.");
        updateSendButton();
        return;
      }
      setText("runStatus", "Sending report " + (pos + 1) + "/3...");
      var idx = pos;
      publishRelayMessage(topic, "PS5 13.60 " + state.meta.relayRunId + " " + (idx + 1) + "/3", messages[idx], function (ok) {
        if (!ok) failed = true;
        pos++;
        setTimeout(next, 250);
      });
    }
    next();
  }

  function updateSendButton() {
    var btn = document.getElementById("sendReport");
    if (!btn) return;
    var ready = !!(state.meta && state.meta.completedAll03);
    var relay = !!getRelayTopic();
    btn.disabled = !(ready && relay);
    if (!relay) btn.textContent = "Send Report (private relay link required)";
    else if (!ready) btn.textContent = "Send Report (run test first)";
    else btn.textContent = "Send Report";
  }
  function renderTests() {
    var root = document.getElementById("features");
    root.innerHTML = "";
    var groups = [];
    var byGroup = {};
    for (var i = 0; i < state.tests.length; i++) {
      var g = state.tests[i].group;
      if (!byGroup[g]) {
        byGroup[g] = [];
        groups.push(g);
      }
      byGroup[g].push(state.tests[i]);
    }

    for (var gi = 0; gi < groups.length; gi++) {
      var groupName = groups[gi];
      var section = document.createElement("div");
      section.className = "feature-group";
      var title = document.createElement("h3");
      title.textContent = groupName;
      section.appendChild(title);

      var grid = document.createElement("div");
      grid.className = "feature-list";
      var rows = byGroup[groupName];
      for (var ri = 0; ri < rows.length; ri++) {
        var row = rows[ri];
        var card = document.createElement("div");
        card.className = "feature " + (row.ok ? "ok" : "no");
        var label = document.createElement("span");
        label.textContent = row.name;
        var strong = document.createElement("strong");
        strong.textContent = row.ok ? "available / passed" : "unavailable / failed";
        var small = document.createElement("small");
        small.textContent = row.detail;
        card.appendChild(label);
        card.appendChild(strong);
        card.appendChild(small);
        grid.appendChild(card);
      }
      section.appendChild(grid);
      root.appendChild(section);
    }
  }

  function renderAll() {
    setText("device", state.meta.device || (isPS5(ua) ? "PlayStation 5 detected" : "Browser detected"));
    setText("firmware", state.meta.firmware === "13.60" ? "13.60 (target detected)" : (state.meta.firmware || parseFirmware(ua) || "unknown"));
    setText("webkit", state.meta.userAgentWebKitLabel || parseWebKitLabel(ua) || "unknown");

    if (state.tests.length) {
      renderTests();
      var passed = 0;
      for (var i = 0; i < state.tests.length; i++) if (state.tests[i].ok) passed++;
      setText("summary", passed + " / " + state.tests.length + " checks passed. Failures are useful capability data, not necessarily problems.");
      setText("compact", compactFingerprint());
    }

    setText("workerReport", JSON.stringify(state.worker, null, 2));
    setText("memoryReport", JSON.stringify(state.memory, null, 2));
    setText("report", JSON.stringify(state, null, 2));
    updateSendButton();

    try {
      localStorage.setItem("ps5-1360-last-report-v32", JSON.stringify(state));
    } catch (_) {}
  }

  document.getElementById("runAll").addEventListener("click", runAllTests);
  document.getElementById("sendReport").addEventListener("click", sendRelayReport);

  collectMeta();
  renderAll();

  try {
    var cached = localStorage.getItem("ps5-1360-last-report-v32");
    if (cached) {
      var parsed = JSON.parse(cached);
      if (parsed && parsed.meta && parsed.tests) {
        state = parsed;
        renderAll();
      }
    }
  } catch (_) {}
}());