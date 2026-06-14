window.COMMON_QUESTION_BANK = window.COMMON_QUESTION_BANK || {};
window.COMMON_QUESTION_BANK[2025] = window.QUESTIONS;

const examBanks = {
  common: window.COMMON_QUESTION_BANK,
  specialist1: window.SPECIALIST1_QUESTION_BANK || {}
};

const examDefinitions = {
  common: { label: "共通試験", sourceLabel: "共通試験" },
  specialist1: { label: "専門試験I", sourceLabel: "専門試験I（鉄道電気）" }
};
const sourceMapping = window.SOURCE_MAPPING || {};

function sourceStatus(exam, year, number) {
  return sourceMapping[`${exam}-${year}-${number}`] || { status: "source-needed", sources: [] };
}

let selectedExam = localStorage.getItem("railway-exam-type") || "common";
if (!examBanks[selectedExam] || !Object.keys(examBanks[selectedExam]).length) selectedExam = "common";
let selectedMode = localStorage.getItem("railway-study-mode") || "practice";
let selectedYear = 2025;
let questions = [];
let current = 0;
let totalCorrect = 0;
let answered = false;
let examAnswers = {};
let selectedView = "study";
let analysisExam = "common";
let catalogExam = "common";

const form = document.querySelector("#question-form");
const resultPanel = document.querySelector("#result-panel");
const examSummary = document.querySelector("#exam-summary");

function reviewKey(exam = selectedExam, year = selectedYear, number = questions[current]?.number) {
  return `${exam}:${year}:${number}`;
}

function reviewFlags() {
  return JSON.parse(localStorage.getItem("railway-review-flags") || "{}");
}

function isReviewFlagged(exam, year, number) {
  return Boolean(reviewFlags()[reviewKey(exam, year, number)]);
}

function toggleReviewFlag() {
  const flags = reviewFlags();
  const key = reviewKey();
  if (flags[key]) delete flags[key]; else flags[key] = true;
  localStorage.setItem("railway-review-flags", JSON.stringify(flags));
  renderReviewToggle();
}

function renderReviewToggle() {
  const flagged = isReviewFlagged(selectedExam, selectedYear, questions[current].number);
  const button = document.querySelector("#review-toggle");
  button.classList.toggle("active", flagged);
  button.setAttribute("aria-pressed", String(flagged));
  button.textContent = flagged ? "復習に登録済み" : "あとで復習";
}

const categoryColors = ["#123c69", "#1f6aa5", "#3b8f8c", "#d28b20", "#7b6aa8", "#b8584c", "#6f8291", "#3f7358"];
const categoryRules = {
  common: [
    ["法令・制度", /鉄道事業法|施行規則|技術上の基準|省令|法令|法律|規則|建築基準|労働安全|環境基本/],
    ["数学・統計", /統計|確率|平均|標準偏差|分散|相関|回帰|行列|微分|積分|方程式|関数/],
    ["力学・振動", /振動|固有振動|共振|力学|モーメント|加速度|速度|運動|荷重|ばね|質点/],
    ["電気・回路", /電気回路|電流|電圧|抵抗|コンデンサ|コイル|インピーダンス|アドミタンス|交流|直流|電力/],
    ["土木・材料", /コンクリート|鋼材|材料|応力|ひずみ|疲労|地震|地盤|土圧|測量|構造物|橋りょう|トンネル/],
    ["情報・通信", /情報|通信|ネットワーク|セキュリティ|暗号|コンピュータ|データ|無線|プロトコル/],
    ["鉄道基礎", /軌道|車両|信号|電車線|き電|列車|運転|駅|停車場|鉄道/],
    ["品質・管理", /品質|管理|工程|リスク|信頼性|保全|安全率|プロジェクト/]
  ],
  specialist1: [
    ["電車線・集電", /電車線|架線|トロリ|パンタグラフ|集電|ちょう架|支持物|がいし|き電線/],
    ["き電・変電", /き電|変電|整流器|遮断器|変圧器|電力制御|回生|饋電/],
    ["信号・保安", /鉄道信号|信号機|信号現示|閉そく|連動|転てつ|ATS|ATC|軌道回路|踏切|列車検知/],
    ["通信・情報", /通信|情報|ネットワーク|無線|電波|暗号|セキュリティ|プロトコル|IP|データ|EMC|漏話/],
    ["電気回路・電力", /回路|電流|電圧|抵抗|コンデンサ|コイル|インピーダンス|アドミタンス|交流|直流|電力|デシベル/],
    ["法令・規格", /鉄道事業法|技術上の基準|省令|解釈基準|JIS|JEC|JESC|JEAG|電波法|規則/],
    ["設備・防災", /防火|火災|接地|雷|保護|設備|照明|配電|感知器/],
    ["車両・その他", /車両|主電動機|鉄道車両|運転|保守|故障|アベイラビリティ/]
  ]
};

function classifyQuestion(exam, question) {
  const text = `${question.prompt} ${question.statements.map(statement => statement.text).join(" ")}`;
  return categoryRules[exam].find(([, pattern]) => pattern.test(text))?.[0] || (exam === "common" ? "鉄道基礎" : "車両・その他");
}

function analysisData(exam) {
  const years = Object.keys(examBanks[exam]).map(Number).sort();
  const categories = categoryRules[exam].map(([name]) => name);
  const yearly = years.map(year => {
    const counts = Object.fromEntries(categories.map(category => [category, 0]));
    examBanks[exam][year].forEach(question => { counts[classifyQuestion(exam, question)] += 1; });
    return { year, counts };
  });
  const totals = Object.fromEntries(categories.map(category => [category, yearly.reduce((sum, row) => sum + row.counts[category], 0)]));
  const activeCategories = categories.filter(category => totals[category] > 0);
  return { years, categories: activeCategories, yearly, totals, total: yearly.reduce((sum, row) => sum + Object.values(row.counts).reduce((a, b) => a + b, 0), 0) };
}

function renderAnalysis() {
  const data = analysisData(analysisExam);
  const ranked = data.categories.map((category, index) => ({ category, count: data.totals[category], color: categoryColors[index] })).sort((a, b) => b.count - a.count);
  const top = ranked[0];
  document.querySelector("#analysis-years").textContent = `${data.years.length}年`;
  document.querySelector("#analysis-total").textContent = `${data.total}問`;
  document.querySelector("#analysis-top-category").textContent = top.category;
  document.querySelector("#analysis-top-rate").textContent = `${top.count}問・${Math.round(top.count / data.total * 100)}%`;

  let cursor = 0;
  const gradients = ranked.map(item => {
    const start = cursor;
    cursor += item.count / data.total * 100;
    return `${item.color} ${start}% ${cursor}%`;
  });
  const donut = document.querySelector("#distribution-donut");
  donut.style.background = `conic-gradient(${gradients.join(",")})`;
  donut.innerHTML = `<div><strong>${data.total}</strong><span>QUESTIONS</span></div>`;
  document.querySelector("#distribution-legend").innerHTML = ranked.map(item => `<div><i style="background:${item.color}"></i><span>${item.category}</span><strong>${item.count}</strong><small>${Math.round(item.count / data.total * 100)}%</small></div>`).join("");
  document.querySelector("#category-ranking").innerHTML = ranked.map((item, index) => `<div class="ranking-row"><span class="rank-number">${String(index + 1).padStart(2, "0")}</span><div><strong>${item.category}</strong><span><i style="width:${item.count / top.count * 100}%;background:${item.color}"></i></span></div><b>${item.count}<small>問</small></b></div>`).join("");
  document.querySelector("#yearly-distribution").innerHTML = data.yearly.map(row => `<div class="year-row"><strong>${row.year}</strong><div class="stacked-bar">${data.categories.map((category, index) => `<span style="width:${row.counts[category] / 30 * 100}%;background:${categoryColors[index]}" title="${category} ${row.counts[category]}問"></span>`).join("")}</div><small>${data.categories.map((category, index) => row.counts[category] ? `<i style="background:${categoryColors[index]}"></i>${category} ${row.counts[category]}` : "").filter(Boolean).join("　")}</small></div>`).join("");
  document.querySelectorAll(".analysis-subject").forEach(button => button.classList.toggle("active", button.dataset.analysisExam === analysisExam));
}

function selectView(view) {
  selectedView = view;
  const isAnalysis = view === "analysis";
  const isCatalog = view === "catalog";
  document.querySelectorAll(".study-view").forEach(element => element.hidden = isAnalysis || isCatalog);
  document.querySelector("#analysis-view").hidden = !isAnalysis;
  document.querySelector("#catalog-view").hidden = !isCatalog;
  document.querySelectorAll(".view-button").forEach(button => button.classList.toggle("active", button.dataset.view === view));
  document.querySelector(".score").hidden = isAnalysis;
  if (isAnalysis) {
    document.querySelector("#current-course").textContent = "2021–2025年度 出題傾向分析";
    document.querySelector("#footer-source").textContent = "分析対象：2021～2025年度 鉄道設計技士試験 共通試験・専門試験I（鉄道電気）";
    renderAnalysis();
  } else if (isCatalog) {
    document.querySelector("#current-course").textContent = "2021–2025年度 問題ライブラリ";
    document.querySelector("#footer-source").textContent = "収録範囲：共通試験・専門試験I（鉄道電気）2021～2025年度";
    document.querySelector(".score").hidden = true;
    renderCatalogFilters();
    renderCatalog();
  } else {
    resetSession();
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function availableYears() {
  return Object.keys(examBanks[selectedExam]).map(Number).sort((a, b) => b - a);
}

function inputKind(question, statement) {
  return statement.inputKind || (question.kind === "choice" ? "choice" : "boolean");
}

function renderExamTabs() {
  document.querySelectorAll(".exam-tab[data-exam]").forEach(button => {
    button.classList.toggle("active", button.dataset.exam === selectedExam);
    button.onclick = () => selectExam(button.dataset.exam);
  });
}

function renderModeButtons() {
  document.querySelectorAll(".mode-button").forEach(button => {
    button.classList.toggle("active", button.dataset.mode === selectedMode);
    button.setAttribute("aria-pressed", String(button.dataset.mode === selectedMode));
    button.onclick = () => selectMode(button.dataset.mode);
  });
  document.querySelector("#mode-description").textContent = selectedMode === "practice"
    ? "1問ごとに答え合わせを行い、正答、根拠、導出、用語を確認します。"
    : "30問を連続して解答し、終了後に正答率と全問の解説をまとめて確認します。";
}

function renderYearButtons() {
  document.querySelector("#year-title").textContent = `${examDefinitions[selectedExam].label} 過去問`;
  document.querySelector("#year-buttons").innerHTML = availableYears().map(year => `
    <button class="year-button ${year === selectedYear ? "active" : ""}" type="button" data-year="${year}">${year}年度</button>
  `).join("");
  document.querySelectorAll(".year-button").forEach(button => {
    button.addEventListener("click", () => selectYear(Number(button.dataset.year)));
  });
}

function selectExam(exam) {
  if (!examBanks[exam] || !Object.keys(examBanks[exam]).length) return;
  selectedExam = exam;
  localStorage.setItem("railway-exam-type", exam);
  selectedYear = availableYears()[0];
  renderExamTabs();
  renderYearButtons();
  resetSession();
}

function selectMode(mode) {
  selectedMode = mode;
  localStorage.setItem("railway-study-mode", mode);
  renderModeButtons();
  resetSession();
}

function selectYear(year) {
  selectedYear = year;
  localStorage.setItem(`railway-${selectedExam}-year`, String(year));
  renderYearButtons();
  resetSession();
}

function resetSession() {
  questions = examBanks[selectedExam][selectedYear];
  current = 0;
  totalCorrect = 0;
  answered = false;
  examAnswers = {};
  document.querySelector("#question-section").hidden = false;
  document.querySelector("#exam-review-list").innerHTML = "";
  resultPanel.hidden = true;
  examSummary.hidden = true;
  updateHeader();
  renderQuestion();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateHeader() {
  const definition = examDefinitions[selectedExam];
  document.querySelector("#current-course").textContent = `${definition.label} ${selectedYear}年度・${selectedMode === "practice" ? "練習モード" : "試験モード"}`;
  document.querySelector("#footer-source").textContent = `出典：公益財団法人鉄道総合技術研究所「${selectedYear}年度 鉄道設計技士試験 ${definition.sourceLabel}」`;
  document.querySelector("#score").textContent = selectedMode === "practice" ? `正解 ${totalCorrect}` : `回答済 ${answeredStatementCount()} / ${totalStatementCount()}`;
}

function totalStatementCount() {
  return questions.reduce((sum, question) => sum + question.statements.length, 0);
}

function answeredStatementCount() {
  return Object.values(examAnswers).reduce((sum, answers) => sum + answers.filter(value => value !== null && value !== undefined && value !== "").length, 0);
}

function renderQuestion() {
  const question = questions[current];
  answered = false;
  resultPanel.hidden = true;
  document.querySelector("#progress").textContent = `${current + 1} / ${questions.length}`;
  document.querySelector("#question-number").textContent = `問${question.number}`;
  document.querySelector("#question-topic").textContent = question.topic;
  document.querySelector("#question-category").textContent = classifyQuestion(selectedExam, question);
  renderReviewToggle();
  document.querySelector("#question-title").textContent = question.prompt;
  document.querySelector("#instruction").textContent = question.kind === "choice"
    ? "各空欄について、最も適切な語句を1つ選んでください。"
    : "各記述について、○または×を選んでください。";
  document.querySelector("#form-message").textContent = "";
  document.querySelector("#question-diagram").innerHTML = question.diagram || "";
  document.querySelector("#question-diagram").hidden = !question.diagram;
  const notice = document.querySelector("#review-notice");
  const source = sourceStatus(selectedExam, selectedYear, question.number);
  notice.hidden = false;
  const articleCandidates = source.sources.flatMap(item => (item.articleCandidates || []).slice(0, 1).map(candidate => `${item.title} ${candidate.article}`));
  notice.textContent = source.status === "article-identified"
    ? `公式問題文・正答を照合済み。条文候補：${articleCandidates.join("、")}。本文との最終照合は確認中です。`
    : (source.status === "candidate-linked"
      ? `公式問題文・正答を照合済み。根拠候補：${source.sources.map(item => item.title).join("、")}。条文・規格本文との詳細照合は確認中です。`
      : "公式問題文・正答を照合済み。根拠資料は未特定のため、詳細解説は確認中です。");

  form.innerHTML = question.statements.map((statement, index) => {
    const kind = inputKind(question, statement);
    const controls = kind === "choice"
      ? statement.options.map(option => `<label><input type="radio" name="answer-${index}" value="${option.key}"><span><b>${option.key}</b>${option.text}</span></label>`).join("")
      : `<label><input type="radio" name="answer-${index}" value="true"><span>○</span></label>
         <label><input type="radio" name="answer-${index}" value="false"><span>×</span></label>`;
    return `<fieldset class="statement">
      <legend class="statement-text">${statement.label || `${index + 1}.`} ${statement.text}</legend>
      <div class="choices ${kind === "choice" ? "word-choices" : ""}">${controls}</div>
    </fieldset>`;
  }).join("");

  document.querySelector("#check-button").hidden = selectedMode !== "practice";
  document.querySelector("#exam-actions").hidden = selectedMode !== "exam";
  document.querySelector("#exam-palette").hidden = selectedMode !== "exam";
  document.querySelector("#previous-button").disabled = current === 0;
  document.querySelector("#exam-next-button").hidden = current === questions.length - 1;
  document.querySelector("#finish-exam-button").hidden = false;
  if (selectedMode === "exam") restoreExamAnswers();
  if (selectedMode === "exam") renderExamPalette();
}

function renderExamPalette() {
  document.querySelector("#exam-palette").innerHTML = questions.map((question, index) => {
    const values = examAnswers[index] || [];
    const answeredCount = values.filter(value => value !== null && value !== undefined).length;
    const complete = values.length === question.statements.length && values.every(value => value !== null && value !== undefined);
    const flagged = isReviewFlagged(selectedExam, selectedYear, question.number);
    return `<button class="palette-button ${index === current ? "current" : ""} ${complete ? "answered" : ""} ${answeredCount > 0 && !complete ? "partial" : ""} ${flagged ? "flagged" : ""}" type="button" data-question-index="${index}" aria-label="問${question.number}${complete ? " 回答済み" : (answeredCount ? ` ${answeredCount}項目回答済み` : " 未回答")}${flagged ? " 復習対象" : ""}">${question.number}</button>`;
  }).join("");
  document.querySelectorAll(".palette-button").forEach(button => button.addEventListener("click", () => {
    saveExamAnswers();
    current = Number(button.dataset.questionIndex);
    renderQuestion();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }));
}

function renderCatalogFilters() {
  const yearSelect = document.querySelector("#catalog-year");
  yearSelect.innerHTML = `<option value="all">全年度</option>${Object.keys(examBanks[catalogExam]).map(Number).sort((a, b) => b - a).map(year => `<option value="${year}">${year}年度</option>`).join("")}`;
  const categories = categoryRules[catalogExam].map(([name]) => name);
  document.querySelector("#catalog-category").innerHTML = `<option value="all">すべて</option>${categories.map(category => `<option value="${category}">${category}</option>`).join("")}`;
  document.querySelector("#catalog-exam").value = catalogExam;
}

function renderCatalog() {
  const yearValue = document.querySelector("#catalog-year").value;
  const categoryValue = document.querySelector("#catalog-category").value;
  const reviewOnly = document.querySelector("#catalog-review-only").checked;
  const entries = Object.entries(examBanks[catalogExam]).flatMap(([year, yearQuestions]) => yearQuestions.map(question => ({ year: Number(year), question, category: classifyQuestion(catalogExam, question) })))
    .filter(entry => yearValue === "all" || entry.year === Number(yearValue))
    .filter(entry => categoryValue === "all" || entry.category === categoryValue)
    .filter(entry => !reviewOnly || isReviewFlagged(catalogExam, entry.year, entry.question.number))
    .sort((a, b) => b.year - a.year || a.question.number - b.question.number);
  document.querySelector("#catalog-count").textContent = `${entries.length}問`;
  document.querySelector("#catalog-list").innerHTML = entries.length ? entries.map(entry => {
    const flagged = isReviewFlagged(catalogExam, entry.year, entry.question.number);
    const source = sourceStatus(catalogExam, entry.year, entry.question.number);
    const statusLabel = source.status === "article-identified" ? "条文候補特定" : (source.status === "candidate-linked" ? "根拠候補あり" : "資料未特定");
    return `<article class="catalog-item"><div class="catalog-item-meta"><span>${entry.year}</span><span>問${entry.question.number}</span><span>${entry.category}</span><em class="source-status ${source.status}">${statusLabel}</em>${flagged ? `<b>復習</b>` : ""}</div><h3>${entry.question.prompt}</h3><button type="button" data-open-exam="${catalogExam}" data-open-year="${entry.year}" data-open-number="${entry.question.number}">この問題を解く</button></article>`;
  }).join("") : `<p class="catalog-empty">条件に一致する問題はありません。</p>`;
  document.querySelectorAll("[data-open-number]").forEach(button => button.addEventListener("click", () => openCatalogQuestion(button)));
}

function openCatalogQuestion(button) {
  selectedExam = button.dataset.openExam;
  selectedYear = Number(button.dataset.openYear);
  selectedMode = "practice";
  questions = examBanks[selectedExam][selectedYear];
  current = questions.findIndex(question => question.number === Number(button.dataset.openNumber));
  totalCorrect = 0;
  examAnswers = {};
  localStorage.setItem("railway-exam-type", selectedExam);
  localStorage.setItem("railway-study-mode", selectedMode);
  renderExamTabs();
  renderModeButtons();
  renderYearButtons();
  selectView("study");
  current = questions.findIndex(question => question.number === Number(button.dataset.openNumber));
  renderQuestion();
}

function readCurrentAnswers() {
  const question = questions[current];
  return question.statements.map((statement, index) => {
    const selected = form.querySelector(`input[name="answer-${index}"]:checked`);
    if (!selected) return null;
    return inputKind(question, statement) === "boolean" ? selected.value === "true" : selected.value;
  });
}

function saveExamAnswers() {
  examAnswers[current] = readCurrentAnswers();
  updateHeader();
  renderExamPalette();
}

function restoreExamAnswers() {
  (examAnswers[current] || []).forEach((value, index) => {
    if (value === null || value === undefined) return;
    const stored = typeof value === "boolean" ? String(value) : value;
    const input = form.querySelector(`input[name="answer-${index}"][value="${CSS.escape(stored)}"]`);
    if (input) input.checked = true;
  });
}

function scoreStatement(question, statement, selected) {
  return selected !== null && selected !== undefined && selected === statement.answer;
}

function explanationHtml(question, statement, index, selected) {
  const kind = inputKind(question, statement);
  const isCorrect = scoreStatement(question, statement, selected);
  const correctAnswer = kind === "boolean" ? (statement.answer ? "○" : "×") : statement.answer;
  const correctOption = kind === "choice" ? statement.options.find(option => option.key === statement.answer) : null;
  const derivation = statement.derivation ? `<div class="detail-block derivation-block"><strong>導出・考え方</strong>${Array.isArray(statement.derivation) ? `<ol>${statement.derivation.map(step => `<li>${step}</li>`).join("")}</ol>` : `<p>${statement.derivation}</p>`}</div>` : "";
  const errorPoint = statement.errorPoint ? `<div class="detail-block error-point"><strong>${statement.answer === false ? "誤っている箇所" : "判定のポイント"}</strong><p>${statement.errorPoint}</p></div>` : "";
  const terms = statement.terms?.length ? `<div class="detail-block term-block"><strong>用語・選択肢の確認</strong><dl>${statement.terms.map(term => `<div><dt>${term.term}</dt><dd>${term.meaning}</dd></div>`).join("")}</dl></div>` : "";
  const selectedText = selected === null || selected === undefined ? "未回答" : (kind === "boolean" ? (selected ? "○" : "×") : selected);
  return `<article class="explanation ${isCorrect ? "correct" : "wrong"}">
    <h3>${statement.label || `${index + 1}.`} ${isCorrect ? "正解" : "不正解"}（回答：${selectedText}／正答：${correctAnswer}${correctOption ? ` ${correctOption.text}` : ""}）</h3>
    <p>${statement.explanation}</p>${errorPoint}${derivation}${terms}
    <div class="legal-basis"><strong>根拠：${statement.citation}</strong><p><span class="statute-label">根拠本文・定義</span>${statement.statuteText}</p></div>
  </article>`;
}

function checkAnswers() {
  if (answered) return;
  const question = questions[current];
  const selections = readCurrentAnswers();
  if (selections.some(value => value === null)) {
    document.querySelector("#form-message").textContent = `${question.statements.length}つの設問すべてに回答してください。`;
    return;
  }
  answered = true;
  const correct = question.statements.reduce((sum, statement, index) => sum + Number(scoreStatement(question, statement, selections[index])), 0);
  totalCorrect += correct;
  document.querySelector("#explanations").innerHTML = question.statements.map((statement, index) => explanationHtml(question, statement, index, selections[index])).join("");
  document.querySelector("#result-score").textContent = `${correct} / ${question.statements.length} 正解`;
  document.querySelector("#source-text").textContent = question.source;
  document.querySelector("#next-button").textContent = current === questions.length - 1 ? "最初から復習" : "次の問題";
  updateHeader();
  resultPanel.hidden = false;
  resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function nextPracticeQuestion() {
  current = current === questions.length - 1 ? 0 : current + 1;
  if (current === 0) totalCorrect = 0;
  updateHeader();
  renderQuestion();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function moveExam(direction) {
  saveExamAnswers();
  current = Math.max(0, Math.min(questions.length - 1, current + direction));
  renderQuestion();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function finishExam() {
  saveExamAnswers();
  let correct = 0;
  let total = 0;
  const details = questions.map((question, questionIndex) => {
    const answers = examAnswers[questionIndex] || [];
    const questionCorrect = question.statements.reduce((sum, statement, index) => sum + Number(scoreStatement(question, statement, answers[index])), 0);
    correct += questionCorrect;
    total += question.statements.length;
    return `<details class="exam-review"><summary>問${question.number}　${questionCorrect} / ${question.statements.length} 正解</summary>${question.statements.map((statement, index) => explanationHtml(question, statement, index, answers[index])).join("")}</details>`;
  }).join("");
  const rate = Math.round(correct / total * 100);
  const target = 60;
  document.querySelector("#exam-summary-score").textContent = `${correct} / ${total} 正解（正答率 ${rate}%）`;
  document.querySelector("#target-result").textContent = rate >= target ? `学習目標 ${target}% に到達` : `学習目標 ${target}% まであと ${target - rate}ポイント`;
  document.querySelector("#target-result").className = `target-result ${rate >= target ? "reached" : "not-reached"}`;
  document.querySelector("#exam-review-list").innerHTML = details;
  document.querySelector("#question-section").hidden = true;
  examSummary.hidden = false;
  examSummary.scrollIntoView({ behavior: "smooth", block: "start" });
}

function restartExam() {
  document.querySelector("#question-section").hidden = false;
  resetSession();
}

form.addEventListener("change", () => {
  if (selectedMode === "exam") saveExamAnswers();
});
document.querySelector("#check-button").addEventListener("click", checkAnswers);
document.querySelector("#next-button").addEventListener("click", nextPracticeQuestion);
document.querySelector("#previous-button").addEventListener("click", () => moveExam(-1));
document.querySelector("#exam-next-button").addEventListener("click", () => moveExam(1));
document.querySelector("#finish-exam-button").addEventListener("click", finishExam);
document.querySelector("#restart-exam-button").addEventListener("click", restartExam);
document.querySelector("#review-toggle").addEventListener("click", toggleReviewFlag);
document.querySelectorAll(".view-button").forEach(button => button.addEventListener("click", () => selectView(button.dataset.view)));
document.querySelectorAll(".analysis-subject").forEach(button => button.addEventListener("click", () => {
  analysisExam = button.dataset.analysisExam;
  renderAnalysis();
}));
document.querySelector("#catalog-exam").addEventListener("change", event => {
  catalogExam = event.target.value;
  renderCatalogFilters();
  renderCatalog();
});
document.querySelector("#catalog-year").addEventListener("change", renderCatalog);
document.querySelector("#catalog-category").addEventListener("change", renderCatalog);
document.querySelector("#catalog-review-only").addEventListener("change", renderCatalog);

selectedYear = Number(localStorage.getItem(`railway-${selectedExam}-year`)) || availableYears()[0];
if (!examBanks[selectedExam][selectedYear]) selectedYear = availableYears()[0];
renderExamTabs();
renderModeButtons();
renderYearButtons();
resetSession();
