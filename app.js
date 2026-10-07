const stocks = [
  {
    code: "TF-101", name: "ネオグリッド", initials: "N", sector: "クリーンテック",
    marketCap: 86, growth: 38.4, margin: 16.2, per: 31.4, color: "#3b9270",
    factors: { growth: 92, profitability: 78, durability: 81, financial: 74, runway: 89 },
    outlook: "再生可能エネルギー管理ソフトの需要拡大を想定。高成長の一方で、成長投資と競争環境の変化に注目。"
  },
  {
    code: "TF-204", name: "オービットAI", initials: "O", sector: "ソフトウェア",
    marketCap: 142, growth: 54.2, margin: 12.8, per: 48.6, color: "#697fc2",
    factors: { growth: 98, profitability: 67, durability: 70, financial: 82, runway: 94 },
    outlook: "企業向けAI基盤の利用拡大を想定。高い成長率に対して、利益率の改善と顧客定着率が重要な確認点。"
  },
  {
    code: "TF-318", name: "メディカループ", initials: "M", sector: "ヘルステック",
    marketCap: 64, growth: 27.6, margin: 19.4, per: 26.8, color: "#bd7586",
    factors: { growth: 79, profitability: 86, durability: 87, financial: 88, runway: 76 },
    outlook: "医療機関向け業務支援の導入拡大を想定。安定した収益性と、継続課金モデルの維持が見どころ。"
  },
  {
    code: "TF-427", name: "フロウロジ", initials: "F", sector: "物流テック",
    marketCap: 39, growth: 32.1, margin: 8.7, per: 37.2, color: "#bd9250",
    factors: { growth: 84, profitability: 53, durability: 73, financial: 69, runway: 86 },
    outlook: "物流現場の自動化需要を想定。事業拡大に伴う利益率の改善ペースと、設備投資の負担を確認。"
  },
  {
    code: "TF-536", name: "クラフトクラウド", initials: "C", sector: "SaaS",
    marketCap: 118, growth: 22.8, margin: 24.3, per: 29.1, color: "#7d69a8",
    factors: { growth: 72, profitability: 94, durability: 88, financial: 91, runway: 71 },
    outlook: "中小企業の業務クラウド化を想定。良好な利益率に加え、新規顧客獲得と解約率の推移が焦点。"
  },
  {
    code: "TF-642", name: "アトラス素材", initials: "A", sector: "先端素材",
    marketCap: 52, growth: 18.5, margin: 14.7, per: 21.6, color: "#538d9b",
    factors: { growth: 66, profitability: 74, durability: 78, financial: 85, runway: 69 },
    outlook: "電池向け機能性素材の需要拡大を想定。顧客企業の生産計画や原材料価格の変化に注意が必要。"
  }
];

const factorLabels = [
  ["growth", "売上成長性"],
  ["profitability", "収益性"],
  ["durability", "競争優位性"],
  ["financial", "財務健全性"],
  ["runway", "市場の成長余地"]
];
const weights = { growth: 0.3, profitability: 0.2, durability: 0.2, financial: 0.15, runway: 0.15 };
const scoreFor = (stock) => Math.round(
  Object.entries(weights).reduce((total, [key, weight]) => total + stock.factors[key] * weight, 0)
);
const fmt = (value) => new Intl.NumberFormat("ja-JP").format(value);
const state = { query: "", threshold: "all", sort: "score", view: "all", selected: stocks[0].code, watchlist: new Set() };

const rowsElement = document.querySelector("#stock-rows");
const analysisElement = document.querySelector("#analysis-content");
const emptyState = document.querySelector("#empty-state");

function visibleStocks() {
  const query = state.query.trim().toLocaleLowerCase("ja");
  const items = stocks.filter((stock) => {
    const matchesQuery = !query || `${stock.name} ${stock.code} ${stock.sector}`.toLocaleLowerCase("ja").includes(query);
    const matchesScore = state.threshold === "all" || scoreFor(stock) >= Number(state.threshold);
    const matchesWatchlist = state.view !== "watchlist" || state.watchlist.has(stock.code);
    return matchesQuery && matchesScore && matchesWatchlist;
  });

  const sorters = {
    score: (a, b) => scoreFor(b) - scoreFor(a),
    growth: (a, b) => b.growth - a.growth,
    marketCap: (a, b) => b.marketCap - a.marketCap,
    name: (a, b) => a.name.localeCompare(b.name, "ja")
  };
  return items.sort(sorters[state.sort]);
}

function scoreTone(score) {
  return score >= 80 ? "" : score >= 70 ? "mid" : "low";
}

function renderRows(items) {
  rowsElement.innerHTML = items.map((stock) => {
    const score = scoreFor(stock);
    const saved = state.watchlist.has(stock.code);
    return `
      <tr data-code="${stock.code}" class="${state.selected === stock.code ? "selected" : ""}" aria-label="${stock.name}の分析を表示">
        <td>
          <div class="company-cell">
            <span class="company-logo" style="--logo-color:${stock.color}">${stock.initials}</span>
            <span class="company-meta"><strong>${stock.name}</strong><span>${stock.code} · ${stock.sector}</span></span>
          </div>
        </td>
        <td><div class="score-cell"><span class="score-number ${scoreTone(score)}">${score}</span><span class="score-track"><span style="width:${score}%"></span></span></div></td>
        <td class="positive">+${stock.growth.toFixed(1)}%</td>
        <td class="muted-data">${stock.margin.toFixed(1)}%</td>
        <td class="muted-data">${stock.per.toFixed(1)}x</td>
        <td class="muted-data">¥${stock.marketCap}億</td>
        <td><button class="star-button ${saved ? "saved" : ""}" type="button" data-star="${stock.code}" aria-label="${saved ? "ウォッチリストから削除" : "ウォッチリストに追加"}" aria-pressed="${saved}">${saved ? "★" : "☆"}</button></td>
      </tr>`;
  }).join("");

  emptyState.hidden = items.length !== 0;
  rowsElement.closest("table").hidden = items.length === 0;
  document.querySelector("#result-count").textContent = `${items.length} 銘柄`;
  document.querySelector("#table-summary").textContent = `${items.length} 件を表示`;
}

function renderAnalysis(stock) {
  if (!stock) {
    analysisElement.innerHTML = `
      <div class="no-selection">
        <p>ウォッチリストに保存した銘柄はまだありません。</p>
        <span>☆ を押して気になる銘柄を保存しましょう。</span>
      </div>`;
    return;
  }

  const score = scoreFor(stock);
  const factors = factorLabels.map(([key, label]) => `
    <div class="factor-row">
      <span>${label}</span>
      <span class="factor-track"><span style="width:${stock.factors[key]}%"></span></span>
      <span class="factor-value">${stock.factors[key]}</span>
    </div>`).join("");

  analysisElement.innerHTML = `
    <div class="analysis-company">
      <span class="analysis-logo" style="--logo-color:${stock.color}">${stock.initials}</span>
      <div><h3>${stock.name}</h3><p>${stock.code}　·　${stock.sector}</p></div>
    </div>
    <div class="analysis-score-row">
      <span class="analysis-score-label">総合成長スコア</span>
      <span class="analysis-score">${score}<small>/ 100</small></span>
      <span class="score-badge ${scoreTone(score)}">${score >= 80 ? "注目候補" : score >= 70 ? "成長候補" : "要調査"}</span>
    </div>
    <div class="factor-heading">ファンダメンタルズ評価</div>
    <div class="factor-list">${factors}</div>
    <div class="analysis-metrics">
      <div class="analysis-metric"><span>売上成長率</span><strong>+${stock.growth.toFixed(1)}%</strong></div>
      <div class="analysis-metric"><span>営業利益率</span><strong>${stock.margin.toFixed(1)}%</strong></div>
      <div class="analysis-metric"><span>PER</span><strong>${stock.per.toFixed(1)}x</strong></div>
      <div class="analysis-metric"><span>時価総額</span><strong>¥${stock.marketCap}億</strong></div>
    </div>
    <div class="analysis-outlook"><div class="outlook-title"><span></span>注目ポイント</div><p>${stock.outlook}</p></div>
    <p class="analysis-caveat">スコアは成長性・収益性・競争優位性・財務健全性・市場の成長余地を加重評価したサンプル指標です。将来の株価や運用成果を示すものではありません。</p>`;
}

function render() {
  const items = visibleStocks();
  const selected = items.find((stock) => stock.code === state.selected);
  if (!selected && items.length) state.selected = items[0].code;
  renderRows(items);
  renderAnalysis(selected || items[0] || null);
  document.querySelector("#watch-count").textContent = state.watchlist.size;
}

document.querySelector("#search-input").addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});
document.querySelector("#score-filter").addEventListener("change", (event) => {
  state.threshold = event.target.value;
  render();
});
document.querySelector("#sort-select").addEventListener("change", (event) => {
  state.sort = event.target.value;
  render();
});

document.querySelectorAll(".view-button, .nav-link[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    state.view = button.dataset.view;
    document.querySelectorAll(".view-button").forEach((viewButton) => {
      const active = viewButton.dataset.view === state.view;
      viewButton.classList.toggle("active", active);
      viewButton.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll(".nav-link").forEach((navLink) => {
      navLink.classList.toggle("active", Boolean(navLink.dataset.view) && navLink.dataset.view === state.view);
      if (navLink.dataset.view === state.view) navLink.setAttribute("aria-current", "page");
      else navLink.removeAttribute("aria-current");
    });
    render();
  });
});

rowsElement.addEventListener("click", (event) => {
  const star = event.target.closest("[data-star]");
  if (star) {
    event.stopPropagation();
    const { star: code } = star.dataset;
    if (state.watchlist.has(code)) state.watchlist.delete(code);
    else state.watchlist.add(code);
    render();
    return;
  }
  const row = event.target.closest("tr[data-code]");
  if (row) {
    state.selected = row.dataset.code;
    render();
  }
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.querySelector("#search-input").focus();
  }
  if (event.key === "Escape") document.querySelector("#search-input").blur();
});

const date = new Date();
document.querySelector("#today").textContent = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric", month: "2-digit", day: "2-digit"
}).format(date);

const sortedScores = stocks.map(scoreFor).sort((a, b) => b - a);
const medianGrowth = [...stocks].map((stock) => stock.growth).sort((a, b) => a - b);
document.querySelector("#total-count").textContent = stocks.length;
document.querySelector("#top-score").textContent = sortedScores[0];
document.querySelector("#median-growth").textContent = (
  (medianGrowth[2] + medianGrowth[3]) / 2
).toFixed(1);
render();
