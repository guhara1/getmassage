// 서울 계층(광역 → 자치구 → 행정동) 페이지 생성기
// - 각 페이지 2000~2500자 목표
// - 구별 실제 정보(역·랜드마크·특징) + 동별 인접 동 목록을 주입해 고유성 확보
import { layout, esc, faqLd, articleLd, pricingTable, pricingLd, reviewsSection } from "../src/templates/layout.mjs";
import { site } from "../data/site.mjs";
import { programBySlug } from "../data/programs.mjs";
import { seoul } from "../data/seoul.mjs";
import { slugify } from "./romanize.mjs";
import { dongMeta, branchMeta } from "./region-tree.mjs";
import { vpick, vsubset, vshuffle } from "./variants.mjs";

const MODIFIED = "2026-06-21";
const PROGRAM_PICKS = ["swedish", "aroma-therapy", "thai-massage", "home-care", "foot-massage"];

// 문자열 → 안정적 정수 시드
function seed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
const pick = (s, arr) => arr[s % arr.length];

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

// 롱테일 프로그램 링크 (place 지정 시 '지역 프로그램 출장마사지' 형태)
function programChips(place) {
  const pre = place ? `${place} ` : "";
  return `<div class="link-cloud">${PROGRAM_PICKS.map((slug) => {
    const p = programBySlug[slug];
    return `<a href="/program/${slug}/">${esc(pre + p.label)}</a>`;
  }).join("")}</div>`;
}

const phone = site.phone;
const ctaBtn = (label) =>
  `<p><a class="btn btn-primary" href="${site.phoneHref}">📞 ${esc(label)} 전화예약 ${esc(phone)}</a></p>`;

function callout() {
  return `<div class="callout">표시된 정보와 가격은 변동될 수 있으므로, <strong>실제 방문 가능 여부와 비용은 예약 전 ${esc(
    phone
  )}로 직접 확인</strong>하는 것이 정확합니다.</div>`;
}

// ---------- 동 페이지 ----------
function dongPage(gu, dongName, siblings) {
  const s = seed(gu.name + dongName);
  const guSlug = gu.slug;
  const dongSlug = gu.dongSlug[dongName];
  const path = `/region/seoul/${guSlug}/${dongSlug}/`;
  const stationText = gu.stations.slice(0, 3).join("·");
  const landmarkText = gu.landmarks.slice(0, 3).join("·");
  const near = siblings.filter((d) => d !== dongName).slice(0, 5);
  const nearText = near.length ? near.join("·") : gu.name + " 일대";

  const vb = "SDG␟서울␟" + gu.name + "␟" + dongName;
  const openA = vpick(vb, "openA", [
    `${dongName}은(는) 서울 ${gu.name}에 속한 행정동으로, ${gu.character}`,
    `서울 ${gu.name} ${dongName} 일대는 ${gu.character}`,
    `${gu.name} ${dongName}은(는) ${gu.character}`,
    `서울 ${gu.name}의 ${dongName}은(는) 생활 권역이 또렷한 동네로, ${gu.character}`,
    `${dongName}(서울 ${gu.name})은(는) 인근 동과 권역이 이어지는 지역으로, ${gu.character}`,
  ]);
  const demand = vpick(vb, "demand", [
    `이 일대에서 출장마사지나 홈타이를 찾을 때는 ${dongName}의 위치와 방문 권역을 먼저 확인하는 것이 좋습니다.`,
    `${dongName}에서 출장마사지·홈타이를 이용하려는 분들은 방문 가능 권역과 도착 소요 시간을 먼저 확인하는 경우가 많습니다.`,
    `${dongName} 인근에서 방문 관리를 찾을 때는 같은 ${gu.name} 안에서도 권역에 따라 도착 시간이 달라질 수 있다는 점을 염두에 두면 좋습니다.`,
    `${nearText} 등과 맞닿은 ${dongName}은(는) 출발지에 따라 도착 시간이 달라질 수 있어, 위치를 정확히 알리면 안내가 빠릅니다.`,
  ]);
  const tip = vpick(vb, "tip", [
    `${dongName}처럼 생활 권역이 형성된 동네일수록 원하는 시간대의 예약이 몰릴 수 있어, 미리 시간을 정해 문의하면 안내가 빠릅니다.`,
    `${dongName}에서 처음 이용한다면 부드러운 스웨디시나 부분 관리인 발마사지처럼 부담이 적은 프로그램부터 비교해 보는 것도 방법입니다.`,
    `${dongName} 인근은 ${stationText} 등으로 이동이 이어지는 편이라, 방문 소요 시간은 출발지에 따라 달라질 수 있습니다.`,
  ]);
  const comparePara = vpick(vb, "compare", [
    `부드러운 오일 관리를 원한다면 스웨디시나 아로마테라피, 스트레칭 위주의 시원한 관리를 원한다면 타이마사지를 비교해 보세요. 집·숙소로 편하게 받고 싶다면 홈타이, 다리만 가볍게 풀고 싶다면 발마사지처럼 부분 관리도 선택할 수 있습니다.`,
    `${dongName} 인근에서는 오일 기반의 스웨디시·아로마, 근육을 늘려 푸는 타이마사지, 방문형 홈타이, 부분 관리인 발마사지를 목적에 맞게 고르면 됩니다. 피로 부위와 강도를 먼저 정하면 선택이 쉬워집니다.`,
    `처음이라면 자극이 적은 스웨디시나 발마사지부터, 뭉침이 심하면 타이마사지나 경락 위주로 비교해 보세요. 이동 없이 받고 싶다면 ${dongName} 인근 방문이 되는 홈타이를 확인하면 됩니다.`,
  ]);
  const flowPara = vpick(vb, "flow", [
    `예약 시 ${dongName} 위치와 원하는 프로그램·시간을 전달하면, 방문 가능 여부와 도착 예정 시간을 안내받게 됩니다. 방문 형태(홈타이)는 관리 공간과 타월 등 간단한 준비만 갖추면 익숙한 공간에서 관리받을 수 있고, 관리 후 별도 이동 없이 그대로 쉴 수 있다는 점이 장점입니다. 늦은 시간 이용을 원한다면 심야 방문 가능 여부와 추가 요금을 미리 확인하세요.`,
    `${dongName}에서의 이용은 위치 전달 → 프로그램·시간 선택 → 방문 가능 여부와 비용 확인 → 전화예약 순으로 진행하면 매끄럽습니다. 홈타이는 이동 부담이 적은 대신 관리 공간·타월 등 준비물을 미리 챙겨 두면 좋고, 심야 이용 시 추가 요금도 함께 확인하세요.`,
    `먼저 ${dongName} 위치와 시간대를 정해 문의하면 도착 예정 시간을 안내받을 수 있습니다. 방문(홈타이)은 내 공간으로 관리사가 찾아오는 방식이라 이동이 없는 대신, 준비물과 출입 안내를 예약 단계에서 확인해 두면 진행이 수월합니다.`,
  ]);

  const faqs = [
    {
      q: `${dongName}에서 출장마사지는 어떻게 예약하나요?`,
      a: vpick(vb, "fa1", [
        `전화로 ${dongName}(서울 ${gu.name}) 위치와 원하는 프로그램, 시간을 알리면 방문 가능 여부와 도착 소요 시간을 안내받을 수 있습니다. 비용과 포함 범위도 함께 확인하세요.`,
        `서울 ${gu.name} ${dongName}이라고 알리고 프로그램·시간을 전달하면 도착 예정 시간과 비용을 안내받습니다. 추가 요금 포함 여부도 미리 확인하세요.`,
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
        `출발지와 시간대, ${gu.name} 내 권역에 따라 달라집니다. 정확한 방문 소요 시간은 예약 시 확인하는 것이 좋습니다.`,
        `${dongName}은(는) 출발지와 교통 상황에 따라 도착 시간이 달라집니다. 예약 시 위치를 알리면 예상 소요 시간을 안내받을 수 있습니다.`,
      ]),
    },
  ];

  const secOverview = `
    <h2>${esc(dongName)} 지역 개요</h2>
    <p>${esc(openA)} 인근으로는 ${esc(stationText)} 등이 가까워 이동이 이어지며, ${esc(
    landmarkText
  )} 같은 시설이 생활 권역의 기준점이 됩니다.</p>
    <p>${esc(demand)} 같은 ${esc(gu.name)} 안에서도 ${esc(
    nearText
  )} 등 인접 동과 권역이 맞닿아 있어, 방문 위치를 정확히 알리면 안내가 한결 수월합니다.</p>`;
  const secWho = `
    <h2>${esc(dongName)}에서 출장마사지·홈타이를 찾는 경우</h2>
    <ul>${vsubset(vb, "who", [
      `${gu.name} 안에서 이동 없이 집·숙소에서 편하게 관리받고 싶은 경우`,
      `퇴근 후나 늦은 시간에 ${dongName} 인근에서 이용하고 싶은 경우`,
      `${stationText} 등으로 이동이 잦아 어깨·허리 피로가 누적된 경우`,
      `처음이라 부드러운 스웨디시나 발마사지처럼 부담이 적은 프로그램부터 비교하고 싶은 경우`,
      `${nearText.split("·")[0]} 등 인접 동까지 권역을 두고 ${dongName}을(를) 함께 살펴보려는 경우`,
      `타 지역에서 ${gu.name}을(를) 찾아 숙소에서 방문 관리를 받고 싶은 경우`,
    ], 4).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;
  const secCheck = `
    <h2>${esc(dongName)}에서 이용 시 확인할 점</h2>
    <p>${esc(tip)} 표시된 운영 시간이나 가격은 변동될 수 있으므로, 방문 가능 여부·총 비용·추가 요금은 예약 단계에서 직접 확인하는 것이 좋습니다.</p>
    <ul>${vsubset(vb, "check", [
      `${dongName} 방문 가능 권역과 도착 소요 시간`,
      `원하는 프로그램(스웨디시·아로마·타이마사지 등)과 관리 시간`,
      `표시 가격에 방문비·심야 요금 포함 여부`,
      `관리사 성별 지정 등 추가 요청 가능 여부`,
      `관리 공간·타월 등 준비물`,
      `${gu.name} 내 이동 동선에 따른 방문 시간대`,
    ], 5).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
    ${callout()}`;
  const secCompare = `
    <h2>${esc(dongName)}에서 비교해 볼 관리 방식</h2>
    <p>${esc(comparePara)}</p>
    ${programChips(dongName)}`;
  const secFlow = `
    <h2>${esc(dongName)} 출장마사지·홈타이 이용 흐름</h2>
    <p>${esc(flowPara)}</p>
    <p>${esc(vpick(vb, "flow2", [
      `${dongName}처럼 생활 권역이 형성된 동네는 매장 이용과 방문(홈타이)을 함께 비교하는 경우가 많습니다. 매장 이용이 시설·부대 서비스를 함께 쓰는 방식이라면, 홈타이는 내 공간으로 관리사가 찾아오는 방문 방식이라는 점이 가장 큰 차이입니다.`,
      `${dongName}에서는 시설을 함께 쓰는 매장 이용과, 집·숙소로 받는 홈타이 중에서 목적에 맞게 고르면 됩니다. 홈타이는 이동과 대기가 없는 대신 준비물을 직접 챙겨야 한다는 점이 다릅니다.`,
      `${gu.name} ${dongName} 일대에서는 매장 이용과 홈타이를 함께 저울질하는 경우가 많은데, 핵심 차이는 ‘내가 이동하느냐, 관리사가 방문하느냐’입니다.`,
    ]))} 어떤 방식이 맞을지는 이용 목적과 시간에 따라 달라지므로, 예약 단계에서 준비물·주차·출입 안내와 총 비용을 함께 확인하면 진행이 매끄럽습니다.</p>`;

  const secTips = `
    <h2>${esc(dongName)} 코스·시간대 선택 안내</h2>
    <p>${esc(vpick(vb, "tipA", [
      `처음 ${dongName} 인근에서 이용한다면 60분 코스로 컨디션을 확인한 뒤 뭉침이 심하면 90·120분으로 늘리는 방식이 부담이 적습니다. 코스가 길수록 전신을 천천히 풀 수 있어 피로가 오래 누적된 경우에 적합합니다.`,
      `${dongName}에서는 가볍게 풀고 싶다면 60분, 전신을 고르게 받고 싶다면 90분, 집중 관리가 필요하면 120분 코스가 기준이 됩니다. 원하는 부위와 시간 여유에 맞춰 고르면 선택이 쉬워집니다.`,
      `${gu.name} 일대에서 코스를 고를 때는 ‘오늘 얼마나 풀고 싶은지’를 먼저 정하면 됩니다. 짧게 60분, 표준 90분, 집중 120분으로 나눠 두고 ${dongName} 방문 시간대와 함께 정하면 편합니다.`,
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
  <nav class="breadcrumb container" aria-label="위치">
    <a href="/">홈</a><span>›</span><a href="/region/">지역별 찾기</a><span>›</span><a href="/region/seoul/">서울</a><span>›</span><a href="/region/seoul/${guSlug}/">${esc(
    gu.name
  )}</a><span>›</span>${esc(dongName)}
  </nav>
  <article class="section-tight"><div class="container prose">
    <p class="card-tag" style="color:var(--color-accent);font-weight:700">서울 ${esc(
      gu.name
    )}</p>
    <h1>${esc(dongName)} 출장마사지·홈타이 이용 안내</h1>
    ${secOverview}
    ${middle}

    <h2>${esc(dongName)} 인근 지역</h2>
    <p>같은 ${esc(gu.name)} 내 ${esc(
    nearText
  )} 등 인접 동과 함께 비교하면 방문 권역을 잡기 쉽습니다.</p>
    <div class="link-cloud">
      ${near
        .map(
          (d) =>
            `<a href="/region/seoul/${guSlug}/${gu.dongSlug[d]}/">${esc(d)}</a>`
        )
        .join("")}
      <a href="/region/seoul/${guSlug}/">${esc(gu.name)} 전체</a>
      <a href="/region/seoul/">서울 전체</a>
    </div>

    <h2>자주 묻는 질문</h2>
    <div class="faq">
      ${faqs
        .map(
          (f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`
        )
        .join("\n      ")}
    </div>

    ${authorBox()}
    ${ctaBtn(dongName + " 출장마사지")}
  </div></article>
  ${reviewsSection()}
  ${pricingTable()}`;

  const html = layout({
    ...dongMeta(dongName, "서울", gu.name),
    path,
    body,
    structuredData: [
      faqLd(faqs),
      articleLd({
        headline: `${dongName} 출장마사지·홈타이 이용 안내`,
        description: `${dongName}(서울 ${gu.name}) 출장마사지·홈타이 이용 안내`,
        path,
        modified: MODIFIED,
      }),
      pricingLd(),
    ],
    breadcrumb: [
      { name: "홈", url: "/" },
      { name: "지역별 찾기", url: "/region/" },
      { name: "서울", url: "/region/seoul/" },
      { name: gu.name, url: `/region/seoul/${guSlug}/` },
      { name: dongName, url: path },
    ],
  });
  return { path, file: `region/seoul/${guSlug}/${dongSlug}/index.html`, html };
}

// ---------- 자치구 페이지 ----------
function guPage(gu) {
  const guSlug = gu.slug;
  const path = `/region/seoul/${guSlug}/`;
  const stationText = gu.stations.join("·");
  const landmarkText = gu.landmarks.join("·");

  const dongLinks = gu.dongs
    .map(
      (d) =>
        `<a href="/region/seoul/${guSlug}/${gu.dongSlug[d]}/">${esc(d)}</a>`
    )
    .join("");

  const nm = gu.name;
  const dong1 = gu.dongs[0] || "행정동";
  const vb = "SGU␟서울␟" + nm;

  const faqs = [
    {
      q: `서울 ${nm} 출장마사지는 어떻게 예약하나요?`,
      a: vpick(vb, "fa1", [
        `전화로 ${nm} 내 동네(행정동)와 원하는 프로그램·시간을 알리면 방문 가능 여부와 소요 시간을 안내받을 수 있습니다.`,
        `서울 ${nm}에서는 원하는 행정동과 프로그램·시간을 전화로 알리면 방문 가능 여부와 도착 예정 시간을 안내받을 수 있습니다.`,
      ]),
    },
    {
      q: `${nm}에서 받을 수 있는 프로그램은 무엇인가요?`,
      a: vpick(vb, "fa2", [
        `스웨디시·아로마테라피·타이마사지 등 다양한 프로그램과 집·숙소로 받는 홈타이를 비교할 수 있습니다.`,
        `오일 관리(스웨디시·아로마), 타이마사지, 방문형 홈타이, 부분 관리인 발마사지 등을 ${nm} 기준으로 비교할 수 있습니다.`,
      ]),
    },
    {
      q: `${nm} 어느 동까지 방문이 되나요?`,
      a: vpick(vb, "fa3", [
        `${nm} 내 행정동별로 방문 권역이 다를 수 있습니다. 아래 동 목록에서 해당 동을 확인하고 예약 시 위치를 알리면 됩니다.`,
        `${dong1} 등 ${nm} 내 행정동에 따라 권역이 달라집니다. 원하는 동을 고른 뒤 예약 시 위치를 알리면 방문 가능 여부를 확인할 수 있습니다.`,
      ]),
    },
  ];

  const secFeature = `
    <h2>${esc(nm)} 지역 특징</h2>
    <p>${esc(nm)}은(는) ${esc(gu.character)} ${esc(stationText)} 등으로 이동이 이어지고, ${esc(landmarkText)} 같은 시설이 생활 권역의 기준점이 됩니다.</p>
    <p>${esc(vpick(vb, "feat", [
      `같은 ‘서울 ${nm} 출장마사지’라도 행정동에 따라 방문 권역과 도착 소요 시간이 달라질 수 있어, 원하는 동네를 먼저 고르면 방문 가능 여부와 프로그램을 더 정확히 확인할 수 있습니다.`,
      `${nm}은(는) ${dong1} 등 여러 행정동으로 나뉘어, 어느 동을 먼저 고르느냐에 따라 방문 가능 권역과 도착 시간이 달라집니다.`,
      `서울 ${nm}에서 출장마사지·홈타이를 찾을 때는 행정동별 권역 차이를 먼저 살펴보면 방문 가능 여부를 정확히 좁힐 수 있습니다.`,
    ]))}</p>`;
  const secLife = `
    <h2>${esc(nm)} 주요 생활권과 이동</h2>
    <p>${esc(vpick(vb, "life", [
      `${nm}은(는) ${stationText} 등으로 이동이 이어지고, ${landmarkText} 같은 시설을 중심으로 생활 권역이 형성됩니다. 같은 구 안에서도 권역에 따라 분위기와 이동 동선이 달라, 방문 위치를 정확히 알리면 도착 소요 시간과 방문 가능 여부를 더 정확히 안내받을 수 있습니다.`,
      `${stationText} 등을 축으로 이동이 이어지는 ${nm}은(는) ${landmarkText} 일대를 중심으로 생활권이 묶입니다. 동네마다 동선이 다르니 방문 위치를 정확히 알리면 안내가 빨라집니다.`,
      `${nm}의 생활권은 ${landmarkText} 같은 시설과 ${stationText} 등 교통을 따라 형성됩니다. 같은 구라도 동에 따라 도착 시간이 달라질 수 있어 위치 전달이 중요합니다.`,
    ]))}</p>`;
  const secWho = `
    <h2>${esc(nm)}에서 출장마사지·홈타이 이용이 많은 경우</h2>
    <ul>${vsubset(vb, "who", [
      `매장 방문 없이 집·숙소에서 편하게 관리받고 싶은 경우`,
      `${nm} 안에서 퇴근 후·늦은 시간에 이용하고 싶은 경우`,
      `오래 앉아 일하거나 이동이 잦아 어깨·허리가 뭉친 경우`,
      `처음이라 부드러운 스웨디시·발마사지부터 비교해 보고 싶은 경우`,
      `${dong1} 등 ${nm} 내 여러 동을 두고 권역을 함께 살펴보려는 경우`,
      `타 지역에서 ${nm}을(를) 찾아 숙소에서 방문 관리를 받고 싶은 경우`,
    ], 4).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;
  const secCompare = `
    <h2>${esc(nm)}에서 방문(홈타이)과 매장 이용 비교</h2>
    <p>${esc(vpick(vb, "cmp", [
      `매장 이용이 시설과 부대 서비스를 함께 쓰는 방식이라면, 홈타이는 ${nm} 내 집·숙소로 관리사가 찾아오는 방문 방식입니다. 이동 부담이 적고 관리 후 바로 쉴 수 있는 대신, 관리 공간과 타월 등 준비물을 직접 챙겨야 하므로 예약 시 준비 사항을 확인하는 것이 좋습니다.`,
      `${nm}에서 매장 이용은 부대 시설을 함께 쓸 수 있고, 홈타이는 집·숙소로 받아 이동 없이 바로 쉴 수 있다는 점이 다릅니다. 목적과 시간대에 따라 맞는 방식을 고르면 됩니다.`,
      `홈타이는 ${nm} 인근 집·숙소로 관리사가 방문하는 형태라 이동 부담이 적습니다. 대신 관리 공간·타월 등 준비가 필요하므로 매장 이용과 비교해 예약 전 준비 사항을 확인해 두는 것이 좋습니다.`,
    ]))} 어떤 방식이 맞을지는 이용 목적과 시간, 동행 여부에 따라 달라집니다.</p>`;
  const secDongs = `
    <h2>${esc(nm)} 행정동에서 찾기</h2>
    <p>아래에서 ${esc(nm)}의 행정동을 선택하면 해당 동네의 출장마사지·홈타이 이용 안내를 확인할 수 있습니다. (숫자 행정동은 대표 동명으로 통합해 안내합니다.)</p>
    <div class="link-cloud">${dongLinks}</div>`;
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
    <p>${esc(vpick(vb, "book", [
      `${nm}에서 출장마사지나 홈타이를 예약할 때는 원하는 동네(행정동), 프로그램, 시간을 함께 전달하면 방문 가능 여부와 도착 예정 시간을 안내받을 수 있습니다. 처음 이용한다면 지역 확인 → 프로그램 선택 → 시간·비용 확인 → 전화예약 순서로 진행하면 됩니다.`,
      `${nm} 예약은 원하는 행정동과 프로그램·시간을 전화로 알리는 것에서 시작합니다. 방문 가능 여부와 도착 예정 시간, 총 비용을 함께 확인하면 진행이 매끄럽습니다.`,
      `${nm}에서 처음 예약한다면 ${dong1} 등 동네를 먼저 정하고, 프로그램과 시간을 고른 뒤 비용을 확인하는 순서가 편합니다.`,
    ]))} 표시 가격에 방문비나 심야 추가 요금이 포함되는지, 관리사 성별 지정이 가능한지도 미리 확인해 두면 좋습니다. 안내된 정보는 참고용이며 실제 이용 조건은 예약 과정에서 확정됩니다.</p>`;
  const secCheck = `
    <h2>예약 전 체크리스트</h2>
    <ul>${vsubset(vb, "check", [
      `방문 희망 동네(행정동)와 방문 소요 시간`,
      `원하는 프로그램과 관리 시간`,
      `표시 가격에 방문비·심야 요금 포함 여부`,
      `관리사 성별 지정 등 추가 요청`,
      `관리 공간·타월 등 준비물`,
      `행정동별 방문 가능 권역 차이`,
    ], 5).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;
  const secFaq = `
    <h2>자주 묻는 질문</h2>
    <div class="faq">
      ${faqs
        .map(
          (f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`
        )
        .join("\n      ")}
    </div>`;

  const pre = vshuffle(vb, "preOrder", [secLife, secWho, secCompare]).join("");
  const post = vshuffle(vb, "postOrder", [secPrograms, secBooking, secCheck]).join("");

  const body = `
  <nav class="breadcrumb container" aria-label="위치">
    <a href="/">홈</a><span>›</span><a href="/region/">지역별 찾기</a><span>›</span><a href="/region/seoul/">서울</a><span>›</span>${esc(
    gu.name
  )}
  </nav>
  <article class="section-tight"><div class="container prose">
    <p class="card-tag" style="color:var(--color-accent);font-weight:700">서울특별시</p>
    <h1>서울 ${esc(gu.name)} 출장마사지·홈타이 이용 안내</h1>
    ${secFeature}${pre}
    ${secDongs}
    ${post}${secFaq}

    ${authorBox()}
    ${ctaBtn("서울 " + gu.name + " 출장마사지")}
  </div></article>
  ${reviewsSection()}
  ${pricingTable()}`;

  const html = layout({
    ...branchMeta("서울 " + gu.name, "행정동"),
    path,
    body,
    structuredData: [
      faqLd(faqs),
      articleLd({
        headline: `서울 ${gu.name} 출장마사지·홈타이 이용 안내`,
        description: `서울 ${gu.name} 출장마사지·홈타이 이용 안내`,
        path,
        modified: MODIFIED,
      }),
      pricingLd(),
    ],
    breadcrumb: [
      { name: "홈", url: "/" },
      { name: "지역별 찾기", url: "/region/" },
      { name: "서울", url: "/region/seoul/" },
      { name: gu.name, url: path },
    ],
  });
  return { path, file: `region/seoul/${guSlug}/index.html`, html };
}

// ---------- 서울 광역 페이지 ----------
function seoulOverviewPage() {
  const cards = seoul.districts
    .map(
      (gu) => `<a class="card" href="/region/seoul/${gu.slug}/">
        <h3>${esc(gu.name)}</h3>
        <p>${esc(gu.character.slice(0, 52))}…</p>
      </a>`
    )
    .join("\n        ");

  const body = `
  <nav class="breadcrumb container" aria-label="위치">
    <a href="/">홈</a><span>›</span><a href="/region/">지역별 찾기</a><span>›</span>서울
  </nav>
  <section class="hero"><div class="container">
    <p class="eyebrow">서울특별시</p>
    <h1>서울 출장마사지·홈타이 — 자치구·행정동별 찾기</h1>
    <p>${esc(seoul.intro)}</p>
    <div class="hero-actions">
      <a class="btn btn-gold" href="${site.phoneHref}">📞 전화예약 ${esc(phone)}</a>
      <a class="btn btn-outline" href="/program/">프로그램 보기</a>
    </div>
  </div></section>
  <section class="section"><div class="container">
    <div class="section-head"><span class="eyebrow">서울 25개 자치구</span>
      <h2>자치구를 선택하세요</h2>
      <p>자치구를 고른 뒤 행정동까지 좁혀 가면, 해당 동네의 출장마사지·홈타이 이용 안내를 확인할 수 있습니다.</p>
    </div>
    <div class="grid grid-4">${cards}</div>
  </div></section>
  <section class="section section-alt"><div class="container prose">
    <h2>서울에서 출장마사지·홈타이 찾는 방법</h2>
    <p>서울은 강남·서초·송파 같은 동남권부터 마포·서대문·은평 등 서북권, 노원·도봉·강북 등 동북권까지 자치구별로 생활 권역과 이동 동선이 다릅니다. 먼저 자치구를 고른 뒤 행정동까지 좁혀 가면, 같은 ‘서울 출장마사지’라도 본인 위치에 맞는 방문 권역과 도착 소요 시간을 더 정확히 확인할 수 있습니다.</p>
    <p>관리 방식은 부드러운 오일 관리(스웨디시·아로마테라피), 스트레칭 위주의 타이마사지, 집·숙소로 받는 홈타이, 가벼운 부분 관리(발마사지)로 나눠 비교하면 선택이 쉬워집니다. 숫자로 나뉜 행정동(○○1동·2동 등)은 대표 동명으로 통합해 안내하므로, 원하는 동네 이름으로 바로 찾아볼 수 있습니다.</p>
    ${callout()}
    <h2>자주 묻는 질문</h2>
    <div class="faq">
      <details><summary>서울 어느 지역까지 방문이 되나요?</summary><p>자치구·행정동별로 방문 권역이 다를 수 있습니다. 원하는 동네를 고른 뒤 예약 시 위치를 알리면 방문 가능 여부와 소요 시간을 안내받을 수 있습니다.</p></details>
      <details><summary>서울에서 홈타이도 이용할 수 있나요?</summary><p>홈타이는 집·숙소로 받는 방문 형태의 출장마사지를 뜻하며, 서울 전역에서 방문 가능 권역인지 예약 시 확인하면 됩니다.</p></details>
      <details><summary>예약은 어떻게 하나요?</summary><p>전화로 원하는 자치구·행정동, 프로그램, 시간을 알리면 안내받을 수 있습니다. 전화예약 ${esc(
        phone
      )}.</p></details>
    </div>
    ${authorBox()}
  </div></section>
  ${reviewsSection()}
  ${pricingTable()}`;

  return {
    path: "/region/seoul/",
    file: "region/seoul/index.html",
    html: layout({
      title: `서울 출장마사지·홈타이 자치구·행정동별 찾기 | ${site.name}`,
      description: "서울 25개 자치구와 행정동별 출장마사지·홈타이 이용 안내를 확인하세요.",
      path: "/region/seoul/",
      body,
      structuredData: [pricingLd()],
      breadcrumb: [
        { name: "홈", url: "/" },
        { name: "지역별 찾기", url: "/region/" },
        { name: "서울", url: "/region/seoul/" },
      ],
    }),
  };
}

// 서울 전체 페이지 빌드
export function buildSeoulPages() {
  // 슬러그 사전 계산(구/동, 구 내 중복 방지)
  seoul.slug = "seoul";
  for (const gu of seoul.districts) {
    gu.slug = slugify(gu.name);
    gu.dongSlug = {};
    const used = new Set();
    for (const d of gu.dongs) {
      let sg = slugify(d);
      if (!sg) sg = "dong";
      let base = sg,
        n = 2;
      while (used.has(sg)) sg = base + n++;
      used.add(sg);
      gu.dongSlug[d] = sg;
    }
  }

  const pages = [seoulOverviewPage()];
  for (const gu of seoul.districts) {
    pages.push(guPage(gu));
    for (const d of gu.dongs) pages.push(dongPage(gu, d, gu.dongs));
  }
  return pages;
}
