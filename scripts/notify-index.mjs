#!/usr/bin/env node
/**
 * IndexNow 즉시 색인 통보 (Node, 의존성 0) — 빙·네이버·얀덱스 등 IndexNow 참여 엔진에
 * 사이트 URL을 한 번에 통보한다. CI(Node 전용)에서도 그대로 돌아가도록 fetch만 사용.
 * (구글은 IndexNow 미참여 → tools/google_indexing.py 참고)
 *
 * 사용법:
 *   node scripts/notify-index.mjs                      # dist/sitemap.xml 의 모든 URL
 *   node scripts/notify-index.mjs /outcall/ /guide/    # 특정 경로만(글 올릴 때마다)
 *   SITE_URL=https://example.com node scripts/notify-index.mjs
 *
 * 전제: 키 파일이 도메인 루트에 게시되어 있어야 함 → https://<HOST>/<KEY>.txt
 *       (빌드 시 dist/<KEY>.txt 로 자동 생성 → 배포하면 충족)
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../data/site.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITEMAP = join(__dirname, "..", "dist", "sitemap.xml");

const BASE = (process.env.SITE_URL || site.baseUrl).replace(/\/$/, "");
const HOST = process.env.HOST || new URL(BASE).host;
const SCHEME = process.env.SCHEME || new URL(BASE).protocol.replace(":", "");
const KEY = process.env.INDEXNOW_KEY || "b00508e375ed8ff4e993dc41ca0b8c4a";
const KEY_LOCATION = `${SCHEME}://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow"; // 참여 엔진 전체로 자동 분배
const BATCH = 10000; // IndexNow 1회 최대 10,000 URL

const toAbs = (a) =>
  a.startsWith("http") ? a : `${SCHEME}://${HOST}${a.startsWith("/") ? a : "/" + a}`;

async function urlsFromSitemap() {
  if (!existsSync(SITEMAP)) {
    console.error(`✗ 사이트맵 없음: ${SITEMAP}\n  먼저 \`npm run build\` 를 실행하세요.`);
    process.exit(1);
  }
  const xml = await readFile(SITEMAP, "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function submit(urlList) {
  const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList });
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body,
    });
    return { status: res.status, text: await res.text().catch(() => "") };
  } catch (e) {
    return { status: 0, text: String(e) };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const urls = args.length ? args.map(toAbs) : await urlsFromSitemap();

  console.log(`→ IndexNow 통보: ${urls.length}개 URL  (host=${HOST}, key=${KEY.slice(0, 8)}…)`);
  let ok = 0;
  for (let i = 0; i < urls.length; i += BATCH) {
    const chunk = urls.slice(i, i + BATCH);
    const { status, text } = await submit(chunk);
    const label = { 200: "성공", 202: "수락됨" }[status] || `응답 ${status}`;
    console.log(`  배치 ${Math.floor(i / BATCH) + 1}: ${chunk.length}개 → ${label}`);
    if (status === 200 || status === 202) ok += chunk.length;
    else if (text) console.log(`    ↳ ${text.slice(0, 200)}`);
  }
  console.log(`✓ 완료: ${ok}/${urls.length}개 통보`);
  if (ok === 0) {
    console.log("  키 파일이 도메인 루트에 게시됐는지 확인하세요 →", KEY_LOCATION);
    process.exitCode = 1;
  }
}

main();
