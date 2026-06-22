// 사이트 전역 설정 및 비즈니스 정보 (E-E-A-T 신뢰 신호 포함)
export const site = {
  name: "겟마사지",
  legalName: "겟마사지 출장마사지 안내",
  tagline: "전국 출장마사지·홈타이 정보 안내 플랫폼",
  // 검색 색인용 기본 도메인 (배포 시 환경변수 SITE_URL 로 교체 가능)
  baseUrl: process.env.SITE_URL || "https://getmassages.com",
  phone: "0508-202-4719",
  phoneHref: "tel:0508-202-4719",
  email: "help@getmassages.com",
  locale: "ko_KR",
  // E-E-A-T: 책임 저자/검수자 정보
  author: {
    name: "겟마사지 편집팀",
    role: "출장마사지 정보 에디터",
    reviewer: "이용 안내 검수 담당",
    bio: "겟마사지 편집팀은 전국 출장마사지·홈타이 업체 정보를 직접 확인·정리하고, 이용자 문의를 바탕으로 안내 기준을 업데이트합니다.",
  },
  // 편집/운영 정책 공개 (구글 뉴스/E-E-A-T 신호)
  editorialPolicy:
    "겟마사지는 광고성 문구 대신 이용자가 예약 전 확인해야 할 실제 기준을 안내합니다. 모든 가격·운영 정보는 변동될 수 있으므로 예약 전 업체에 직접 확인하도록 권장합니다.",
  social: {},
};

// 상단 메뉴 (홈타이 단독 메뉴 없음)
export const primaryNav = [
  { label: "홈", url: "/" },
  { label: "출장마사지", url: "/outcall/" },
  { label: "지역별 찾기", url: "/region/", mega: "region" },
  { label: "지하철역별 찾기", url: "/subway/" },
  { label: "마사지 프로그램", url: "/program/", mega: "program" },
  { label: "예약 가이드", url: "/guide/" },
  { label: "이용 안내", url: "/about/" },
  { label: "문의하기", url: "/contact/" },
];

// 마사지 프로그램 메가메뉴 (PC 4열 / 모바일 아코디언)
export const programMenu = [
  {
    group: "관리 프로그램",
    items: [
      { label: "스웨디시", slug: "swedish" },
      { label: "타이마사지", slug: "thai-massage" },
      { label: "아로마테라피", slug: "aroma-therapy" },
      { label: "로미로미", slug: "lomi-lomi" },
      { label: "중국마사지", slug: "chinese-massage" },
      { label: "발마사지", slug: "foot-massage" },
      { label: "스포츠&경락", slug: "sports-kyunglak" },
      { label: "스킨케어", slug: "skin-care" },
      { label: "왁싱", slug: "waxing" },
    ],
  },
  {
    group: "방문·이용 방식",
    items: [
      { label: "홈타이", slug: "home-care" },
      { label: "스파/사우나", slug: "spa-sauna" },
      { label: "호텔식마사지", slug: "hotel-style-massage" },
      { label: "수면가능", slug: "rest-available" },
      { label: "24시간", slug: "24-hour" },
      { label: "1인샵/2인샵", slug: "private-shop" },
    ],
  },
  {
    group: "대상·관리사 기준",
    items: [
      { label: "남성전용", slug: "men-only" },
      { label: "여성전용", slug: "women-only" },
      { label: "남자관리사", slug: "male-therapist" },
      { label: "커플환영", slug: "couple-friendly" },
    ],
  },
  {
    group: "추천·혜택",
    items: [
      { label: "신규업소", slug: "new-shops" },
      { label: "할인업소", slug: "discount-shops" },
      { label: "두리코스", slug: "duri-course" },
    ],
  },
];

// 프로그램 slug -> label 빠른 조회
export const programLabelBySlug = Object.fromEntries(
  programMenu.flatMap((g) => g.items.map((i) => [i.slug, i.label]))
);
