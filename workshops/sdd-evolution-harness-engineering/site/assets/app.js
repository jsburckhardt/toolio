// Add "copy" buttons to every <pre> block and highlight active nav link.
(function () {
  document.querySelectorAll("pre").forEach(function (pre) {
    var wrap = document.createElement("div");
    wrap.className = "code-wrap";
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    var btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.type = "button";
    btn.textContent = "copy";
    btn.addEventListener("click", function () {
      var text = pre.innerText;
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = "copied";
        btn.classList.add("copied");
        setTimeout(function () {
          btn.textContent = "copy";
          btn.classList.remove("copied");
        }, 1500);
      });
    });
    wrap.appendChild(btn);
  });

  // Highlight sidebar nav by current path
  var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".sidebar-nav li a").forEach(function (a) {
    var target = (a.getAttribute("href") || "").split("/").pop().toLowerCase();
    if (target === here) a.parentElement.classList.add("active");
  });
})();
