"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  COURSES,
  COURSE_CATEGORIES,
  durationText,
  levelBadge,
  type Course,
  type CourseCategory,
} from "@/lib/courses";

const CAT_ICONS: Record<CourseCategory, string> = {
  "Основы МГТ": "🌸",
  "Диагностика перед назначением": "🔬",
  "Абсолютные и относительные противопоказания": "🚨",
  "Препараты и схемы терапии": "💊",
  "Онко-наблюдение и безопасность": "🩺",
  "Разбор клинических случаев": "📋",
};

export default function CoursesPage() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<"all" | CourseCategory>("all");

  const filtered = useMemo(() => {
    let list = COURSES as Course[];
    if (cat !== "all") list = list.filter((c) => c.category === cat);
    if (query.trim().length > 0) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [cat, query]);

  const totalPrice = COURSES.reduce((s, c) => s + c.priceRub, 0);
  const bundlePrice = Math.round(totalPrice * 0.62);
  const bundleHours = Math.round(
    COURSES.reduce((s, c) => s + c.durationMin, 0) / 60
  );

  return (
    <main
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        minHeight: "100vh",
        color: "#0f172a",
        background:
          "linear-gradient(180deg, #effaf6 0%, #ffffff 35%, #fef2f2 100%)",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 24px 64px" }}>
        <NavRow />

        {/* HERO */}
        <section
          style={{
            marginTop: 28,
            padding: "44px 40px",
            borderRadius: 28,
            background:
              "linear-gradient(120deg, #0f766e 0%, #0ea5e9 60%, #ec4899 100%)",
            color: "#fff",
            boxShadow: "0 10px 40px rgba(15,118,110,0.25)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(900px 260px at 90% -10%, rgba(255,255,255,0.35), transparent 60%)",
            }}
          />
          <div style={{ position: "relative", maxWidth: 760 }}>
            <div
              style={{
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.18)",
                fontSize: 13,
                fontWeight: 700,
                backdropFilter: "blur(4px)",
                marginBottom: 16,
              }}
            >
              🩺 Курс для врачей и пациентов · Актуально по ESHRE 2024
            </div>
            <h1
              style={{
                fontSize: 40,
                margin: 0,
                lineHeight: 1.05,
                fontWeight: 800,
                letterSpacing: -0.5,
              }}
            >
              МГТ с нуля до клинической практики — 25 лекций + чат с ИИ-помощником
            </h1>
            <p
              style={{
                fontSize: 17,
                marginTop: 14,
                opacity: 0.92,
                lineHeight: 1.5,
              }}
            >
              6 тематических блоков: от основ физиологии менопаузы и 24 вопросов
              чекапа до разбора клинических случаев. После каждой лекции —
              PDF-конспект и 7 дней чата с ИИ ассистентом по пройденной теме.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
              <Stat label="Лекций" value="25" />
              <Stat label="Часов контента" value={String(bundleHours)} />
              <Stat label="Категорий" value="6" />
              <Stat label="Доступ" value="бессрочный" />
            </div>

            <div
              style={{
                marginTop: 28,
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Link
                href="#catalog"
                style={btnPrimary("#fff", "#0f172a")}
              >
                📚 Смотреть каталог ↓
              </Link>
              <a href="#buy" style={btnGhost("#fff")}>
                Купить весь курс за {formatRub(bundlePrice)}{" "}
                <span style={{ opacity: 0.65 }}>(вместо {formatRub(totalPrice)})</span>
              </a>
            </div>
          </div>
        </section>

        {/* SEARCH + FILTERS */}
        <section id="catalog" style={{ marginTop: 36 }}>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <h2 style={{ fontSize: 26, margin: 0, fontWeight: 800 }}>
              Каталог из {COURSES.length} лекций
            </h2>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="🔍 Найти: Маммография, РМЖ, Терапевтическое окно…"
              style={{
                minWidth: 320,
                padding: "12px 16px",
                borderRadius: 14,
                border: "1px solid #cbd5e1",
                fontSize: 15,
                outline: "none",
                background: "#fff",
                boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
              }}
            />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            <Chip
              active={cat === "all"}
              onClick={() => setCat("all")}
              label={`Все · ${COURSES.length}`}
              color="#334155"
            />
            {COURSE_CATEGORIES.map((c) => (
              <Chip
                key={c.key}
                active={cat === c.key}
                onClick={() => setCat(c.key)}
                label={`${CAT_ICONS[c.key]} ${c.key} · ${COURSES.filter((x) => x.category === c.key).length}`}
                color={c.color}
              />
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 18,
            }}
          >
            {filtered.map((c) => (
              <CourseCard key={c.slug} c={c} />
            ))}
            {filtered.length === 0 && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  padding: 60,
                  borderRadius: 20,
                  background: "#fff",
                  border: "1px dashed #cbd5e1",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                Ничего не найдено по запросу «{query}».
              </div>
            )}
          </div>
        </section>

        {/* BUNDLE */}
        <section
          id="buy"
          style={{
            marginTop: 44,
            padding: "36px 36px",
            borderRadius: 28,
            background: "#fff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 12px 40px rgba(15,23,42,0.06)",
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 28,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: 999,
                background: "#ecfdf5",
                color: "#065f46",
                fontWeight: 800,
                fontSize: 12,
              }}
            >
              🔥 Доступ к 25 лекциям + PDF + чат ИИ на 7 дней после каждой
            </div>
            <h3 style={{ fontSize: 28, marginTop: 14, marginBottom: 6 }}>
              Купить весь курс сразу — выгоднее на 38%
            </h3>
            <p style={{ color: "#475569", marginTop: 6 }}>
              Оплата внутри сайта: СБП, ЮKassa, Тинькофф Pay, карты РФ. Чек и
              документы — автоматически. Это демонстрационный виджет — реальные
              платёжные реквизиты подключаются позже.
            </p>
          </div>
          <div
            style={{
              padding: 22,
              borderRadius: 20,
              background:
                "linear-gradient(160deg, #ecfeff 0%, #fdf2f8 100%)",
              border: "1px solid #a7f3d0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                marginBottom: 6,
              }}
            >
              <div style={{ fontSize: 13, color: "#64748b", textDecoration: "line-through" }}>
                {formatRub(totalPrice)}
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: "#0f766e",
                  letterSpacing: -0.5,
                }}
              >
                {formatRub(bundlePrice)}
              </div>
            </div>
            <div style={{ fontSize: 13, color: "#0f766e", marginBottom: 14 }}>
              Единый платёж · бессрочный доступ · возврат 14 дней
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button style={btnPrimary("#0f766e", "#fff")} onClick={() => alert("Демо: тут будет подключение ЮKassa/СБП + редирект на success с выдачей доступа")}>
                💳 Оплатить картой / СБП
              </button>
              <button
                style={btnGhost("#0f172a")}
                onClick={() => alert("Демо: сюда можно добавить рассрочку, Тинькофф Pay в долг, оплату для юр. лиц.")}
              >
                🧾 Для юр. лиц / рассрочка
              </button>
            </div>
          </div>
        </section>

        <footer
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid #e2e8f0",
            color: "#64748b",
            fontSize: 13,
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <div>
            🌿 Информационный курс. Не является медицинской услугой, не заменяет
            очную консультацию врача.
          </div>
          <div>© МГТ Академия · {new Date().getFullYear()}</div>
        </footer>
      </div>
    </main>
  );
}

function NavRow() {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <Link
        href="/"
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: "#0f766e",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            display: "inline-grid",
            placeItems: "center",
            background: "linear-gradient(135deg, #0f766e, #ec4899)",
            color: "#fff",
          }}
        >
          🩺
        </span>
        МГТ Академия
      </Link>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", fontSize: 14 }}>
        <Link href="/courses" style={{ color: "#0f172a", textDecoration: "none", fontWeight: 700 }}>Каталог</Link>
        <Link href="/" style={{ color: "#475569", textDecoration: "none" }}>Бот-чекап</Link>
        <a href="#buy" style={{ color: "#475569", textDecoration: "none" }}>Оплата</a>
      </div>
    </nav>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.14)",
        border: "1px solid rgba(255,255,255,0.22)",
        minWidth: 120,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 12, opacity: 0.85 }}>{label}</div>
    </div>
  );
}

function Chip({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "9px 14px",
        borderRadius: 999,
        cursor: "pointer",
        fontSize: 13.5,
        fontWeight: 700,
        background: active ? color : "#fff",
        color: active ? "#fff" : color,
        border: active ? `1px solid ${color}` : "1px solid #e2e8f0",
        transition: "0.15s",
        boxShadow: active ? `0 4px 10px ${color}22` : "none",
      }}
    >
      {label}
    </button>
  );
}

function CourseCard({ c }: { c: Course }) {
  const level = levelBadge(c.level);
  const catIcon = CAT_ICONS[c.category];
  return (
    <article
      style={{
        background: "#fff",
        borderRadius: 22,
        border: "1px solid #e2e8f0",
        boxShadow: "0 6px 22px rgba(15,23,42,0.05)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform .15s ease, box-shadow .15s ease",
      }}
    >
      <div
        style={{
          padding: "20px 20px 14px",
          background: `linear-gradient(135deg, ${c.color} 0%, ${hexTint(c.color, 0.18)} 100%)`,
          color: "#fff",
          minHeight: 140,
          position: "relative",
        }}
      >
        <div
          style={{
            fontSize: 34,
            position: "absolute",
            top: 14,
            right: 16,
            opacity: 0.98,
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25))",
          }}
        >
          {catIcon}
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            opacity: 0.9,
          }}
        >
          Лекция {String(c.id).padStart(2, "0")} / 25 · {c.category}
        </div>
        <h3
          style={{
            margin: "10px 40px 0 0",
            fontSize: 18,
            lineHeight: 1.25,
            fontWeight: 800,
          }}
        >
          {c.title}
        </h3>
      </div>

      <div style={{ padding: "14px 18px 18px", display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            alignItems: "center",
          }}
        >
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              background: `${level.color}14`,
              color: level.color,
              border: `1px solid ${level.color}22`,
            }}
          >
            {level.label}
          </span>
          <span style={pill("#0ea5e9")}>⏱ {durationText(c.durationMin)}</span>
          {c.tags.slice(0, 2).map((t) => (
            <span key={t} style={pill("#64748b")}>#{t}</span>
          ))}
        </div>

        <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.5 }}>
          {c.summary}
        </p>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#0f172a",
              letterSpacing: -0.4,
            }}
          >
            {formatRub(c.priceRub)}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href={`/courses/${c.slug}`} style={btnGhostSmall("#0f172a")}>
              Подробнее
            </Link>
            <button
              style={btnPrimarySmall("#0f766e")}
              onClick={() =>
                alert(
                  `Демо: Оплата лекции "${c.title}" за ${formatRub(c.priceRub)} → ЮKassa. После оплаты откроется видео + PDF + 7 дней чата ИИ.`
                )
              }
            >
              Купить
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function formatRub(n: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);
}

function pill(color: string) {
  return {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: `${color}14`,
    color,
    border: `1px solid ${color}22`,
  } as React.CSSProperties;
}

function btnPrimary(bg: string, fg: string): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 20px",
    borderRadius: 14,
    fontWeight: 800,
    fontSize: 15,
    background: bg,
    color: fg,
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
    boxShadow: "0 8px 24px rgba(15,118,110,0.22)",
  };
}
function btnPrimarySmall(bg: string): React.CSSProperties {
  return {
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 800,
    fontSize: 13.5,
    background: bg,
    color: "#fff",
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
  };
}
function btnGhost(fg: string): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 20px",
    borderRadius: 14,
    fontWeight: 700,
    fontSize: 15,
    background: "transparent",
    color: fg,
    border: `1.5px solid ${fg}40`,
    cursor: "pointer",
    textDecoration: "none",
  };
}
function btnGhostSmall(fg: string): React.CSSProperties {
  return {
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 13.5,
    background: "transparent",
    color: fg,
    border: `1.5px solid ${fg}40`,
    cursor: "pointer",
    textDecoration: "none",
  };
}

function hexTint(hex: string, t: number): string {
  const m = hex.replace("#", "").match(/(.{2})/g);
  if (!m) return "#999";
  const [r, g, b] = m.map((v) => parseInt(v, 16));
  const mix = (c: number) =>
    Math.max(0, Math.min(255, Math.round(c + (255 - c) * t)));
  return `#${[r, g, b].map((c) => mix(c).toString(16).padStart(2, "0")).join("")}`;
}
