import { weekRange } from "./period";
import { type ChartLevel } from "./chart";
import { buildSearchString } from "./filters";

export interface BucketDateRange {
  from: string;
  to: string;
}

/**
 * Menghasilkan URL tujuan /transaksi dengan parameter query periode (?from=...&to=...)
 * berdasarkan rentang tanggal bucket. Menggunakan fungsi buildSearchString yang ada.
 */
export function buildBucketTransactionUrl(bucket: BucketDateRange): string {
  const searchStr = buildSearchString({
    from: bucket.from,
    to: bucket.to,
  });
  return `/transaksi${searchStr}`;
}

const MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const MONTH_NAMES_FULL = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAY_NAMES_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function formatUtcYmd(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format nominal Rupiah ringkas untuk sumbu Y.
 * Contoh:
 * 0 -> "0"
 * 500000 -> "500 rb"
 * 1000000 -> "1 jt"
 * 1500000 -> "1,5 jt"
 * 1000000000 -> "1 M"
 */
export function formatRupiahRingkas(value: number): string {
  if (value === 0) return "0";
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";

  if (abs >= 1_000_000_000) {
    const formatted = (abs / 1_000_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    });
    return `${sign}${formatted} M`;
  }
  if (abs >= 1_000_000) {
    const formatted = (abs / 1_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    });
    return `${sign}${formatted} jt`;
  }
  if (abs >= 1_000) {
    const formatted = (abs / 1_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    });
    return `${sign}${formatted} rb`;
  }
  return `${sign}${abs}`;
}

/**
 * Menggeser anchor:
 * - day: +/- 7 hari
 * - week: +/- 1 bulan (jika hari tidak ada di bulan tujuan, pakai hari terakhir bulan tersebut)
 * - month: +/- 1 tahun (29 Feb di tahun kabisat -> 28 Feb di non-kabisat)
 * - year: return anchor persis (tidak ada navigasi)
 */
export function shiftAnchor(
  anchor: string,
  level: ChartLevel,
  direction: "prev" | "next"
): string {
  if (level === "year") return anchor;

  const [yearStr, monthStr, dayStr] = anchor.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (level === "day") {
    const curDate = new Date(Date.UTC(year, month - 1, day));
    const offset = direction === "next" ? 7 : -7;
    curDate.setUTCDate(curDate.getUTCDate() + offset);
    return formatUtcYmd(curDate);
  }

  if (level === "week") {
    const offset = direction === "next" ? 1 : -1;
    const targetMonthIndex = month - 1 + offset;
    const targetDateObj = new Date(Date.UTC(year, targetMonthIndex, 1));
    const targetYear = targetDateObj.getUTCFullYear();
    const targetMonth = targetDateObj.getUTCMonth() + 1;

    // Hari terakhir di bulan target
    const lastDayTarget = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
    const targetDay = Math.min(day, lastDayTarget);

    return `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`;
  }

  if (level === "month") {
    const offset = direction === "next" ? 1 : -1;
    const targetYear = year + offset;
    const lastDayTarget = new Date(Date.UTC(targetYear, month, 0)).getUTCDate();
    const targetDay = Math.min(day, lastDayTarget);

    return `${targetYear}-${String(month).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`;
  }

  return anchor;
}

/**
 * Menghasilkan tanggal awal dari periode tempat anchor berada:
 * - day: tanggal Senin dari minggu anchor
 * - week: tanggal 1 dari bulan anchor
 * - month: tanggal 1 Januari dari tahun anchor
 * - year: "1970-01-01"
 */
export function getPeriodStartDate(anchor: string, level: ChartLevel): string {
  if (level === "day") {
    return weekRange(anchor).from;
  }
  if (level === "week") {
    const [yearStr, monthStr] = anchor.split("-");
    return `${yearStr}-${monthStr}-01`;
  }
  if (level === "month") {
    const [yearStr] = anchor.split("-");
    return `${yearStr}-01-01`;
  }
  return "1970-01-01";
}

/**
 * Memeriksa apakah tombol "Berikutnya" boleh aktif.
 * Nonaktif jika periode berikutnya dimulai SETELAH hari ini WIB (today).
 */
export function canGoNext(anchor: string, level: ChartLevel, today: string): boolean {
  if (level === "year") return false;
  const nextAnchor = shiftAnchor(anchor, level, "next");
  const nextPeriodStart = getPeriodStartDate(nextAnchor, level);
  return nextPeriodStart <= today;
}

/**
 * Menghasilkan label sumbu X untuk bucket:
 * - day: "Sen 16" (singkatan hari dan tanggal)
 * - week: "1–2 Nov" (jika satu hari: "1 Nov")
 * - month: "Jan" sampai "Des"
 * - year: "2026"
 */
export function formatBucketLabel(
  from: string,
  to: string,
  level: ChartLevel
): string {
  const [fromY, fromMStr, fromDStr] = from.split("-");
  const [, toMStr, toDStr] = to.split("-");

  const fromMonth = parseInt(fromMStr, 10);
  const fromDay = parseInt(fromDStr, 10);
  const toMonth = parseInt(toMStr, 10);
  const toDay = parseInt(toDStr, 10);

  if (level === "day") {
    const date = new Date(Date.UTC(parseInt(fromY, 10), fromMonth - 1, fromDay));
    const dayOfWeek = date.getUTCDay();
    const dayName = DAY_NAMES_SHORT[dayOfWeek];
    return `${dayName} ${fromDay}`;
  }

  if (level === "week") {
    if (from === to) {
      const monthName = MONTH_NAMES_SHORT[fromMonth - 1];
      return `${fromDay} ${monthName}`;
    }
    if (fromMonth === toMonth) {
      const monthName = MONTH_NAMES_SHORT[fromMonth - 1];
      return `${fromDay}–${toDay} ${monthName}`;
    }
    // Jika lewat batas bulan (meskipun dalam 1 bulan kalender sudah dipotong, jika lintas bulan ditampilkan keduanya)
    const fromMName = MONTH_NAMES_SHORT[fromMonth - 1];
    const toMName = MONTH_NAMES_SHORT[toMonth - 1];
    return `${fromDay} ${fromMName} – ${toDay} ${toMName}`;
  }

  if (level === "month") {
    return MONTH_NAMES_SHORT[fromMonth - 1];
  }

  if (level === "year") {
    return fromY;
  }

  return from;
}

/**
 * Menghasilkan judul periode:
 * - day: "16–22 Nov 2026" (jika melewati bulan: "30 Nov – 6 Des 2026", jika melewati tahun: "28 Des 2026 – 3 Jan 2027")
 * - week: "November 2026"
 * - month: "2026"
 * - year: "Semua tahun"
 */
export function formatPeriodTitle(anchor: string, level: ChartLevel): string {
  if (level === "year") {
    return "Semua tahun";
  }

  const [yearStr, monthStr] = anchor.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  if (level === "month") {
    return `${year}`;
  }

  if (level === "week") {
    const monthName = MONTH_NAMES_FULL[month - 1];
    return `${monthName} ${year}`;
  }

  if (level === "day") {
    const fullWeek = weekRange(anchor);
    const [fromYStr, fromMStr, fromDStr] = fullWeek.from.split("-");
    const [toYStr, toMStr, toDStr] = fullWeek.to.split("-");

    const fromY = parseInt(fromYStr, 10);
    const fromM = parseInt(fromMStr, 10);
    const fromD = parseInt(fromDStr, 10);

    const toY = parseInt(toYStr, 10);
    const toM = parseInt(toMStr, 10);
    const toD = parseInt(toDStr, 10);

    if (fromY !== toY) {
      const fromMName = MONTH_NAMES_SHORT[fromM - 1];
      const toMName = MONTH_NAMES_SHORT[toM - 1];
      return `${fromD} ${fromMName} ${fromY} – ${toD} ${toMName} ${toY}`;
    }

    if (fromM !== toM) {
      const fromMName = MONTH_NAMES_SHORT[fromM - 1];
      const toMName = MONTH_NAMES_SHORT[toM - 1];
      return `${fromD} ${fromMName} – ${toD} ${toMName} ${fromY}`;
    }

    const monthName = MONTH_NAMES_SHORT[fromM - 1];
    return `${fromD}–${toD} ${monthName} ${fromY}`;
  }

  return anchor;
}
