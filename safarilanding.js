(function () {
  var ua = navigator.userAgent;

  // Safari = has "Safari" in the UA but none of the Chromium/Firefox/Edge/Opera/Android markers.
  var isSafari = /safari/i.test(ua) && !/chrome|chromium|crios|fxios|edg|opr|android/i.test(ua);
  if (!isSafari) return;

  try { if (sessionStorage.getItem("safariNoticeDismissed")) return; } catch (e) {}

  var isIOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);

  var style = document.createElement("style");
  style.textContent =
    "#safari-notice{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));" +
    "z-index:9999;max-width:520px;margin:0 auto;padding:12px 14px;border:1px solid var(--line,rgba(128,128,128,.55));" +
    "border-radius:14px;background:var(--bg,#0b0b0c);color:var(--fg,#f4f4f4);" +
    "font:10px/1.8 \"Michroma\",ui-monospace,monospace;box-shadow:0 4px 24px rgba(0,0,0,.35)}" +
    "#safari-notice p{margin:0 0 8px;color:inherit}" +
    "#safari-notice .row{display:flex;gap:8px;flex-wrap:wrap}" +
    "#safari-notice a,#safari-notice button{font:inherit;color:var(--fg,#f4f4f4);background:transparent;" +
    "border:1px solid var(--line,rgba(128,128,128,.55));border-radius:99px;padding:5px 12px;cursor:pointer;" +
    "text-decoration:none;display:inline-block}" +
    "#safari-notice a:focus-visible,#safari-notice button:focus-visible{outline:2px solid var(--accent,#ffe135);outline-offset:2px}";
  document.head.appendChild(style);

  var box = document.createElement("div");
  box.id = "safari-notice";
  box.setAttribute("role", "region");
  box.setAttribute("aria-label", "Browser notice");

  var msg = document.createElement("p");
  msg.textContent = "This site is best viewed in Google Chrome. Some visuals may not display correctly in Safari.";
  box.appendChild(msg);

  var row = document.createElement("div");
  row.className = "row";

  // On iOS, the googlechromes:// scheme opens this page in Chrome (if installed).
  if (isIOS) {
    var open = document.createElement("a");
    open.textContent = "Open in Chrome";
    open.href = "googlechromes://" + location.href.replace(/^https?:\/\//, "");
    row.appendChild(open);
  }

  // Desktop Safari can't launch Chrome from a web page, so offer a copyable link instead.
  var copy = document.createElement("button");
  copy.type = "button";
  copy.textContent = "Copy link";
  copy.addEventListener("click", function () {
    var done = function () { copy.textContent = "Copied"; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(location.href).then(done, function () {});
    }
  });
  row.appendChild(copy);

  var close = document.createElement("button");
  close.type = "button";
  close.textContent = "Dismiss";
  close.addEventListener("click", function () {
    box.remove();
    try { sessionStorage.setItem("safariNoticeDismissed", "1"); } catch (e) {}
  });
  row.appendChild(close);

  box.appendChild(row);
  document.body.appendChild(box);
})();