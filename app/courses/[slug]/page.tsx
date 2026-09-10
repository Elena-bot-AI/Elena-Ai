"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import {
  COURSES,
  slugToIndex,
  durationText,
  levelBadge,
  type Course,
} from "@/lib/courses";

const ChatNoSSR = dynamic(() => import("@/components/Chat"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        padding: 36,
        borderRadius: 20,
        border: "1px dashed #94a3b8",
        textAlign: "center",
        color: "#64748b",
        background: "#fff",
      }}
    >
      ⏳ Загружаем чат-ассистента по этой лекции…
    </div>
  ),
});

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

const CAT_ICONS: Record<string, string> = {
  "Основы МГТ": "🌸",
  "Диагностика перед назначением": "🔬",
  "Абсолютные и относительные противопоказания": "🚨",
  "Препараты и схемы терапии": "💊",
  "Онко-наблюдение и безопасность": "🩺",
  "Разбор клинических случаев": "📋",
};

export default function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const c = slugToIndex.get(safeDecode(params.slug)) as Course | undefined;
  if (!c) {
    return (
      <main style={{ padding: "80px 24px", fontFamily: "sans-serif", textAlign: "center" }}>
        <h1 style={{ fontSize: 48 }}>404</h1>
        <p>Лекция не найдена</p>
        <Link href="/courses" style={{ color: "#0f766e", fontWeight: 800 }}>
          ← Вернуться в каталог
        </Link>
      </main>
    );
  }

  const level = levelBadge(c.level);
  const catIcon = CAT_ICONS[c.category] || "📘";

  const prev = COURSES[COURSES.findIndex((x) => x.slug === c.slug) - 1];
  const next = COURSES[COURSES.findIndex((x) => x.slug === c.slug) + 1];

  return (
    <main
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        minHeight: "100vh",
        color: "#0f172a",
        background:
          "linear-gradient(180deg, #effaf6 0%, #ffffff 40%, #fdf2f8 100%)",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 24px 72px" }}>
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
            href="/courses"
            style={{
              fontSize: 14,
              color: "#0f766e",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            ← Вернуться в каталог 25 лекций
          </Link>
          <div style={{ display: "flex", gap: 14, fontSize: 14 }}>
            {prev && (
              <Link href={`/courses/${prev.slug}`} style={navLink(true)}>
                ← Лекция {prev.id}
              </Link>
            )}
            {next && (
              <Link href={`/courses/${next.slug}`} style={navLink(false)}>
                Лекция {next.id} →
              </Link>
            )}
          </div>
        </nav>

        {/* HERO */}
        <section
          style={{
            marginTop: 22,
            borderRadius: 28,
            overflow: "hidden",
            boxShadow: "0 14px 40px rgba(15,118,110,0.18)",
            background: `linear-gradient(120deg, ${c.color} 0%, ${hexTint(c.color, -0.1)} 100%)`,
            color: "#fff",
          }}
        >
          <div style={{ padding: "44px 44px", position: "relative" }}>
            <div
              aria-hidden
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: 360,
                height: 360,
                background:
                  "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.35), transparent 60%)",
              }}
            />
            <div style={{ fontSize: 56, position: "absolute", right: 44, bottom: 36 }}>
              {catIcon}
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <span style={pill("#ffffff", "#0f172a")}>
                Лекция {String(c.id).padStart(2, "0")} / 25
              </span>
              <span style={pill("#ffffff22", "#ffffff")}>
                {c.category}
              </span>
              <span
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: `${level.color}`,
                  color: "#fff",
                  fontSize: 12.5,
                  fontWeight: 800,
                }}
              >
                {level.label}
              </span>
              <span style={pill("#ffffff22", "#ffffff")}>
                ⏱ {durationText(c.durationMin)}
              </span>
              {c.tags.slice(0, 3).map((t) => (
                <span key={t} style={pill("#ffffff18", "#ffffff")}>#{t}</span>
              ))}
            </div>

            <h1
              style={{
                fontSize: 32,
                lineHeight: 1.12,
                fontWeight: 800,
                margin: 0,
                maxWidth: 780,
              }}
            >
              {c.title}
            </h1>

            <p
              style={{
                fontSize: 15.5,
                lineHeight: 1.55,
                opacity: 0.95,
                marginTop: 14,
                maxWidth: 780,
              }}
            >
              {c.summary}
            </p>

            <div
              style={{
                marginTop: 24,
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: -0.4 }}>
                {formatRub(c.priceRub)}
              </div>
              <button
                style={{
                  ...primaryBtnStyle(),
                  background: "#0f172a",
                  color: "#fff",
                  boxShadow: "0 10px 24px rgba(15,23,42,0.3)",
                }}
                onClick={() =>
                  alert(
                    `Демо-оплата лекции №${c.id} за ${formatRub(c.priceRub)}.\n\n` +
                    `На реальном проекте: → ЮKassa/СБП/Тинькофф → Webhook success → выдача доступа к видео+PDF+7 дней чата ИИ.`
                  )
                }
              >
                💳 Оплатить · Доступ навсегда
              </button>
              <button
                style={ghostBtnStyle("#ffffffcc")}
                onClick={() =>
                  alert(
                    "Демо: «Добавить в подписку Pro — 9 лекций в месяц за 4 990 ₽»."
                  )
                }
              >
                🎁 В абонемент
              </button>
            </div>
          </div>

          {/* VIDEO PLAYER PLACEHOLDER */}
          <div
            style={{
              margin: "0 44px 44px",
              borderRadius: 22,
              overflow: "hidden",
              background: "#00000022",
              border: "1px solid #ffffff22",
              aspectRatio: "16 / 9",
              display: "grid",
              placeItems: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.22), rgba(15,23,42,0.22))",
              }}
            />
            <button
              aria-label="Play video"
              onClick={() => alert("Демо: тут будет встроенный плеер Kinescope/Vimeo/Youtube с ограничением доступа после оплаты")}
              style={{
                position: "relative",
                width: 110,
                height: 110,
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.98)",
                color: c.color,
                fontSize: 44,
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 14px 40px rgba(15,23,42,0.3)",
              }}
            >
              ▶
            </button>
            <div
              style={{
                position: "absolute",
                left: 24,
                bottom: 18,
                fontSize: 13,
                color: "#fff",
                opacity: 0.9,
                fontWeight: 700,
              }}
            >
              {catIcon} Лекция {String(c.id).padStart(2, "0")} из 25 · {durationText(c.durationMin)}
            </div>
          </div>
        </section>

        {/* CONTENT GRID */}
        <div
          style={{
            marginTop: 32,
            display: "grid",
            gridTemplateColumns: "1.3fr 1fr",
            gap: 24,
          }}
        >
          {/* LEFT: Таймкоды + конспект */}
          <section style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <Card title="⏱ Таймкоды лекции">
              <ol style={{ margin: 0, padding: "0 0 0 22px", lineHeight: 1.85, fontSize: 15 }}>
                {c.outline.map((t, i) => (
                  <li key={i} style={{ paddingBottom: i < c.outline.length - 1 ? 8 : 0 }}>
                    {t}
                  </li>
                ))}
              </ol>
            </Card>

            <Card title="📝 Конспект PDF (после оплаты)">
              <div
                style={{
                  padding: 22,
                  borderRadius: 16,
                  background:
                    "linear-gradient(180deg, #f8fafc 0%, #fff 100%)",
                  border: "1px dashed #cbd5e1",
                  lineHeight: 1.65,
                  fontSize: 14,
                  color: "#334155",
                }}
              >
                <p style={{ marginTop: 0, marginBottom: 10, fontWeight: 800, color: "#0f172a" }}>
                  {c.title} — конспект {c.id}/25
                </p>
                <p style={{ margin: "0 0 10px 0" }}>
                  <b>1. Теория:</b> {c.category} — классификация ESHRE 2024, основные термины.
                </p>
                <p style={{ margin: "0 0 10px 0" }}>
                  <b>2. Практика:</b> 3 клинических примера, чек-лист для врача, красные флаги.
                </p>
                <p style={{ margin: 0 }}>
                  <b>3. Ошибки:</b> 2 самые частые ошибки при интерпретации, алгоритм разбора
                  сложного случая (как разбираем в секции «Случаи»).
                </p>
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  style={primaryBtnStyle()}
                  onClick={() => alert("Демо: Скачать PDF (доступ после оплаты)")}
                >
                  📄 Скачать PDF
                </button>
                <button
                  style={ghostBtnStyle("#0f172a")}
                  onClick={() => alert("Демо: Отправить конспект на email")}
                >
                  ✉️ На почту
                </button>
              </div>
            </Card>

            <Card title="💡 Тестирование по лекции (10 вопросов)">
              <p style={{ margin: "0 0 14px 0", fontSize: 14, color: "#475569" }}>
                Купив лекцию, ты сможешь пройти небольшой тест и получить сертификат
                о прохождении (для личного портфолио).
              </p>
              <button
                style={primaryBtnStyle("#6d28d9")}
                onClick={() => alert("Демо: 10 тестовых вопросов по лекции + CERTIFICATE.pdf")}
              >
                🎯 Начать тест
              </button>
            </Card>
          </section>

          {/* RIGHT: Chat с ботом по ЛЕКЦИИ */}
          <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card
              title="🤖 ИИ-ассистент по этой лекции"
              subtitle="Задай любой вопрос по материалам — это вспомогательный инструмент (не заменяет лекцию/врача)"
            >
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 16,
                  padding: 14,
                  fontSize: 13,
                  color: "#475569",
                  marginBottom: 14,
                }}
              >
                💡 Быстрый вопрос для примера:
                <div
                  style={{
                    fontFamily: "monospace",
                    marginTop: 8,
                    background: "#fff",
                    padding: 10,
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    whiteSpace: "pre-wrap",
                    fontSize: 12.5,
                    color: "#0f172a",
                  }}
                >
                  {c.seedQuestion}
                </div>
              </div>
              <ChatNoSSR />
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 22,
        border: "1px solid #e2e8f0",
        boxShadow: "0 6px 22px rgba(15,23,42,0.05)",
        padding: "22px 24px 24px",
      }}
    >
      <h2 style={{ fontSize: 18, margin: 0, fontWeight: 800 }}>{title}</h2>
      {subtitle && (
        <p style={{ fontSize: 13.5, color: "#64748b", marginTop: 4, marginBottom: 14 }}>
          {subtitle}
        </p>
      )}
      <div>{children}</div>
    </div>
  );
}

function navLink(left: boolean): React.CSSProperties {
  return {
    padding: "8px 14px",
    borderRadius: 12,
    background: left ? "#ecfeff" : "#fff7ed",
    color: left ? "#0e7490" : "#9a3412",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 13,
    border: `1px solid ${left ? "#a5f3fc" : "#fed7aa"}`,
  };
}

function pill(bg: string, fg: string): React.CSSProperties {
  return {
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12.5,
    fontWeight: 700,
    background: bg,
    color: fg,
  };
}

function primaryBtnStyle(bg = "#0f766e"): React.CSSProperties {
  return {
    padding: "12px 18px",
    borderRadius: 14,
    border: "none",
    fontWeight: 800,
    fontSize: 14,
    cursor: "pointer",
    background: bg,
    color: "#fff",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  };
}
function ghostBtnStyle(fg: string): React.CSSProperties {
  return {
    padding: "12px 18px",
    borderRadius: 14,
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    background: "transparent",
    color: fg,
    border: `1.5px solid ${fg}55`,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  };
}

function formatRub(n: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);
}

function hexTint(hex: string, amount: number): string {
  const m = hex.replace("#", "").match(/(.{2})/g);
  if (!m) return "#333";
  const [r, g, b] = m.map((v) => parseInt(v, 16));
  const f = (c: number) =>
    Math.max(
      0,
      Math.min(255, Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount))
    );
  return `#${[r, g, b].map((c) => f(c).toString(16).padStart(2, "0")).join("")}`;
}
