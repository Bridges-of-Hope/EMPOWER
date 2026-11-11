(function () {
  var ROUND = 5;
  var LETTERS = ["A", "B", "C", "D"];
  var CHECK = '<svg class="mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5 9.5 18 20 6.5"/></svg>';
  var CROSS = '<svg class="mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  var $ = function (id) { return document.getElementById(id); };
  var qView = $("q-view"), endView = $("end-view");
  var answersEl = $("answers"), feedback = $("feedback"), nextBtn = $("next-btn");

  var round, index, score, answered;

  function start() {
    var bank = (window.QUESTIONS || []).filter(function (q) { return q && q.question && q.answers && q.answers.length >= 2; });
    round = EMPOWER.shuffle(bank).slice(0, Math.min(ROUND, bank.length));
    index = 0;
    score = 0;
    endView.hidden = true;
    qView.hidden = false;
    show();
  }

  function renderProgress() {
    $("progress-text").textContent = index < round.length ? "Question " + (index + 1) + " of " + round.length : "Final score";
    var dots = "";
    for (var i = 0; i < round.length; i++) {
      dots += '<span class="' + (i < index ? "done" : i === index ? "now" : "") + '"></span>';
    }
    $("dots").innerHTML = dots;
  }

  function show() {
    var q = round[index];
    answered = false;
    renderProgress();
    $("q-kicker").textContent = "Question " + (index + 1);
    $("q-text").textContent = q.question;

    var correct = q.answers[0];
    var isTF = q.answers.length === 2;
    var options = isTF
      ? q.answers.slice().sort(function (a, b) { return a === "True" ? -1 : b === "True" ? 1 : 0; })
      : EMPOWER.shuffle(q.answers);

    answersEl.className = "answers" + (isTF ? " tf" : "");
    answersEl.innerHTML = "";
    options.forEach(function (text, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "answer";
      b.dataset.correct = text === correct ? "1" : "0";
      b.innerHTML = (isTF ? "" : '<span class="letter">' + LETTERS[i] + "</span>") + "<span></span>" + (text === correct ? CHECK : CROSS);
      b.children[isTF ? 0 : 1].textContent = text;
      b.addEventListener("click", function () { pick(b, q); });
      answersEl.appendChild(b);
    });

    feedback.classList.remove("show");
    nextBtn.textContent = index === round.length - 1 ? "See my score" : "Next";
  }

  function pick(btn, q) {
    if (answered) return;
    answered = true;
    var right = btn.dataset.correct === "1";
    if (right) score++;

    Array.prototype.forEach.call(answersEl.children, function (b) {
      b.disabled = true;
      if (b.dataset.correct === "1") b.classList.add("is-correct");
      else if (b === btn) b.classList.add("is-wrong");
      else b.classList.add("is-dim");
    });

    var verdict = $("verdict");
    verdict.textContent = right ? "Correct!" : "Not quite. The right answer is highlighted.";
    verdict.className = "verdict " + (right ? "good" : "bad");
    $("fact").textContent = q.fact || "";
    feedback.classList.add("show");
  }

  function next() {
    if (!answered) return;
    index++;
    if (index < round.length) show();
    else finish();
  }

  function finish() {
    renderProgress();
    qView.hidden = true;
    endView.hidden = false;
    $("score-big").textContent = score + "/" + round.length;

    var title, msg;
    if (score === round.length) { title = "Perfect round!"; msg = "You really know your giving. Thank you for caring about your community."; }
    else if (score >= 3) { title = "Great job!"; msg = "You know a lot about giving. Every small action builds a brighter tomorrow."; }
    else if (score >= 1) { title = "Nice try!"; msg = "Now you know a little more than before. That is a small action too."; }
    else { title = "Thanks for playing!"; msg = "Every round is a chance to learn. Give it another go!"; }
    $("end-title").textContent = title;
    $("end-msg").textContent = msg;
  }

  nextBtn.addEventListener("click", next);
  $("again-btn").addEventListener("click", start);
  start();
})();
