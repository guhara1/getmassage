// 범용 지역 계층 생성기 (광역 → 시 → 구 → 행정동, 임의 깊이)
// - 경기(시→구→동 / 시→동), 인천(구·군→동) 등에 사용
// - 각 페이지 2000~2500자 목표, 구/동별 실제 정보 + 인접 동 + 문장 변형으로 도어웨이 방지
import { layout, esc, faqLd, articleLd, pricingTable, pricingLd, reviewsSection } from "../src/templates/layout.mjs";
import { site } from "../data/site.mjs";
import { programBySlug } from "../data/programs.mjs";
import { slugify } from "./romanize.mjs";
import { vpick, vsubset, vshuffle } from "./variants.mjs";

const MODIFIED = "2026-06-21";
const PROGRAM_PICKS = ["swedish", "aroma-therapy", "thai-massage", "home-care", "foot-massage"];
const phone = site.phone;

function seed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
const pick = (s, arr) => arr[s % arr.length];

// 타이틀·디스크립션 변형 (중복 방지: 지역명 조합 + 시드 기반 문형 변형)
export function dongMeta(dongName, metro, areaName) {
  const s = seed(metro + "|" + areaName + "|" + dongName);
  // 타이틀은 무조건 '지역명 + 출장마사지'로 시작
  const titles = [
    `${dongName} 출장마사지·홈타이 안내 — ${metro} ${areaName} | ${site.name}`,
    `${dongName} 출장마사지 이용 안내 · ${metro} ${areaName} | ${site.name}`,
    `${dongName} 출장마사지·홈타이 방문 예약 — ${metro} ${areaName} | ${site.name}`,
    `${dongName} 출장마사지 예약 가이드 (${metro} ${areaName}) | ${site.name}`,
  ];
  const descs = [
    `${metro} ${areaName} ${dongName} 출장마사지·홈타이 방문 권역과 예약 전 확인 사항 안내.`,
    `${areaName} ${dongName} 출장마사지·홈타이를 찾을 때 볼 방문 권역·예약 기준 안내.`,
    `${dongName}(${areaName}) 홈타이·출장마사지 이용 흐름과 비용·예약 방법 안내.`,
    `${areaName} ${dongName} 방문 마사지(홈타이) 프로그램·시간·예약 확인 사항 안내.`,
    `${dongName} 출장마사지 예약 체크리스트와 인근 동 정보를 ${metro} 기준으로 정리.`,
  ];
  return {
    title: titles[s % titles.length],
    description: descs[(s >>> 2) % descs.length].slice(0, 80),
  };
}
export function branchMeta(fullName, childLabel) {
  const s = seed("b|" + fullName);
  // 타이틀은 무조건 '지역명 + 출장마사지'로 시작
  const titles = [
    `${fullName} 출장마사지·홈타이 이용 안내 | ${site.name}`,
    `${fullName} 출장마사지 — ${childLabel}별 방문 안내 | ${site.name}`,
    `${fullName} 출장마사지·홈타이 예약·프로그램 안내 | ${site.name}`,
    `${fullName} 출장마사지 방문 이용 가이드 | ${site.name}`,
  ];
  const descs = [
    `${fullName} 출장마사지·홈타이 안내와 ${childLabel}별 방문 권역, 예약 확인 사항 정리.`,
    `${fullName}에서 출장마사지·홈타이를 ${childLabel}별로 비교하고 예약 기준을 확인하세요.`,
    `${fullName} 홈타이·출장마사지 프로그램과 이용 시간·비용, 예약 방법을 안내합니다.`,
    `${fullName} 방문 마사지 이용 흐름과 ${childLabel}별 안내, 예약 전 체크리스트 정리.`,
  ];
  return {
    title: titles[s % titles.length],
    description: descs[(s >>> 2) % descs.length].slice(0, 80),
  };
}

function authorBox() {
  return `
  <aside class="author-box">
    <div class="avatar">HL</div>
    <div class="meta">
      <strong>${esc(site.author.name)}</strong> · ${esc(site.author.role)}
      <p>${esc(site.author.bio)}</p>
      <p class="updated">최종 수정일 ${MODIFIED} · 검수: ${esc(site.author.reviewer)}</p>
    </div>
  </aside>`;
}
function callout() {
  return `<div class="callout">표시된 정보와 가격은 변동될 수 있으므로, <strong>실제 방문 가능 여부와 비용은 예약 전 ${esc(
    phone
  )}로 직접 확인</strong>하는 것이 정확합니다.</div>`;
}
const ctaBtn = (label) =>
  `<p><a class="btn btn-primary" href="${site.phoneHref}">📞 ${esc(label)} 전화예약 ${esc(phone)}</a></p>`;
function programChips(place) {
  const pre = place ? `${place} ` : "";
  return `<div class="link-cloud">${PROGRAM_PICKS.map((slug) => {
    const p = programBySlug[slug];
    return `<a href="/program/${slug}/">${esc(pre + p.label)}</a>`;
  }).join("")}</div>`;
}
const stationsText = (n) => (n.stations && n.stations.length ? n.stations.slice(0, 4).join("·") : "");
const landmarksText = (n) => (n.landmarks && n.landmarks.length ? n.landmarks.slice(0, 4).join("·") : "");
function bcNav(node) {
  const parts = [
    `<a href="/">홈</a>`,
    `<a href="/region/">지역별 찾기</a>`,
    ...node.ancestors.map((a) => `<a href="${a.url}">${esc(a.name)}</a>`),
    esc(node.name),
  ];
  return `<nav class="breadcrumb container" aria-label="위치">${parts.join("<span>›</span>")}</nav>`;
}
const crumb = (node) => [
  { name: "홈", url: "/" },
  { name: "지역별 찾기", url: "/region/" },
  ...node.ancestors.map((a) => ({ name: a.name, url: a.url })),
  { name: node.name, url: node.url },
];

// ---------- 트리 정규화 ----------
function normalize(node, ancestors, parent) {
  node.ancestors = ancestors;
  node.parent = parent || null;
  if (node.kind !== "metro") node.slug = node._slug || slugify(node.name);
  node.url = "/region/" + [...ancestors.map((a) => a.slug), node.slug].join("/") + "/";

  let kids = node.children;
  if (node.dongs) {
    kids = node.dongs.map((d) => (typeof d === "string" ? { kind: "dong", name: d } : d));
    node.children = kids;
  }
  if (kids && kids.length) {
    const used = new Set();
    const childAnc = [...ancestors, { name: node.name, url: node.url, slug: node.slug }];
    for (const k of kids) {
      let sg = slugify(k.name) || "area";
      let base = sg,
        n = 2;
      while (used.has(sg)) sg = base + n++;
      used.add(sg);
      k._slug = sg;
      normalize(k, childAnc, node);
    }
  }
}

// ---------- 행정동(말단) 페이지 ----------
function dongPage(node) {
  const parent = node.parent; // 구 또는 시
  const dongName = node.name;
  const areaName = parent.name; // 예: 영통구 / 부천시
  const metro = node.ancestors[0].name; // 경기 / 인천
  const st = stationsText(parent);
  const lm = landmarksText(parent);
  const sib = (parent.children || []).filter((c) => c.kind === "dong" && c.name !== dongName);
  const near = sib.slice(0, 5);
  const nearText = near.length ? near.map((d) => d.name).join("·") : areaName + " 일대";
  const n1 = near[0] ? near[0].name : areaName + " 일대";

  // 변형 base: 광역+상위지역+동명 → 동명 동(여러 도시의 중앙동 등)도 분기
  const vb = "DG␟" + metro + "␟" + areaName + "␟" + dongName;

  // ── 개요 2문단 (독립 슬롯 조합) ──
  const openA = vpick(vb, "openA", [
    `${dongName}은(는) ${metro} ${areaName}에 속한 행정동입니다.`,
    `${metro} ${areaName} ${dongName} 일대는 주거와 생활 편의가 맞물린 권역입니다.`,
    `${areaName} ${dongName}은(는) ${metro} 안에서도 방문 관리 문의가 이어지는 동네입니다.`,
    `${dongName}은(는) ${areaName} 생활권의 한 축을 이루는 ${metro} 소속 행정동입니다.`,
    `${metro} ${areaName}의 ${dongName}은(는) 인접 동과 권역이 촘촘히 이어지는 지역입니다.`,
  ]);
  const openCtx = (parent.character ? esc(parent.character) + " " : "") +
    (st ? `인근으로는 ${esc(st)} 등이 가까워 이동이 이어지고, ` : "") +
    (lm ? `${esc(lm)} 같은 시설이 생활 권역의 기준점이 됩니다.` : "주변 생활 권역을 중심으로 이동 동선이 형성됩니다.");
  const demand = vpick(vb, "demand", [
    `${dongName}에서 출장마사지나 홈타이를 찾을 때는 방문 권역과 도착 소요 시간을 먼저 확인하는 것이 좋습니다.`,
    `${dongName} 인근에서 방문 관리를 이용하려는 분들은 같은 ${areaName} 안에서도 권역에 따라 도착 시간이 달라질 수 있다는 점을 염두에 두면 좋습니다.`,
    `${dongName}에서 이용하려면 방문 가능 여부와 소요 시간을 예약 시 확인하는 것이 정확합니다.`,
    `${n1} 방면과 맞닿은 ${dongName}은(는) 출발지에 따라 도착 시간이 달라질 수 있어, 위치를 정확히 알리면 안내가 수월합니다.`,
  ]);

  // ── '이런 경우' 불릿 (6개 중 4개, 순서 셔플) ──
  const whoBullets = vsubset(vb, "who", [
    `${areaName} 안에서 이동 없이 집·숙소에서 편하게 관리받고 싶은 경우`,
    `퇴근 후나 늦은 시간에 ${dongName} 인근에서 이용하고 싶은 경우`,
    `오래 앉아 일하거나 이동이 잦아 어깨·허리 피로가 누적된 경우`,
    `처음이라 부드러운 스웨디시나 발마사지처럼 부담이 적은 프로그램부터 비교하고 싶은 경우`,
    `${n1} 등 인접 동까지 권역을 두고 ${dongName}을(를) 함께 살펴보려는 경우`,
    `${metro} 외부에서 ${areaName}을(를) 찾아 숙소에서 관리를 받고 싶은 경우`,
  ], 4);

  // ── 확인할 점 문단 + 불릿 ──
  const checkPara = vpick(vb, "checkP", [
    `표시된 운영 시간이나 가격은 변동될 수 있으므로, 방문 가능 여부·총 비용·추가 요금은 예약 단계에서 직접 확인하는 것이 좋습니다. ${dongName} 인근은 출발지에 따라 방문 소요 시간이 달라질 수 있어, 원하는 시간대를 미리 정해 문의하면 안내가 빠릅니다.`,
    `같은 ${areaName}이라도 ${dongName} 기준 권역과 도착 시간은 출발지에 따라 다릅니다. 예약 시 위치·시간·프로그램을 함께 알리면 안내가 정확해집니다.`,
    `${dongName}에서 이용할 때는 방문 가능 권역, 비용, 추가 요금을 예약 과정에서 확정하는 것이 좋습니다. 표시 정보는 참고용이며 실제 조건은 상담에서 확인됩니다.`,
  ]);
  const checkBullets = vsubset(vb, "check", [
    `${dongName} 방문 가능 권역과 도착 소요 시간`,
    `원하는 프로그램(스웨디시·아로마·타이마사지 등)과 관리 시간`,
    `표시 가격에 방문비·심야 요금 포함 여부`,
    `관리사 성별 지정 등 추가 요청 가능 여부`,
    `관리 공간·타월 등 준비물`,
    `${areaName} 내 이동 동선에 따른 방문 시간대`,
  ], 5);

  // ── 관리 방식 비교 문단 ──
  const comparePara = vpick(vb, "compare", [
    `부드러운 오일 관리를 원한다면 스웨디시나 아로마테라피, 스트레칭 위주의 시원한 관리를 원한다면 타이마사지를 비교해 보세요. 집·숙소로 편하게 받고 싶다면 홈타이, 다리만 가볍게 풀고 싶다면 발마사지처럼 부분 관리도 선택할 수 있습니다.`,
    `${dongName} 인근에서는 오일 기반의 스웨디시·아로마, 근육을 늘려 푸는 타이마사지, 방문형 홈타이, 부분 관리인 발마사지를 목적에 맞게 고르면 됩니다. 피로 부위와 강도를 먼저 정하면 선택이 쉬워집니다.`,
    `처음이라면 자극이 적은 스웨디시나 발마사지부터, 뭉침이 심하면 타이마사지나 경락 위주로 비교해 보세요. 이동 없이 받고 싶다면 ${dongName} 인근 방문이 되는 홈타이를 확인하면 됩니다.`,
  ]);

  // ── 이용 흐름 문단 ──
  const flowPara = vpick(vb, "flow", [
    `예약 시 ${dongName} 위치와 원하는 프로그램·시간을 전달하면, 방문 가능 여부와 도착 예정 시간을 안내받게 됩니다. 방문 형태(홈타이)는 관리 공간과 타월 등 간단한 준비만 갖추면 익숙한 공간에서 관리받을 수 있고, 관리 후 별도 이동 없이 그대로 쉴 수 있다는 점이 장점입니다.`,
    `${dongName}에서의 이용은 위치 전달 → 프로그램·시간 선택 → 방문 가능 여부와 비용 확인 → 전화예약 순으로 진행하면 매끄럽습니다. 홈타이는 이동 부담이 적은 대신 관리 공간·타월 등 준비물을 미리 챙겨 두면 좋습니다.`,
    `먼저 ${dongName} 위치와 시간대를 정해 문의하면 도착 예정 시간을 안내받을 수 있습니다. 늦은 시간 이용을 원한다면 심야 방문 가능 여부와 추가 요금을 함께 확인해 두세요.`,
  ]);

  const faqs = [
    {
      q: `${dongName}에서 출장마사지는 어떻게 예약하나요?`,
      a: vpick(vb, "fa1", [
        `전화로 ${dongName}(${metro} ${areaName}) 위치와 원하는 프로그램·시간을 알리면 방문 가능 여부와 도착 소요 시간을 안내받을 수 있습니다. 비용과 포함 범위도 함께 확인하세요.`,
        `${metro} ${areaName} ${dongName}이라고 알리고 프로그램·시간을 전달하면 도착 예정 시간과 비용을 안내받습니다. 추가 요금 포함 여부도 미리 확인하세요.`,
      ]),
    },
    {
      q: `${dongName}에서 홈타이도 이용할 수 있나요?`,
      a: vpick(vb, "fa2", [
        `홈타이는 집·숙소로 받는 방문 형태의 출장마사지를 뜻하며, ${dongName}에서도 방문 가능 권역인지 예약 시 확인하면 됩니다. 스웨디시·아로마·타이마사지 등 프로그램을 선택할 수 있습니다.`,
        `네, 홈타이는 ${dongName} 인근 집·숙소로 받는 방문 관리입니다. 권역에 포함되는지 예약 시 확인하고 원하는 프로그램·시간을 함께 정하면 됩니다.`,
      ]),
    },
    {
      q: `${dongName}까지 방문에 얼마나 걸리나요?`,
      a: vpick(vb, "fa3", [
        `출발지와 시간대, ${areaName} 내 권역에 따라 달라집니다. 정확한 방문 소요 시간은 예약 시 확인하는 것이 좋습니다.`,
        `${dongName}은(는) 출발지와 교통 상황에 따라 도착 시간이 달라집니다. 예약 시 위치를 알리면 예상 소요 시간을 안내받을 수 있습니다.`,
      ]),
    },
  ];

  const secOverview = `
    <h2>${esc(dongName)} 지역 개요</h2>
    <p>${esc(openA)} ${openCtx}</p>
    <p>${esc(demand)} 같은 ${esc(areaName)} 안에서 ${esc(nearText)} 등 인접 동과 권역이 맞닿아 있어, 방문 위치를 정확히 알리면 안내가 한결 수월합니다.</p>`;
  const secWho = `
    <h2>${esc(dongName)}에서 출장마사지·홈타이를 찾는 경우</h2>
    <ul>${whoBullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;
  const secCheck = `
    <h2>${esc(dongName)}에서 이용 시 확인할 점</h2>
    <p>${esc(checkPara)}</p>
    <ul>${checkBullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
    ${callout()}`;
  const secCompare = `
    <h2>${esc(dongName)}에서 비교해 볼 관리 방식</h2>
    <p>${esc(comparePara)}</p>
    ${programChips(dongName)}`;
  const secFlow = `
    <h2>${esc(dongName)} 출장마사지·홈타이 이용 흐름</h2>
    <p>${esc(flowPara)}</p>`;
  const secTips = `
    <h2>${esc(dongName)} 코스·시간대 선택 안내</h2>
    <p>${esc(vpick(vb, "tipA", [
      `처음 ${dongName} 인근에서 이용한다면 60분 코스로 컨디션을 확인한 뒤 뭉침이 심하면 90·120분으로 늘리는 방식이 부담이 적습니다. 코스가 길수록 전신을 천천히 풀 수 있어 피로가 오래 누적된 경우에 적합합니다.`,
      `${dongName}에서는 가볍게 풀고 싶다면 60분, 전신을 고르게 받고 싶다면 90분, 집중 관리가 필요하면 120분 코스가 기준이 됩니다. 원하는 부위와 시간 여유에 맞춰 고르면 선택이 쉬워집니다.`,
      `${areaName} 일대에서 코스를 고를 때는 ‘오늘 얼마나 풀고 싶은지’를 먼저 정하면 됩니다. 짧게 60분, 표준 90분, 집중 120분으로 나눠 두고 ${dongName} 방문 시간대와 함께 정하면 편합니다.`,
      `${dongName} 인근 이용이 처음이라면 무리한 강도보다 60·90분 코스로 시작해 몸 상태를 보며 조절하는 편이 좋습니다. 강도와 시간은 관리 전에 미리 전달하면 맞춰 받기 수월합니다.`,
    ]))}</p>
    <p>${esc(vpick(vb, "tipB", [
      `${dongName}에서 홈타이로 받을 때는 관리받을 공간을 미리 정리하고 큰 수건을 준비해 두면 진행이 매끄럽습니다. 심야 시간대는 방문 가능 여부와 추가 요금이 달라질 수 있으니 예약 시 함께 확인하세요.`,
      `방문(홈타이) 형태로 ${dongName}에서 받는다면 매트를 펼 공간과 타월 정도만 준비하면 됩니다. 늦은 시간대 이용은 도착 시간이 길어질 수 있어, 원하는 시간을 미리 알려 두는 것이 좋습니다.`,
      `${dongName} 인근에서 늦은 시간 이용을 생각한다면 심야 방문 가능 여부와 추가 요금, 도착 소요 시간을 예약 단계에서 확인해 두면 당일 진행이 매끄럽습니다.`,
      `${dongName}에서 홈타이를 처음 받는다면 출입 방법과 주차, 준비물(수건·관리 공간)을 예약 시 미리 맞춰 두면 관리사 방문 후 바로 시작할 수 있어 시간을 아낄 수 있습니다.`,
    ]))}</p>`;

  const middle = vshuffle(vb, "order", [secWho, secCheck, secCompare, secFlow, secTips]).join("\n");

  const body = `
  ${bcNav(node)}
  <article class="section-tight"><div class="container prose">
    <p class="card-tag" style="color:var(--color-accent);font-weight:700">${esc(metro)} ${esc(
    areaName
  )}</p>
    <h1>${esc(dongName)} 출장마사지·홈타이 이용 안내</h1>
    ${secOverview}
    ${middle}

    <h2>${esc(dongName)} 인근 지역</h2>
    <p>같은 ${esc(areaName)} 내 ${esc(nearText)} 등 인접 동과 함께 비교하면 방문 권역을 잡기 쉽습니다.</p>
    <div class="link-cloud">
      ${near.map((d) => `<a href="${d.url}">${esc(d.name)}</a>`).join("")}
      <a href="${parent.url}">${esc(areaName)} 전체</a>
      <a href="${node.ancestors[0].url}">${esc(metro)} 전체</a>
    </div>

    <h2>자주 묻는 질문</h2>
    <div class="faq">
      ${faqs
        .map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`)
        .join("\n      ")}
    </div>

    ${authorBox()}
    ${ctaBtn(dongName + " 출장마사지")}
  </div></article>
  ${reviewsSection()}
  ${pricingTable()}`;

  return {
    path: node.url,
    file: node.url.replace(/^\//, "").replace(/\/$/, "") + "/index.html",
    html: layout({
      ...dongMeta(dongName, metro, areaName),
      path: node.url,
      body,
      structuredData: [
        faqLd(faqs),
        articleLd({
          headline: `${dongName} 출장마사지·홈타이 이용 안내`,
          description: `${dongName}(${metro} ${areaName}) 출장마사지·홈타이 이용 안내`,
          path: node.url,
          modified: MODIFIED,
        }),
        pricingLd(),
      ],
      breadcrumb: crumb(node),
    }),
  };
}

// ---------- 시/구(중간) 페이지 ----------
function branchPage(node) {
  const metro = node.kind === "metro" ? node.name : node.ancestors[0].name;
  const childKind = node.children && node.children[0] ? node.children[0].kind : "dong";
  const childLabel = childKind === "si" ? "시·군" : childKind === "gu" ? "자치구·구" : "행정동";
  const st = stationsText(node);
  const lm = landmarksText(node);
  const fullName = node.kind === "metro" ? node.name : `${metro} ${node.name}`;

  const childLinks = (node.children || [])
    .map((c) => `<a href="${c.url}">${esc(c.name)}</a>`)
    .join("");
  const childCards = (node.children || [])
    .map(
      (c) => `<a class="card" href="${c.url}">
        <h3>${esc(c.name)}</h3>
        <p>${esc((c.character || `${c.name} 출장마사지·홈타이 이용 안내`).slice(0, 50))}…</p>
      </a>`
    )
    .join("\n        ");

  const nm = node.name;
  const child1 = node.children && node.children[0] ? node.children[0].name : childLabel;
  // 변형 base: 광역 + 지역명 → 동명 구(여러 광역시의 동구·남구 등)도 분기
  const vb = "BR␟" + metro + "␟" + nm;

  const faqs = [
    {
      q: `${fullName} 출장마사지는 어떻게 예약하나요?`,
      a: vpick(vb, "fa1", [
        `전화로 ${fullName} 내 ${childLabel}와 원하는 프로그램·시간을 알리면 방문 가능 여부와 소요 시간을 안내받을 수 있습니다.`,
        `${fullName}에서는 원하는 ${childLabel}, 프로그램, 시간을 전화로 알리면 방문 가능 여부와 도착 예정 시간을 안내받을 수 있습니다.`,
      ]),
    },
    {
      q: `${fullName}에서 받을 수 있는 프로그램은 무엇인가요?`,
      a: vpick(vb, "fa2", [
        `스웨디시·아로마테라피·타이마사지 등 다양한 프로그램과 집·숙소로 받는 홈타이를 비교할 수 있습니다.`,
        `오일 관리(스웨디시·아로마), 스트레칭 위주의 타이마사지, 방문형 홈타이, 부분 관리인 발마사지 등을 ${nm} 기준으로 비교할 수 있습니다.`,
      ]),
    },
    {
      q: `${fullName} 어디까지 방문이 되나요?`,
      a: vpick(vb, "fa3", [
        `${childLabel}별로 방문 권역이 다를 수 있습니다. 아래 목록에서 해당 지역을 확인하고 예약 시 위치를 알리면 됩니다.`,
        `${nm} 내 ${childLabel}에 따라 권역이 달라집니다. ${child1} 등 원하는 지역을 고른 뒤 예약 시 위치를 알리면 방문 가능 여부를 확인할 수 있습니다.`,
      ]),
    },
  ];

  // 중간 페이지 본문 (2000자 목표)
  const charPara = node.character
    ? `<p>${esc(nm)}은(는) ${esc(node.character)}${
        st ? ` ${esc(st)} 등으로 이동이 이어지고,` : ""
      }${lm ? ` ${esc(lm)} 같은 시설이 생활 권역의 기준점이 됩니다.` : ""}</p>`
    : `<p>${esc(node.intro || vpick(vb, "noChar", [
        `${fullName}은(는) 권역이 넓어 같은 지역이라도 ${childLabel}에 따라 방문 권역과 도착 소요 시간이 달라질 수 있습니다.`,
        `${fullName}은(는) ${child1} 등 여러 ${childLabel}로 나뉘어, 어느 지역을 먼저 고르느냐에 따라 방문 권역과 안내가 달라집니다.`,
        `${fullName}은(는) 생활권이 넓게 이어져 있어, ${childLabel}별로 방문 가능 권역과 도착 시간을 따로 확인하는 것이 좋습니다.`,
      ]))}</p>`;

  const isMetro = node.kind === "metro";

  const childSection = isMetro
    ? `<section class="section"><div class="container">
        <div class="section-head"><span class="eyebrow">${esc(node.name)} ${esc(
        childLabel
      )}</span>
          <h2>${esc(childLabel)}를 선택하세요</h2>
          <p>${esc(
            childLabel
          )}를 고른 뒤 하위 지역까지 좁혀 가면, 해당 지역의 출장마사지·홈타이 이용 안내를 확인할 수 있습니다.</p>
        </div>
        <div class="grid grid-4">${childCards}</div>
      </div></section>`
    : `<h2>${esc(node.name)} ${esc(childLabel)}에서 찾기</h2>
       <p>아래에서 ${esc(node.name)}의 ${esc(
        childLabel
      )}를 선택하면 해당 지역의 출장마사지·홈타이 이용 안내를 확인할 수 있습니다. (숫자 행정동은 대표 동명으로 통합해 안내합니다.)</p>
       <div class="link-cloud">${childLinks}</div>`;

  const secFeature = `
    <h2>${esc(nm)} 지역 특징</h2>
    ${charPara}
    <p>${esc(vpick(vb, "feat", [
      `같은 ‘${fullName} 출장마사지’라도 ${childLabel}에 따라 방문 권역과 도착 소요 시간이 달라질 수 있어, 원하는 지역을 먼저 고르면 방문 가능 여부와 프로그램을 더 정확히 확인할 수 있습니다.`,
      `${nm}은(는) ${child1} 등으로 권역이 나뉘어, 어느 ${childLabel}을(를) 먼저 고르느냐에 따라 방문 가능 권역과 도착 시간이 달라집니다.`,
      `${fullName}에서 출장마사지·홈타이를 찾을 때는 ${childLabel}별 권역 차이를 먼저 살펴보면 방문 가능 여부를 정확히 좁힐 수 있습니다.`,
    ]))}</p>`;

  const secWho = `
    <h2>${esc(nm)}에서 출장마사지·홈타이 이용이 많은 경우</h2>
    <ul>${vsubset(vb, "who", [
      `매장 방문 없이 집·숙소에서 편하게 관리받고 싶은 경우`,
      `${nm} 안에서 퇴근 후·늦은 시간에 이용하고 싶은 경우`,
      `오래 앉아 일하거나 이동이 잦아 어깨·허리가 뭉친 경우`,
      `처음이라 부드러운 스웨디시·발마사지부터 비교해 보고 싶은 경우`,
      `${child1} 등 ${nm} 내 여러 지역을 두고 권역을 함께 살펴보려는 경우`,
      `타 지역에서 ${nm}을(를) 찾아 숙소에서 방문 관리를 받고 싶은 경우`,
    ], 4).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;

  const secCompare = `
    <h2>${esc(nm)}에서 방문(홈타이)과 매장 이용 비교</h2>
    <p>${esc(vpick(vb, "compare", [
      `매장 이용이 시설과 부대 서비스를 함께 쓰는 방식이라면, 홈타이는 ${nm} 내 집·숙소로 관리사가 찾아오는 방문 방식입니다. 이동 부담이 적고 관리 후 바로 쉴 수 있는 대신, 관리 공간과 타월 등 준비물을 직접 챙겨야 하므로 예약 시 준비 사항을 확인하는 것이 좋습니다.`,
      `${nm}에서 매장 이용은 부대 시설을 함께 쓸 수 있고, 홈타이는 집·숙소로 받아 이동 없이 바로 쉴 수 있다는 점이 다릅니다. 목적과 시간대에 따라 맞는 방식을 고르면 됩니다.`,
      `홈타이는 ${nm} 인근 집·숙소로 관리사가 방문하는 형태라 이동 부담이 적습니다. 대신 관리 공간·타월 등 준비가 필요하므로, 매장 이용과 비교해 예약 전 준비 사항을 확인해 두는 것이 좋습니다.`,
    ]))}</p>`;

  const secGuide = `
    <h2>${esc(nm)} 출장마사지 한눈에 보기</h2>
    <p>${esc(vpick(vb, "guide", [
      `${nm}에서 출장마사지·홈타이를 이용할 때는 방문 권역(어느 지역까지 방문 가능한지), 프로그램(스웨디시·아로마·타이마사지·홈타이), 이용 시간(60·90·120분), 총 비용과 추가 요금을 순서대로 확인하면 선택이 쉬워집니다. 특히 ${childLabel}에 따라 도착 소요 시간이 달라질 수 있으니, 원하는 지역을 먼저 정해 두는 것이 좋습니다.`,
      `${nm} 이용은 ① 방문 권역 ② 프로그램 ③ 이용 시간(60·90·120분) ④ 비용·추가 요금 순으로 확인하면 정리가 쉽습니다. ${childLabel}마다 권역이 달라 원하는 지역을 먼저 정하는 것이 핵심입니다.`,
      `${nm}에서는 어느 ${childLabel}까지 방문되는지, 어떤 프로그램을 받을지, 시간과 비용은 어떻게 되는지를 차례로 확인하면 선택 기준이 분명해집니다. 지역에 따라 도착 시간이 달라지는 점만 미리 감안하세요.`,
    ]))}</p>`;

  const secPrograms = `
    <h2>${esc(nm)}에서 비교해 볼 관리 방식</h2>
    <p>${esc(vpick(vb, "prog", [
      `부드러운 오일 관리를 원한다면 스웨디시·아로마테라피, 스트레칭 위주라면 타이마사지, 집·숙소에서 편하게 받고 싶다면 홈타이, 가벼운 부분 관리는 발마사지를 비교해 보세요.`,
      `${nm} 인근에서는 오일 기반의 스웨디시·아로마, 근육을 늘려 푸는 타이마사지, 방문형 홈타이, 부분 관리인 발마사지를 목적에 맞게 고르면 됩니다.`,
      `피로 부위와 선호 강도에 따라 스웨디시·아로마(이완), 타이마사지(스트레칭), 발마사지(부분), 홈타이(방문) 중에서 ${nm} 기준으로 비교해 보세요.`,
    ]))}</p>
    ${programChips(nm)}
    ${callout()}`;

  const secBooking = `
    <h2>${esc(nm)} 출장마사지 예약 안내</h2>
    <p>${esc(vpick(vb, "booking", [
      `${nm}에서 출장마사지나 홈타이를 예약할 때는 원하는 하위 지역, 프로그램, 시간을 함께 전달하면 방문 가능 여부와 도착 예정 시간을 안내받을 수 있습니다. 처음 이용한다면 지역 확인 → 프로그램 선택 → 시간·비용 확인 → 전화예약 순서로 진행하면 됩니다. 표시 가격에 방문비나 심야 추가 요금이 포함되는지, 관리사 성별 지정이 가능한지도 미리 확인해 두면 좋습니다.`,
      `${nm} 예약은 원하는 ${childLabel}와 프로그램·시간을 전화로 알리는 것에서 시작합니다. 방문 가능 여부와 도착 예정 시간, 총 비용을 함께 확인하고, 심야 추가 요금이나 관리사 성별 지정 가능 여부도 미리 물어 두면 좋습니다.`,
      `${nm}에서 처음 예약한다면 ${child1} 등 지역을 먼저 정하고, 프로그램과 시간을 고른 뒤 비용을 확인하는 순서가 편합니다. 방문비·심야 요금 포함 여부를 함께 확인하면 실제 비용을 가늠하기 쉽습니다.`,
    ]))} 안내된 정보는 참고용이며 실제 이용 조건은 예약 과정에서 확정됩니다.</p>`;

  const secChecklist = `
    <h2>예약 전 체크리스트</h2>
    <ul>${vsubset(vb, "check", [
      `방문 희망 지역과 방문 소요 시간`,
      `원하는 프로그램과 관리 시간`,
      `표시 가격에 방문비·심야 요금 포함 여부`,
      `관리사 성별 지정 등 추가 요청`,
      `관리 공간·타월 등 준비물`,
      `${childLabel}별 방문 가능 권역 차이`,
    ], 5).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;

  const secFaq = `
    <h2>자주 묻는 질문</h2>
    <div class="faq">
      ${faqs
        .map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`)
        .join("\n      ")}
    </div>
    ${authorBox()}
    ${ctaBtn(fullName + " 출장마사지")}`;

  let body;
  if (isMetro) {
    body = `
    ${bcNav(node)}
    <section class="hero"><div class="container">
      <p class="eyebrow">${esc(node.name)}</p>
      <h1>${esc(node.name)} 출장마사지·홈타이 — ${esc(childLabel)}·행정동별 찾기</h1>
      <p>${esc(
        node.intro ||
          `${node.name}은(는) ${childLabel}와 행정동에 따라 방문 권역과 도착 소요 시간이 달라집니다. 원하는 지역을 먼저 고르면 방문 가능 여부와 프로그램을 더 정확히 확인할 수 있습니다.`
      )}</p>
      <div class="hero-actions">
        <a class="btn btn-gold" href="${site.phoneHref}">📞 전화예약 ${esc(phone)}</a>
        <a class="btn btn-outline" href="/program/">프로그램 보기</a>
      </div>
    </div></section>
    ${childSection}
    <section class="section section-alt"><div class="container prose">
      ${secFeature}${secWho}${secCompare}${secGuide}${secPrograms}${secBooking}${secChecklist}${secFaq}
    </div></section>
    ${reviewsSection()}
  ${pricingTable()}`;
  } else {
    // 본문 섹션 순서를 페이지마다 다르게(도어웨이 방지) — 도입/목록/FAQ 위치는 유지
    const pre = vshuffle(vb, "preOrder", [secWho, secCompare, secGuide]).join("");
    const post = vshuffle(vb, "postOrder", [secPrograms, secBooking, secChecklist]).join("");
    body = `
    ${bcNav(node)}
    <article class="section-tight"><div class="container prose">
      <p class="card-tag" style="color:var(--color-accent);font-weight:700">${esc(metro)}</p>
      <h1>${esc(fullName)} 출장마사지·홈타이 이용 안내</h1>
      ${secFeature}${pre}
      ${childSection}
      ${post}${secFaq}
    </div></article>
    ${reviewsSection()}
  ${pricingTable()}`;
  }

  return {
    path: node.url,
    file: node.url.replace(/^\//, "").replace(/\/$/, "") + "/index.html",
    html: layout({
      ...branchMeta(fullName, childLabel),
      path: node.url,
      body,
      structuredData: [
        faqLd(faqs),
        articleLd({
          headline: `${fullName} 출장마사지·홈타이 이용 안내`,
          description: `${fullName} 출장마사지·홈타이 이용 안내`,
          path: node.url,
          modified: MODIFIED,
        }),
        pricingLd(),
      ],
      breadcrumb: crumb(node),
    }),
  };
}

function collect(node, out) {
  if (node.kind === "dong") out.push(dongPage(node));
  else {
    out.push(branchPage(node));
    for (const k of node.children || []) collect(k, out);
  }
}

// 지역 트리 전체 빌드
export function buildRegionTree(root) {
  normalize(root, [], null);
  const pages = [];
  collect(root, pages);
  return pages;
}
