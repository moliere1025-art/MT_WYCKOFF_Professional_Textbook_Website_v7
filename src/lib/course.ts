import courseData from "../data/course.json";

export type CourseBlock = {
  type: "paragraph" | "heading" | "list" | "image" | "table" | "caption" | "eyebrow";
  text?: string;
  level?: number;
  id?: string;
  ordered?: boolean;
  items?: string[];
  src?: string;
  width?: number;
  height?: number;
  caption?: string;
  alt?: string;
  rows?: string[][];
};

export type Chapter = {
  number: number;
  slug: string;
  phase: number;
  marker: string;
  title: string;
  blocks: CourseBlock[];
};

export type Phase = {
  number: number;
  roman: string;
  slug: string;
  title: string;
  english: string;
  chapters: number[];
  statement: string;
  chapterCount: number;
};

export type ChapterSection = {
  id: string;
  title: string;
  blocks: Array<CourseBlock & { anchor: string; blockIndex: number }>;
  layout: EditorialRole;
};

export type EditorialRole =
  | "narrative"
  | "plate"
  | "comparison"
  | "sequence"
  | "protocol"
  | "case"
  | "synthesis";

export type ChapterDirection = {
  slug: string;
  label: string;
  emphasis: "text" | "image" | "comparison" | "process" | "data";
};

const chapterDirectionMap: Record<number, ChapterDirection> = {
  1: { slug: "argument", label: "Evidence discipline", emphasis: "text" },
  2: { slug: "atlas", label: "Price · volume · time", emphasis: "image" },
  3: { slug: "triad", label: "Three laws", emphasis: "image" },
  4: { slug: "tape", label: "Wave reading", emphasis: "process" },
  5: { slug: "structure", label: "Market position", emphasis: "image" },
  6: { slug: "selection", label: "Relative selection", emphasis: "comparison" },
  7: { slug: "range", label: "Boundary testing", emphasis: "image" },
  8: { slug: "count", label: "Cause estimation", emphasis: "data" },
  9: { slug: "proof", label: "Accumulation proof", emphasis: "process" },
  10: { slug: "chronology", label: "Stopping action", emphasis: "process" },
  11: { slug: "ledger", label: "Supply record", emphasis: "data" },
  12: { slug: "spring", label: "Competing paths", emphasis: "comparison" },
  13: { slug: "dossier", label: "Direction proof", emphasis: "image" },
  14: { slug: "exhaustion", label: "Markup termination", emphasis: "process" },
  15: { slug: "upthrust", label: "Breakout verdict", emphasis: "comparison" },
  16: { slug: "markdown", label: "Weakness sequence", emphasis: "process" },
  17: { slug: "continuation", label: "Continuation range", emphasis: "comparison" },
  18: { slug: "uncertainty", label: "State migration", emphasis: "process" },
  19: { slug: "decision", label: "Entry construction", emphasis: "process" },
  20: { slug: "risk", label: "Risk arithmetic", emphasis: "data" },
  21: { slug: "execution", label: "Multi-frame execution", emphasis: "process" },
  22: { slug: "mapping", label: "Market mapping", emphasis: "comparison" },
  23: { slug: "research", label: "Research protocol", emphasis: "data" },
  24: { slug: "governance", label: "Portfolio governance", emphasis: "data" }
};

/*
 * Editorial direction is assigned to actual course sections. These are not
 * inferred from block length or media presence: the sets encode the visual
 * role chosen after reading the chapter argument.
 */
const plateSections = new Set([
  "1.2", "1.5", "2.2", "2.4", "2.7", "2.10", "3.2", "3.5", "3.7", "3.9",
  "4.2", "4.3", "4.4", "5.2", "5.3", "7.2", "7.3", "7.6", "8.2", "8.3",
  "10.1", "10.2", "10.3", "10.4", "11.2", "11.3", "11.4", "12.1", "12.2",
  "12.3", "13.2", "13.3", "13.4", "13.5", "13.10", "14.2", "14.3", "14.4",
  "15.2", "15.3", "15.4", "16.1", "16.2", "16.3", "17.4", "18.3", "21.1",
  "21.7", "24.7"
]);

const comparisonSections = new Set([
  "1.4", "1.6", "2.8", "2.9", "2.11", "2.12", "3.4", "3.8", "3.10",
  "3.11", "4.5", "4.6", "5.5", "5.6", "6.2", "6.3", "6.4", "6.5", "6.6",
  "7.5", "7.7", "7.8", "8.5", "8.7", "9.3", "9.4", "9.7", "10.7", "10.8",
  "10.10", "11.8", "11.9", "12.4", "12.8", "12.10", "13.2.5", "13.7",
  "13.8", "13.11", "13.12", "14.6", "14.7", "14.8", "15.6", "15.7", "15.8",
  "15.9", "16.5", "16.7", "16.8", "16.9", "16.10", "17.2", "17.3", "17.7",
  "17.9", "18.2", "18.5", "18.7", "18.10", "19.2", "19.3", "19.4", "19.5",
  "19.9", "20.1", "20.4", "20.5", "20.7", "21.2", "21.8", "22.2", "22.3",
  "22.4", "22.5", "22.9", "23.9", "23.10", "24.1", "24.8"
]);

const sequenceSections = new Set([
  "1.3", "2.1", "2.3", "2.5", "2.6", "2.13", "2.14", "2.15", "3.1", "3.3",
  "3.6", "4.1", "4.7", "4.8", "4.9", "5.1", "5.4", "5.7", "7.1", "7.4",
  "7.9", "8.1", "8.6", "9.2", "9.5", "9.6", "9.8", "9.9", "9.10", "10.5",
  "10.6", "10.9", "10.11", "11.1", "11.5", "11.6", "11.7", "11.10", "11.11",
  "12.5", "12.6", "12.7", "12.9", "12.11", "13.1", "13.6", "13.9", "13.11.2",
  "13.11.3", "13.12.1", "13.12.2", "13.12.3", "13.12.4", "13.13", "14.1",
  "14.5", "14.9", "14.10", "15.1", "15.5", "15.10", "16.4", "16.6", "16.11",
  "17.1", "17.5", "17.6", "17.8", "17.10", "18.1", "18.4", "18.6", "18.8",
  "18.9", "18.11", "18.12", "19.1", "19.7", "19.8", "19.10", "19.11",
  "20.6", "20.9", "20.10", "20.11", "21.3", "21.4", "21.5", "21.6", "21.9",
  "21.10", "21.11", "22.1", "22.6", "22.7", "22.8", "22.10", "22.11",
  "23.5", "23.6", "23.8", "23.11", "24.2", "24.3", "24.4", "24.5", "24.9",
  "24.10", "24.11"
]);

const protocolSections = new Set([
  "1.7", "2.16", "3.12", "3.13", "4.8", "6.1", "6.7", "8.4", "8.8", "8.9",
  "9.11", "12.5", "13.4.2", "13.4.3", "13.4.4", "13.9", "13.11.1", "18.6",
  "18.8", "18.9", "19.6", "20.2", "20.3", "20.8", "21.3", "21.5", "22.8",
  "23.1", "23.2", "23.3", "23.4", "23.5", "23.6", "23.7", "24.2", "24.3",
  "24.5", "24.6", "24.9", "24.10"
]);

const roleLabels: Record<EditorialRole, string> = {
  narrative: "ARGUMENT",
  plate: "EVIDENCE PLATE",
  comparison: "COMPETING READS",
  sequence: "SEQUENCE",
  protocol: "METHOD / RECORD",
  case: "CASE FILE",
  synthesis: "SYNTHESIS"
};

export const course = courseData as typeof courseData & {
  phases: Phase[];
  chapters: Chapter[];
};

export function padChapter(number: number) {
  return String(number).padStart(2, "0");
}

export function getChapter(number: number) {
  return course.chapters.find((chapter) => chapter.number === number);
}

export function getPhase(number: number) {
  return course.phases.find((phase) => phase.number === number);
}

export function getPhaseChapters(phase: Phase) {
  return phase.chapters.map((number) => getChapter(number)).filter(Boolean) as Chapter[];
}

export function getChapterDirection(number: number): ChapterDirection {
  return chapterDirectionMap[number] || { slug: "argument", label: "Editorial reading", emphasis: "text" };
}

export function getEditorialRoleLabel(role: EditorialRole) {
  return roleLabels[role];
}

function getSectionNumber(title: string) {
  return title.match(/^(\d+\.\d+(?:\.\d+)?)/)?.[1];
}

function getEditorialRole(title: string): EditorialRole {
  if (/^案例\b|^案例[　\s]/.test(title)) return "case";
  if (/本章小结|阶段重点总结|整合专题|完整示范|学习重点|延伸阅读|主要参考文献/.test(title)) return "synthesis";

  const sectionNumber = getSectionNumber(title);
  if (!sectionNumber) return "narrative";
  if (protocolSections.has(sectionNumber)) return "protocol";
  if (comparisonSections.has(sectionNumber)) return "comparison";
  if (plateSections.has(sectionNumber)) return "plate";
  if (sequenceSections.has(sectionNumber)) return "sequence";

  // The remaining numbered sections are intentionally text-led arguments.
  // Chapter direction still changes their typography and surrounding rhythm.
  return "narrative";
}

export function chapterPartForSection(chapterNumber: number, title: string) {
  const number = getSectionNumber(title);
  if (chapterNumber === 13) {
    if (number === "13.1") return { number: "I", title: "方向证明", note: "从候选、结果质量到区间外接受" };
    if (number === "13.4") return { number: "II", title: "供应检验", note: "LPS、Back-up 与旧阻力转换" };
    if (number === "13.7") return { number: "III", title: "可交易的结论", note: "跨市场、跨周期与完整裁决" };
  }
  if (chapterNumber === 21) {
    if (number === "21.1") return { number: "I", title: "分析框架", note: "背景、决策与执行的职责边界" };
    if (number === "21.3") return { number: "II", title: "执行", note: "订单、新闻与计划外波动" };
    if (number === "21.5") return { number: "III", title: "交易后管理", note: "日志、错误分类与新证据" };
    if (/第五阶段完整示范/.test(title)) return { number: "IV", title: "完整示范", note: "从裸图判断到交易计划与复盘" };
  }
  if (chapterNumber === 8 && /第二阶段整合专题/.test(title)) {
    return { number: "II", title: "整合专题", note: "五步法与九项买卖测试" };
  }
  return undefined;
}

export function estimateReadingTime(chapter: Chapter) {
  const characters = chapter.blocks.reduce((total, block) => {
    if (block.text) return total + block.text.length;
    if (block.items) return total + block.items.join("").length;
    if (block.rows) return total + block.rows.flat().join("").length;
    return total;
  }, 0);
  return Math.max(8, Math.round(characters / 330));
}

export function chapterIntro(chapter: Chapter) {
  const firstHeading = chapter.blocks.findIndex((block) => block.type === "heading" && block.level === 2);
  const end = firstHeading === -1 ? Math.min(3, chapter.blocks.length) : firstHeading;
  return chapter.blocks.slice(0, end).filter((block) => block.type === "paragraph");
}

export function chapterSections(chapter: Chapter): ChapterSection[] {
  const introEnd = chapter.blocks.findIndex((block) => block.type === "heading" && block.level === 2);
  const start = introEnd < 0 ? 0 : introEnd;
  const sections: ChapterSection[] = [];
  let current: ChapterSection | undefined;

  chapter.blocks.slice(start).forEach((block, offset) => {
    const blockIndex = start + offset;
    const fallbackAnchor = `c${chapter.number}-b${String(blockIndex).padStart(3, "0")}`;
    const anchor = block.id || fallbackAnchor;

    if (block.type === "heading" && block.level === 2) {
      current = {
        id: anchor,
        title: block.text || `第 ${sections.length + 1} 节`,
        blocks: [],
        layout: getEditorialRole(block.text || "")
      };
      sections.push(current);
      return;
    }

    if (!current) {
      current = {
        id: `c${chapter.number}-opening`,
        title: "本章导入",
        blocks: [],
        layout: "narrative"
      };
      sections.push(current);
    }

    current.blocks.push({ ...block, anchor, blockIndex });
  });

  return sections;
}

export function chapterKeywords(chapter: Chapter) {
  const terms = new Set<string>();
  const pattern = /\b(?:Wyckoff|Spring|Shakeout|Test|SOS|LPS|UTAD|UT|SOW|LPSY|Cause|Effect|Mark-up|Mark-down|Markup|Markdown|Accumulation|Distribution|Effort|Result|Phase\s+[A-E]|Trading Range|Point and Figure|Tape Reading)\b/gi;
  for (const block of chapter.blocks) {
    const text = block.text || block.items?.join(" ") || "";
    for (const match of text.matchAll(pattern)) terms.add(match[0]);
    if (terms.size >= 6) break;
  }
  return [...terms].slice(0, 6);
}

export function chapterNeighbors(chapter: Chapter) {
  return {
    previous: getChapter(chapter.number - 1),
    next: getChapter(chapter.number + 1)
  };
}
