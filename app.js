(function () {
  "use strict";
  var ua = navigator.userAgent || "";

  function parseFirmware(text) {
    var patterns = [
      /PlayStation 5\/(\d+\.\d+)/i,
      /RNPS\/(\d+\.\d+)/i,
      /PlayStation 5\s+(\d+\.\d+)/i
    ];
    for (var i = 0; i < patterns.length; i++) {
      var match = text.match(patterns[i]);
      if (match) return match[1];
    }
    return null;
  }

  function parseWebKit(text) {
    var match = text.match(/AppleWebKit\/([\d.]+)/i);
    return match ? match[1] : null;
  }

  function isPS5(text) {
    return /PlayStation 5|RNPS/i.test(text);
  }

  function setText(id, value) {
    var node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  function collect() {
    var items = [
      ["WebAssembly", typeof WebAssembly !== "undefined"],
      ["BigInt", typeof BigInt !== "undefined"],
      ["Workers", typeof Worker !== "undefined"],
      ["SharedArrayBuffer", typeof SharedArrayBuffer !== "undefined"],
      ["Atomics", typeof Atomics !== "undefined"],
      ["IndexedDB", typeof indexedDB !== "undefined"],
      ["Service Worker", "serviceWorker" in navigator],
      ["Performance API", typeof performance !== "undefined" && typeof performance.now === "function"],
      ["TextEncoder", typeof TextEncoder !== "undefined"],
      ["Crypto API", !!(window.crypto && window.crypto.getRandomValues)]
    ];
    return {
      timestamp: new Date().toISOString(),
      device: isPS5(ua) ? "PlayStation 5" : "Other / unknown",
      firmware: parseFirmware(ua) || "unknown",
      webkit: parseWebKit(ua) || "unknown",
      userAgent: ua,
      language: navigator.language || "unknown",
      online: typeof navigator.onLine === "boolean" ? navigator.onLine : null,
      features: items
    };
  }

  function render(result) {
    setText("device", result.device);
    setText("firmware", result.firmware === "13.60" ? "13.60 (target detected)" : result.firmware);
    setText("webkit", result.webkit);

    var list = document.getElementById("features");
    list.innerHTML = "";
    for (var i = 0; i < result.features.length; i++) {
      var row = result.features[i];
      var div = document.createElement("div");
      div.className = "feature";
      var label = document.createElement("span");
      label.textContent = row[0];
      var strong = document.createElement("strong");
      strong.textContent = row[1] ? "available" : "not available";
      div.appendChild(label);
      div.appendChild(strong);
      list.appendChild(div);
    }

    var pretty = JSON.stringify(result, null, 2);
    setText("report", pretty);
    try { localStorage.setItem("ps5-1360-last-report", pretty); } catch (_) {}
  }

  document.getElementById("run").addEventListener("click", function () {
    render(collect());
  });

  document.getElementById("copy").addEventListener("click", function () {
    document.getElementById("report").scrollIntoView({block:"start"});
  });

  setText("device", isPS5(ua) ? "PlayStation 5 detected" : "Browser detected");
  setText("firmware", parseFirmware(ua) || "unknown");
  setText("webkit", parseWebKit(ua) || "unknown");

  try {
    var cached = localStorage.getItem("ps5-1360-last-report");
    if (cached) setText("report", cached);
  } catch (_) {}
}());