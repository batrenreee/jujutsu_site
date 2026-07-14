import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(ROOT, "data", "live-news.json");
const MAX_ITEMS = 30;
const RETENTION_DAYS = 180;

const SOURCES = [
  {
    name: "Crunchyroll News",
    url: "https://cr-news-api-service.prd.crunchyrollsvc.com/v1/en-US/rss",
    hosts: ["crunchyroll.com", "www.crunchyroll.com"],
  },
  {
    name: "Anime News Network",
    url: "https://www.animenewsnetwork.com/all/rss.xml?ann-edition=us",
    hosts: ["animenewsnetwork.com", "www.animenewsnetwork.com", "animenewsnetwork.org", "www.animenewsnetwork.org"],
  },
  {
    name: "MyAnimeList News",
    url: "https://myanimelist.net/rss/news.xml",
    hosts: ["myanimelist.net", "www.myanimelist.net"],
  },
];

const ENTITY_MAP = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };

function decode(value = "") {
  return value
    .replace(/^<!\[CDATA\[|\]\]>$/g, "")
    .replace(/&#(x?[0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code.replace(/^x/i, ""), /^x/i.test(code) ? 16 : 10)))
    .replace(/&([a-z]+);/gi, (full, name) => ENTITY_MAP[name.toLowerCase()] ?? full)
    .trim();
}

function stripHtml(value = "") {
  return decode(value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block, name) {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match ? decode(match[1]) : "";
}

function classify(text) {
  if (/game|oyun|surviv|console|mobile/i.test(text)) return "Oyun";
  if (/manga|chapter|volume|cilt|comic/i.test(text)) return "Manga";
  if (/event|festival|expo|anniversary|collab|campaign|cafe|pop.?up|etkinlik/i.test(text)) return "Etkinlik";
  if (/figure|merch|blu.?ray|bd.?dvd|goods|ürün/i.test(text)) return "Ürün";
  return "Anime";
}

function fallbackImage(category) {
  return {
    Anime: "img/characters/gojo.webp",
    Manga: "img/characters/yuta.webp",
    Oyun: "img/characters/yuji.webp",
    Etkinlik: "img/characters/nobara.webp",
    Ürün: "img/characters/megumi.webp",
  }[category] || "img/opening.jpg";
}

function stableId(url) {
  return `live-${createHash("sha256").update(url).digest("hex").slice(0, 14)}`;
}

function isAllowedUrl(rawUrl, hosts) {
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === "https:" && hosts.includes(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function parseFeed(xml, source) {
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];
  return blocks.flatMap((block) => {
    const title = stripHtml(tag(block, "title"));
    const description = stripHtml(tag(block, "description") || tag(block, "content:encoded"));
    const link = stripHtml(tag(block, "link") || tag(block, "guid"));
    // Başka bir yapımın haberinde yalnızca öneri/bağlantı olarak geçen JJK ifadelerini alma.
    if (!/jujutsu\s*kaisen|呪術廻戦/i.test(title)) return [];
    if (!isAllowedUrl(link, source.hosts)) return [];

    const parsedDate = new Date(tag(block, "pubDate") || tag(block, "dc:date"));
    if (Number.isNaN(parsedDate.getTime())) return [];
    const category = classify(`${title} ${description}`);
    const date = parsedDate.toISOString().slice(0, 10);
    const originalSummary = description.slice(0, 520);
    return [{
      id: stableId(link),
      title: title.slice(0, 180),
      date,
      publishedAt: parsedDate.toISOString(),
      category,
      source: source.name,
      img: fallbackImage(category),
      excerpt: `${source.name}, Jujutsu Kaisen ile ilgili yeni bir gelişme yayımladı. Ayrıntıları kaynak sayfasından doğrulayabilirsin.`,
      readTime: Math.max(1, Math.min(4, Math.ceil(originalSummary.split(/\s+/).length / 120))),
      popularity: Math.max(35, 90 - Math.floor((Date.now() - parsedDate.getTime()) / 86400000)),
      url: link,
      auto: true,
      content: [
        `${source.name}, bu Jujutsu Kaisen gelişmesini ${new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(parsedDate)} tarihinde yayımladı.`,
        originalSummary ? `Kaynağın özgün özeti: ${originalSummary}` : "Kaynak bu gelişme için kısa bir duyuru yayımladı.",
        "Bu madde otomatik canlı haber akışından alınmıştır. En güncel ve eksiksiz bilgi için aşağıdaki resmî kaynak düğmesini kullan.",
      ],
      highlights: ["Otomatik canlı akış", source.name, "Kaynak bağlantısı doğrulandı"],
    }];
  });
}

async function fetchSource(source) {
  const response = await fetch(source.url, {
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.1",
      "User-Agent": "JJKMerkezFeed/1.0 (+https://github.com/batrenreee/jujutsu_site)",
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`${source.name}: HTTP ${response.status}`);
  return parseFeed(await response.text(), source);
}

async function readCurrent() {
  try {
    const parsed = JSON.parse(await readFile(OUTPUT, "utf8"));
    return parsed && Array.isArray(parsed.items) ? parsed : { items: [] };
  } catch {
    return { items: [] };
  }
}

const current = await readCurrent();
const results = await Promise.allSettled(SOURCES.map(fetchSource));
const successes = results.filter((result) => result.status === "fulfilled");
if (!successes.length) {
  throw new Error(results.map((result) => result.reason?.message).filter(Boolean).join(" | ") || "Hiçbir haber kaynağına erişilemedi.");
}

for (const result of results) {
  if (result.status === "rejected") console.warn(result.reason?.message || result.reason);
}

const discovered = successes.flatMap((result) => result.value);
const cutoff = Date.now() - RETENTION_DAYS * 86400000;
const merged = [...discovered, ...current.items]
  .filter((item) => /jujutsu\s*kaisen|呪術廻戦/i.test(item.title))
  .filter((item) => new Date(item.publishedAt || `${item.date}T12:00:00Z`).getTime() >= cutoff)
  .filter((item, index, all) => all.findIndex((candidate) => candidate.url === item.url) === index)
  .sort((a, b) => new Date(b.publishedAt || b.date) - new Date(a.publishedAt || a.date))
  .slice(0, MAX_ITEMS);

const unchanged = JSON.stringify(current.items || []) === JSON.stringify(merged);
if (unchanged) {
  console.log(`Canlı akış güncel: ${merged.length} haber, değişiklik yok.`);
} else {
  const payload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    sources: SOURCES.map(({ name, url }) => ({ name, url })),
    items: merged,
  };
  await writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Canlı akış yazıldı: ${discovered.length} bulundu, ${merged.length} saklandı.`);
}
