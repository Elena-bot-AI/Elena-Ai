import fs from "node:fs";
import path from "node:path";

const AVATARS = [
  {
    name: "Ava 1 — Лотос (минимализм, доверие)",
    file: "/avatars/avatar1-lotus.jpg",
    prompt:
      "minimalist avatar icon for a women's health menopause medical bot, friendly trust-worthy, soft rose and teal palette, sacred lotus flower silhouette inside a circle, flat vector illustration, 1832x1832, professional, clinic-grade design",
  },
  {
    name: "Ava 2 — Лепестки ромашки (нежный градиент)",
    file: "/avatars/avatar2-petals.jpg",
    prompt:
      "soft gradient circle avatar for telegram bot women's health doctor, overlapping pastel petals like chamomile around a gentle heart, calm peach teal lavender, dribbble-style flat design, 1832x1832, high quality logo mark",
  },
  {
    name: "Ava 3 — Стетоскоп + бабочка (мед.тема)",
    file: "/avatars/avatar3-stethoscope.jpg",
    prompt:
      "avatar icon for menopause health guidance bot, minimal stethoscope intertwined with butterfly wings, warm rose gold and soft mint palette, circle shape, flat vector logo, 1832x1832, very clean and trustful for a clinic",
  },
  {
    name: "Ava 4 — Полумесяц + бутоны (баланс)",
    file: "/avatars/avatar4-moon.jpg",
    prompt:
      "cozy avatar for a women hormonal health telegram bot, crescent moon surrounded by tiny stars and pastel flower buds, sage green and blush gradient circle, flat vector illustration, 1832x1832, calm and trustful",
  },
  {
    name: "Ava 5 — Дерево жизни (мудрость 45+)",
    file: "/avatars/avatar5-tree.jpg",
    prompt:
      "elegant tree of life mini logo inside circle, autumn warm tones, menopause wisdom bot avatar, strong roots, delicate leaves, gold and mauve palette, flat vector, 1832x1832, feminine and powerful",
  },
];

export const metadata = {
  title: "Аватары для Telegram-бота · МГТ/ЗГТ",
};

type Dims = { w: number; h: number };

function readJpegSize(absPath: string): Dims | null {
  try {
    const buf = fs.readFileSync(absPath);
    if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
    let i = 2;
    while (i < buf.length) {
      while (i < buf.length && buf[i] !== 0xff) i++;
      while (i < buf.length && buf[i] === 0xff) i++;
      const marker = buf[i]; i++;
      if (i + 1 >= buf.length) return null;
      const len = buf.readUInt16BE(i);
      if (len < 2) return null;
      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
        if (i + 8 > buf.length) return null;
        const h = buf.readUInt16BE(i + 3);
        const w = buf.readUInt16BE(i + 5);
        return { w, h };
      }
      i += len;
    }
    return null;
  } catch {
    return null;
  }
}

export default function AvatarPage() {
  const dims: Record<string, Dims> = {};
  try {
    for (const a of AVATARS) {
      const abs = path.join(process.cwd(), "public", a.file);
      dims[a.file] = readJpegSize(abs) || { w: 1832, h: 1832 };
    }
  } catch {
    for (const a of AVATARS) dims[a.file] = { w: 1832, h: 1832 };
  }

  const now = Date.now();

  return (
    <main style={{
      maxWidth: 1180, margin: "40px auto", padding: "0 24px",
      fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      color: "#1f2937",
    }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 4 }}>🌷 5 аватаров для твоего Telegram-бота</h1>
          <p style={{ marginTop: 0, color: "#6b7280" }}>
            Все картинки — локальные JPG 1832×1832 в <code>public/avatars/</code>. Идеально под @BotFather Edit Botpic.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <a
            href={`/avatar?t=${now}`}
            style={{
              padding: "10px 14px", borderRadius: 12, background: "#2563eb",
              color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700,
            }}
          >
            🔄 Обновить
          </a>
          <a
            href={`http://localhost:3001/avatar?t=${now}`}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "10px 14px", borderRadius: 12, background: "#0f172a",
              color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700,
            }}
          >
            ↗ Открыть в браузере
          </a>
        </div>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 24, marginTop: 28,
      }}>
        {AVATARS.map((a, i) => {
          const d = dims[a.file];
          return (
            <div key={i} style={{
              border: "1px solid #e5e7eb", borderRadius: 20, padding: 16,
              display: "flex", flexDirection: "column", gap: 12,
              background: "#fff", boxShadow: "0 4px 16px rgba(17,24,39,0.04)",
            }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
                {i + 1}. {a.name}
              </div>

              <div style={{
                width: "100%", borderRadius: 24, overflow: "hidden", position: "relative",
                aspectRatio: `${d.w} / ${d.h}`,
                background:
                  "conic-gradient(from 210deg at 50% 50%, #ffd9e2 0%, #e0f2fe 45%, #ecfeff 70%, #fde68a 100%)",
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${a.file}?v=${now}`}
                  alt={a.name}
                  width={d.w}
                  height={d.h}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <a
                  href={`${a.file}?v=${now}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center",
                    padding: "10px 14px", borderRadius: 12,
                    background: "#0f766e", color: "#fff", textDecoration: "none",
                    fontSize: 14, fontWeight: 700,
                  }}
                >
                  Скачать оригинал ↗
                </a>
                <span style={{
                  padding: "10px 14px", borderRadius: 12,
                  background: "#f1f5f9", color: "#334155", fontSize: 13,
                }}>
                  {d.w}×{d.h} · JPG
                </span>
              </div>

              <div style={{ fontSize: 12, color: "#64748b", background: "#f8fafc", padding: 10, borderRadius: 10 }}>
                📁 <b>Файл:</b> <code>public{String(a.file).replaceAll("/", "/")}</code>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: 40, padding: 20, borderRadius: 16,
        background: "#fff7ed", border: "1px solid #fed7aa",
      }}>
        <div style={{ fontWeight: 700, color: "#9a3412", marginBottom: 6 }}>
          💡 Как поставить аватарку в Telegram-бот за 1 минуту:
        </div>
        <ol style={{ margin: 0, paddingLeft: 20, color: "#7c2d12", lineHeight: 1.6 }}>
          <li>На понравившейся карточке жми <b>«Скачать оригинал ↗»</b> → ПКМ → <b>Сохранить как…</b> (JPG).</li>
          <li>Telegram → <a href="https://t.me/BotFather" style={{ color: "#9a3412" }}>@BotFather</a> → <code>/mybots</code> → выбери бот <b>«ИИ бот»</b> (token 8334659815).</li>
          <li>Жми <b>Edit Bot → Edit Botpic</b> → пришли этот JPG.</li>
          <li>Готово ✨</li>
        </ol>
      </div>
    </main>
  );
}
