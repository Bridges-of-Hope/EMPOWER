(function () {
  var COINS = 10;
  var COIN_VALUE = 10;

  var ICONS = {
    moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/><path d="M17 3.5v3M15.5 5h3"/>',
    book: '<path d="M4 19.5V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h14"/><path d="M8 7h8M8 10.5h6"/>',
    heart: '<path d="M12 20.5s-7.5-4.6-9.3-9.4A5 5 0 0 1 12 7.2a5 5 0 0 1 9.3 3.9c-1.8 4.8-9.3 9.4-9.3 9.4Z"/>',
    leaf: '<path d="M5 20c-.5-9 5-15.5 15-16 .5 10-5.5 15.5-15 16Z"/><path d="M5 20 14 11"/>',
    aid: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V4.5h6V7M12 10.5v6M9 13.5h6"/>'
  };

  var CAUSES = [
    { id: "iftar", name: "Ramadan Iftar Meals", desc: "Warm meals for families breaking their fast.", icon: "moon", color: "#A86B00",
      line: "iftar meals for families during Ramadan" },
    { id: "school", name: "School Supplies", desc: "Books, bags, and pencils for students.", icon: "book", color: "#B8261F",
      line: "school supplies for a student" },
    { id: "health", name: "Health and Cancer Awareness", desc: "Checkups and early awareness for families.", icon: "heart", color: "#B5446E",
      line: "health checkups and cancer awareness in the community" },
    { id: "green", name: "Green Campus", desc: "Trees, recycling, and cleaner shared spaces.", icon: "leaf", color: "#4F7A3A",
      line: "trees and recycling for a greener campus" },
    { id: "relief", name: "Emergency Relief", desc: "Fast help for families facing a crisis.", icon: "aid", color: "#5E130F",
      line: "emergency relief for families in crisis" }
  ];

  var STYLES = {
    iftar: { name: "The Nourisher", desc: "You believe a shared meal is where community begins." },
    school: { name: "The Educator", desc: "You believe learning opens doors, one notebook at a time." },
    health: { name: "The Healer", desc: "You believe caring for health means caring for the whole family." },
    green: { name: "The Guardian", desc: "You protect the planet as a gift to the next generation." },
    relief: { name: "The First Responder", desc: "You show up first when people need help the most." },
    bridge: { name: "The Bridge Builder", desc: "You spread your giving across many causes and connect them all." }
  };

  var $ = function (id) { return document.getElementById(id); };
  var tray = $("tray"), causesEl = $("causes"), impactBtn = $("impact-btn");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var counts, landing = new Set();
  var traySlots = [], cards = [];

  function coinMarkup() { return '<span class="coin">10</span>'; }

  function build() {
    for (var i = 0; i < COINS; i++) {
      var s = document.createElement("span");
      s.className = "slot";
      s.innerHTML = coinMarkup();
      tray.appendChild(s);
      traySlots.push(s);
    }

    CAUSES.forEach(function (c, ci) {
      var card = document.createElement("article");
      card.className = "cause";
      card.style.setProperty("--c", c.color);
      card.innerHTML =
        '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[c.icon] + "</svg>" +
        "<h3></h3><p></p>" +
        '<div class="pile"></div>' +
        '<div class="amount"><b>0</b> QAR</div>' +
        '<div class="stepper">' +
          '<button class="step minus" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg></button>' +
          '<button class="step plus" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button>' +
        "</div>";
      card.querySelector("h3").textContent = c.name;
      card.querySelector("p").textContent = c.desc;
      var minus = card.querySelector(".minus"), plus = card.querySelector(".plus");
      minus.setAttribute("aria-label", "Take back 10 QAR from " + c.name);
      plus.setAttribute("aria-label", "Give 10 QAR to " + c.name);

      var pile = card.querySelector(".pile"), slots = [];
      for (var k = 0; k < COINS; k++) {
        var ps = document.createElement("span");
        ps.className = "slot";
        ps.innerHTML = coinMarkup();
        pile.appendChild(ps);
        slots.push(ps);
      }
      plus.addEventListener("click", function () { give(ci); });
      minus.addEventListener("click", function () { takeBack(ci); });
      causesEl.appendChild(card);
      cards.push({ el: card, slots: slots, plus: plus, minus: minus, amount: card.querySelector(".amount b") });
    });
  }

  function left() { return COINS - counts.reduce(function (a, b) { return a + b; }, 0); }

  function render() {
    var l = left();
    $("left").textContent = l * COIN_VALUE;
    traySlots.forEach(function (s, i) { s.classList.toggle("filled", i < l && !landing.has(s)); });
    cards.forEach(function (card, ci) {
      var n = counts[ci];
      card.slots.forEach(function (s, i) { s.classList.toggle("filled", i < n && !landing.has(s)); });
      card.amount.textContent = n * COIN_VALUE;
      card.el.classList.toggle("has", n > 0);
      card.plus.disabled = l === 0;
      card.minus.disabled = n === 0;
    });
    impactBtn.disabled = l !== 0;
  }

  function fly(from, to) {
    if (reduceMotion) { render(); return; }
    var a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    var coin = document.createElement("span");
    coin.className = "coin flying";
    coin.textContent = "10";
    coin.style.left = a.left + "px";
    coin.style.top = a.top + "px";
    coin.style.width = a.width + "px";
    coin.style.height = a.height + "px";
    coin.style.fontSize = a.width * 0.4 + "px";
    coin.style.transformOrigin = "0 0";
    document.body.appendChild(coin);
    landing.add(to);
    render();

    var done = false;
    function land() {
      if (done) return;
      done = true;
      coin.remove();
      landing.delete(to);
      render();
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var scale = b.width / a.width;
        coin.style.transform = "translate(" + (b.left - a.left) + "px," + (b.top - a.top) + "px) scale(" + scale + ")";
      });
    });
    coin.addEventListener("transitionend", land);
    setTimeout(land, 800);
  }

  function give(ci) {
    var l = left();
    if (l === 0) return;
    var from = traySlots[l - 1];
    counts[ci]++;
    fly(from, cards[ci].slots[counts[ci] - 1]);
  }

  function takeBack(ci) {
    if (counts[ci] === 0) return;
    var from = cards[ci].slots[counts[ci] - 1];
    counts[ci]--;
    fly(from, traySlots[left() - 1]);
  }

  function styleFor() {
    var max = Math.max.apply(null, counts);
    if (max * COIN_VALUE <= 30) return STYLES.bridge;
    return STYLES[CAUSES[counts.indexOf(max)].id];
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }

  function showImpact() {
    if (left() !== 0) return;
    var donut = $("donut"), legend = $("legend"), illus = $("illus");
    donut.innerHTML = "";
    legend.innerHTML = "";
    illus.innerHTML = "";

    var R = 78, C = 2 * Math.PI * R, offset = 0;
    var used = counts.filter(function (n) { return n > 0; }).length;
    var gap = used > 1 ? 3 : 0;
    donut.appendChild(svgEl("circle", { cx: 100, cy: 100, r: R, fill: "none", stroke: "#EADBC8", "stroke-width": 34 }));
    CAUSES.forEach(function (c, ci) {
      var n = counts[ci];
      if (n > 0) {
        var len = (n / COINS) * C;
        donut.appendChild(svgEl("circle", {
          cx: 100, cy: 100, r: R, fill: "none", stroke: c.color, "stroke-width": 34,
          "stroke-dasharray": Math.max(len - gap, 0.5) + " " + C,
          "stroke-dashoffset": -offset,
          transform: "rotate(-90 100 100)"
        }));
        offset += len;

        var li = document.createElement("li");
        li.innerHTML = '<span class="sw"></span><span></span>';
        li.firstChild.style.background = c.color;
        li.lastChild.textContent = "Your " + n * COIN_VALUE + " QAR helps toward " + c.line + ".";
        illus.appendChild(li);
      }
      var lg = document.createElement("li");
      if (n === 0) lg.className = "zero";
      lg.innerHTML = '<span class="sw"></span><span class="nm"></span><b></b>';
      lg.querySelector(".sw").style.background = c.color;
      lg.querySelector(".nm").textContent = c.name;
      lg.querySelector("b").textContent = n * COIN_VALUE;
      legend.appendChild(lg);
    });
    var t1 = svgEl("text", { x: 100, y: 102, "text-anchor": "middle", class: "center-num" });
    t1.textContent = "100";
    var t2 = svgEl("text", { x: 100, y: 126, "text-anchor": "middle", class: "center-sub" });
    t2.textContent = "QAR GIVEN";
    donut.appendChild(t1);
    donut.appendChild(t2);

    var st = styleFor();
    $("style-name").textContent = st.name;
    $("style-desc").textContent = st.desc;

    $("play").hidden = true;
    $("impact").hidden = false;
  }

  function reset() {
    counts = CAUSES.map(function () { return 0; });
    landing.clear();
    document.querySelectorAll(".coin.flying").forEach(function (el) { el.remove(); });
    $("impact").hidden = true;
    $("play").hidden = false;
    render();
  }

  build();
  impactBtn.addEventListener("click", showImpact);
  $("again-btn").addEventListener("click", reset);
  reset();
})();
