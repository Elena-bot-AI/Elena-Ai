"use client";

import Link from "next/link";

const BRAND = {
  accent: "#E8623E", // тёплый кораллово-оранжевый как City Stom
  accentSoft: "#FFF2EC",
  accentDark: "#BF4A2A",
  bg: "#FDFAF7", // тёплый кремовый фон
  ink: "#1F1B16",
  sub: "#6B645A",
  card: "#FFFFFF",
  border: "#F0E9E1",
};

const STATS = [
  { icon: "⏳", label: "Лет практики", value: "28+", sub: "гинекология, хирургия, наблюдение" },
  { icon: "👩‍⚕️", label: "Женщин вылечила", value: "10 000+", sub: "от 20 до 85+ лет, все фазы жизни" },
  { icon: "🌸", label: "Лет самой менопаузе", value: "≈ 10", sub: "я сама проживаю эту фазу, знаю изнутри" },
  { icon: "🧡", label: "Удовлетворённость", value: "98%", sub: "судя по отзывам и возвратам пациенток" },
];

const MODULES = [
  { n: 1, title: "Менопауза, климакс — что это и за что нам это?", color: "#FBE9DC" },
  { n: 2, title: "История МГТ. Откуда взялся страх и доверие к гормонам", color: "#FDE7E0" },
  { n: 3, title: "Симптомы менопаузы явные и скрытые — узнай себя", color: "#FBF0DC" },
  { n: 4, title: "МГТ/ЗГТ: кому можно, кому нужно, кому жизненно необходимо. КОГДА?", color: "#FDE3D6" },
  { n: 5, title: "Паспортный возраст твоей репродуктивной системы", color: "#FBE6D3" },
  { n: 6, title: "Эстрогены — наше всё: формы выпуска, особенности метаболизма", color: "#FDF1DC" },
  { n: 7, title: "Правила использования трансдермальных эстрогенов", color: "#FDE0D1" },
  { n: 8, title: "Прогестерон и синтетические аналоги. Формы выпуска, метаболизм", color: "#FBE9DC" },
  { n: 9, title: "Схемы и режимы МГТ/ЗГТ на все случаи жизни", color: "#FDE7E0" },
  { n: 10, title: "Обследование перед стартом и ежегодный чекап. Экономия денег, нервов, времени", color: "#FBF0DC" },
  { n: 11, title: "Вагинальная сухость и цистит, который не цистит: знаем, лечим, не страдаем", color: "#FDE3D6" },
  { n: 12, title: "МГТ/ЗГТ — если нет матки или планируется её удаление", color: "#FBE6D3" },
  { n: 13, title: "Тестостерон: зачем? Кому? Сколько? Правила использования", color: "#FDF1DC" },
  { n: 14, title: "ДГЭА: влагалище или мозг — где нужнее?", color: "#FDE0D1" },
  { n: 15, title: "Off-label: любое решение требует контроля", color: "#FBE9DC" },
  { n: 16, title: "Остеопороз: хрупкая снаружи, твёрдая внутри", color: "#FDE7E0" },
  { n: 17, title: "Не гормоны против климакса — что реально работает", color: "#FBF0DC" },
  { n: 18, title: "Побочные эффекты и онкологические риски — цифры и факты", color: "#FDE3D6" },
  { n: 19, title: "Преждевременная и ранняя менопауза — особенности терапии", color: "#FBE6D3" },
  { n: 20, title: "Оземпик и Мунджаро — правила использования в менопаузе", color: "#FDF1DC" },
  { n: 21, title: "Либидо: разбудить спящую красавицу", color: "#FDE0D1" },
];

const PRICES = [
  {
    name: "Тариф «Самостоятельно»",
    price: 29900,
    oldPrice: 49900,
    badge: "Старт",
    list: [
      "Доступ ко всем 21 урокам курса",
      "PDF-конспект к каждому уроку",
      "Чек-листы анализов в PDF",
      "Доступ 12 месяцев",
      "Чат с поддержкой по материалам",
    ],
    button: "Купить тариф",
    highlight: false,
  },
  {
    name: "Тариф «С наставником»",
    price: 59900,
    oldPrice: 89900,
    badge: "🔥 Рекомендую",
    list: [
      "Всё из тарифа «Самостоятельно»",
      "4 групповых Zoom с Еленой (в прямом эфире)",
      "Чат Елены с ученицами, живые ответы на вопросы",
      "Разбор Ваших анализов в группе",
      "Гайд «Подбор препаратов по вашему профилю»",
      "Доступ бессрочный + все обновления курса",
      "Сертификат выпускника курса",
    ],
    button: "Взять тариф с Еленой",
    highlight: true,
  },
  {
    name: "Тариф «VIP 1-на-1»",
    price: 199000,
    oldPrice: 249000,
    badge: "Лимит 5 чел/мес",
    list: [
      "Всё из тарифа «С наставником»",
      "3 личные Zoom-консультации с Еленой (60 мин)",
      "Разбор анамнеза + назначения по анализам",
      "Персональный путь по курсу под Вашу ситуацию",
      "Доступ в закрытый клуб выпускниц навсегда",
      "Приоритетная поддержка в чате 24/7",
      "Можно оплатить в рассрочку на 6 мес",
    ],
    button: "Записаться на VIP",
    highlight: false,
  },
];

export default function DrElenaLanding() {
  return (
    <main
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Inter", sans-serif',
        minHeight: "100vh",
        background: BRAND.bg,
        color: BRAND.ink,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "22px 22px 72px" }}>
        <NavRow />
        <Hero />
        <Trust />
        <Program />
        <About />
        <WhoIsFor />
        <Pricing />
        <CTA />
        <Footer />
      </div>
    </main>
  );
}

/* ---------- NAV ---------- */
function NavRow() {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        padding: "10px 6px 18px",
      }}
    >
      <Link
        href="/dr-elena"
        style={{
          fontSize: 17,
          fontWeight: 800,
          color: BRAND.accentDark,
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          letterSpacing: -0.2,
        }}
      >
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            display: "inline-grid",
            placeItems: "center",
            background: `linear-gradient(135deg, ${BRAND.accent}, #FFA574)`,
            color: "#fff",
            fontSize: 18,
            boxShadow: `0 6px 16px ${BRAND.accent}33`,
          }}
        >
          🌿
        </span>
        Елена&nbsp;Майванди
      </Link>

      <div
        style={{
          display: "flex",
          gap: 22,
          flexWrap: "wrap",
          alignItems: "center",
          fontSize: 14.5,
          color: BRAND.sub,
        }}
      >
        <a href="#program" style={{ color: BRAND.ink, textDecoration: "none", fontWeight: 600 }}>
          Программа
        </a>
        <a href="#about" style={{ color: BRAND.ink, textDecoration: "none" }}>
          Обо мне
        </a>
        <a href="#who" style={{ color: BRAND.ink, textDecoration: "none" }}>
          Для кого
        </a>
        <a href="#buy" style={{ color: BRAND.ink, textDecoration: "none" }}>
          Тарифы
        </a>
        <Link
          href="/"
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: `1.5px solid ${BRAND.border}`,
            color: BRAND.ink,
            textDecoration: "none",
            fontWeight: 700,
            background: "#fff",
          }}
        >
          🩺 Бот-чекап
        </Link>
        <a
          href="#buy"
          style={{
            padding: "10px 16px",
            borderRadius: 12,
            background: BRAND.accent,
            color: "#fff",
            textDecoration: "none",
            fontWeight: 800,
            boxShadow: `0 6px 16px ${BRAND.accent}33`,
          }}
        >
          Забрать курс
        </a>
      </div>
    </nav>
  );
}

/* ---------- HERO ---------- */
function Hero() {
  return (
    <section
      style={{
        marginTop: 14,
        padding: "38px 38px",
        borderRadius: 28,
        background: "#fff",
        border: `1px solid ${BRAND.border}`,
        boxShadow: "0 10px 40px rgba(31,27,22,0.06)",
        display: "grid",
        gridTemplateColumns: "1.15fr 0.95fr",
        gap: 32,
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div aria-hidden style={heroBg} />
      <div style={{ position: "relative" }}>
        <div
          style={{
            display: "inline-block",
            padding: "7px 13px",
            borderRadius: 999,
            background: BRAND.accentSoft,
            color: BRAND.accentDark,
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 0.2,
            marginBottom: 18,
          }}
        >
          🌸 Курс по МГТ · Старт нового потока скоро
        </div>
        <h1
          style={{
            fontSize: 42,
            lineHeight: 1.05,
            margin: 0,
            fontWeight: 800,
            letterSpacing: -0.8,
            color: BRAND.ink,
          }}
        >
          Настоящий женский доктор{" "}
          <span style={{ color: BRAND.accent }}>уже 28 лет</span>
          <br />
          учит разбираться в менопаузе{" "}
          <span style={{ color: BRAND.accent }}>без страха</span>
        </h1>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.55,
            color: BRAND.sub,
            marginTop: 16,
            maxWidth: 560,
          }}
        >
          Менопауза — не болезнь и не старость. Это вторая половина вашей жизни, которую можно
          прожить <b style={{ color: BRAND.ink }}>в ресурсе, без приливов, сухости и страха за
          кости</b>. Я — Елена Майванди, гинеколог, мама и бабушка, сама живу эту фазу. Расскажу
          простым языком, как включить МГТ и не бояться.
        </p>

        {/* чек-листы hero */}
        <div
          style={{
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            maxWidth: 560,
          }}
        >
          {[
            "Без воды, только доказанная медицина",
            "21 урок + PDF + чекапы анализов",
            "4 живых Zoom с Еленой (в тарифе «С наставником»)",
            "Доступ 12 мес / бессрочно",
          ].map((t) => (
            <div
              key={t}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontSize: 14.5,
                color: BRAND.ink,
                fontWeight: 600,
                padding: "8px 12px",
                borderRadius: 12,
                background: "#FFF9F4",
                border: `1px solid ${BRAND.border}`,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  background: BRAND.accent,
                  color: "#fff",
                  display: "inline-grid",
                  placeItems: "center",
                  fontSize: 12,
                }}
              >
                ✓
              </span>
              {t}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 26,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <a href="#buy" style={btnPrimary}>
            🔥 Смотреть тарифы и цены
          </a>
          <a href="#program" style={btnGhost}>
            Смотреть программу из 21 урока ↓
          </a>
        </div>
      </div>

      {/* Фото Елены */}
      <div style={{ position: "relative", justifySelf: "center" }}>
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            aspectRatio: "4/5",
            borderRadius: 24,
            background: `linear-gradient(160deg, ${BRAND.accentSoft}, #FFE1D0 80%)`,
            position: "relative",
            overflow: "hidden",
            boxShadow: `0 24px 60px ${BRAND.accent}25`,
            border: `1px solid ${BRAND.border}`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/avatars/елена.jpg"
            alt="Елена Майванди, гинеколог"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: 24,
              display: "block",
            }}
            onError={(e) => {
              // если нет фото — используем placeholder
              const el = e.currentTarget;
              el.style.display = "none";
              const parent = el.parentElement;
              if (parent) {
                const ph = document.createElement("div");
                ph.style.cssText =
                  "position:absolute;inset:0;display:grid;place-items:center;color:#BF4A2A;font-weight:900;font-size:22px;text-align:center;padding:24px;line-height:1.3;";
                ph.textContent =
                  "🌿 Елена Майванди\n52 года,\nгинеколог 28 лет,\nмама и бабушка";
                parent.appendChild(ph);
              }
            }}
          />
        </div>

        {/* Флоат-карточки */}
        <div style={floatCard({ bottom: 20, left: -20 })}>
          <div style={{ fontSize: 20 }}>🎓</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>28 лет</div>
            <div style={{ fontSize: 12, color: BRAND.sub }}>практики</div>
          </div>
        </div>
        <div style={floatCard({ top: 30, right: -14 })}>
          <div style={{ fontSize: 20 }}>👩</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>10 000+</div>
            <div style={{ fontSize: 12, color: BRAND.sub }}>пациенток</div>
          </div>
        </div>
      </div>
    </section>
  );
}

const heroBg: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(700px 320px at 95% -20%, rgba(232,98,62,0.10), transparent 60%), radial-gradient(500px 300px at -10% 110%, rgba(255,165,116,0.18), transparent 60%)",
  pointerEvents: "none",
};

function floatCard(pos: React.CSSProperties): React.CSSProperties {
  return {
    position: "absolute",
    background: "#fff",
    borderRadius: 14,
    padding: "10px 14px",
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    border: `1px solid ${BRAND.border}`,
    boxShadow: "0 8px 24px rgba(31,27,22,0.08)",
    ...pos,
  };
}

/* ---------- TRUST ---------- */
function Trust() {
  return (
    <section style={{ marginTop: 60 }}>
      <SectionHeader
        eyebrow="Почему доверяют"
        title={
          <>
            Почему мне <span style={{ color: BRAND.accent }}>доверяют</span>
          </>
        }
        subtitle="Настоящий женский доктор: я сама — женщина, мама, бабушка, пациентка. И я точно знаю,
          что нужно женщине в 35, в 45 и в 65."
      />

      <div
        style={{
          marginTop: 28,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
        }}
        className="trust-grid"
      >
        {STATS.map((s) => (
          <article
            key={s.label}
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "22px 22px 24px",
              border: `1px solid ${BRAND.border}`,
              boxShadow: "0 6px 22px rgba(31,27,22,0.04)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: BRAND.accentSoft,
                color: BRAND.accentDark,
                display: "inline-grid",
                placeItems: "center",
                fontSize: 20,
                marginBottom: 14,
              }}
            >
              {s.icon}
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: -0.5,
                color: BRAND.ink,
                marginBottom: 4,
              }}
            >
              {s.value}
            </div>
            <div style={{ fontWeight: 800, fontSize: 14, color: BRAND.ink, marginBottom: 4 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 13, color: BRAND.sub, lineHeight: 1.4 }}>{s.sub}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- PROGRAM ---------- */
function Program() {
  return (
    <section id="program" style={{ marginTop: 72 }}>
      <SectionHeader
        eyebrow="Программа курса"
        title={
          <>
            Программа — <span style={{ color: BRAND.accent }}>21 урок</span> от А до Я
          </>
        }
        subtitle="Каждый урок — 15–40 минут, простым языком, с клиническими примерами из моей 28-летней
          практики. После каждого — PDF-конспект и чек-листы."
      />

      <div
        style={{
          marginTop: 28,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
        className="program-grid"
      >
        {MODULES.map((m) => (
          <article
            key={m.n}
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "18px 18px 20px",
              border: `1px solid ${BRAND.border}`,
              boxShadow: "0 6px 22px rgba(31,27,22,0.04)",
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: m.color,
                color: BRAND.accentDark,
                fontWeight: 900,
                fontSize: 16,
                display: "inline-grid",
                placeItems: "center",
                flex: "0 0 auto",
              }}
            >
              {String(m.n).padStart(2, "0")}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: BRAND.sub, fontWeight: 800, letterSpacing: 0.5 }}>
                УРОК {String(m.n).padStart(2, "0")} / 21
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 15,
                  fontWeight: 800,
                  lineHeight: 1.35,
                  color: BRAND.ink,
                }}
              >
                {m.title}
              </div>
            </div>
            <div
              aria-hidden
              style={{
                position: "absolute",
                right: 14,
                bottom: 14,
                width: 28,
                height: 28,
                borderRadius: 999,
                background: BRAND.accent,
                boxShadow: `0 4px 12px ${BRAND.accent}33`,
              }}
            />
          </article>
        ))}
      </div>

      <div
        style={{
          marginTop: 30,
          padding: "22px 26px",
          borderRadius: 20,
          background: "#fff",
          border: `1.5px dashed ${BRAND.accent}66`,
          display: "flex",
          gap: 20,
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontWeight: 900, fontSize: 17, color: BRAND.ink }}>
            📥 Хотите получить полную программу PDF уроков и бесплатный гайд
            <br />
            «5 симптомов менопаузы, которые все игнорируют»?
          </div>
          <div style={{ color: BRAND.sub, marginTop: 6, fontSize: 14 }}>
            Оставьте почту — пришлю бесплатно. Никакого спама, только 1 раз.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            placeholder="anna@email.com"
            style={{
              padding: "13px 16px",
              borderRadius: 12,
              border: `1.5px solid ${BRAND.border}`,
              background: "#fff",
              fontSize: 15,
              minWidth: 260,
              outline: "none",
            }}
          />
          <button
            style={btnPrimary}
            onClick={() => alert("Демо: сюда подключается форма (Yandex Forms / Tilda / Mailchimp) — и PDF уходит на почту.")}
          >
            Получить PDF 📄
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- ABOUT ---------- */
function About() {
  return (
    <section id="about" style={{ marginTop: 72 }}>
      <SectionHeader
        eyebrow="Обо мне"
        title={
          <>
            Обо мне — <span style={{ color: BRAND.accent }}>Елена Майванди</span>
          </>
        }
      />

      <div
        style={{
          marginTop: 28,
          display: "grid",
          gridTemplateColumns: "0.9fr 1.1fr",
          gap: 28,
          alignItems: "stretch",
        }}
        className="about-grid"
      >
        {/* Фото + карточки */}
        <div
          style={{
            background: `linear-gradient(160deg, ${BRAND.accentSoft}, #FFE4D3 90%)`,
            borderRadius: 28,
            padding: 28,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
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
                "radial-gradient(500px 300px at 10% -10%, rgba(255,255,255,0.6), transparent 60%)",
            }}
          />
          <div
            style={{
              position: "relative",
              borderRadius: 24,
              background: "#fff",
              padding: 14,
              border: `1px solid ${BRAND.border}`,
              boxShadow: "0 12px 34px rgba(31,27,22,0.08)",
              alignSelf: "stretch",
              flex: "1 1 auto",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: "3/4",
                borderRadius: 18,
                background: `linear-gradient(160deg, ${BRAND.accentSoft}, #FFE1D0 80%)`,
                overflow: "hidden",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/avatars/елена.jpg"
                alt="Елена Майванди"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <StatMini emoji="🎓" title="28 лет" sub="гинекология" />
              <StatMini emoji="👩‍⚕️" title="10 000+" sub="пациенток" />
              <StatMini emoji="👦👶" title="2 внука" sub="бабушка" />
              <StatMini emoji="💼" title="52 года" sub="сама в климаксе" />
            </div>
          </div>
        </div>

        {/* Текст биографии */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Bio>
            Меня зовут <b>Елена Майванди</b>. Я — женщина второй половины жизни (такой вот
            интересный термин), мама взрослого сына и бабушка двоих внуков 👦👶, мне 52 года. Из
            этих 52 лет уже <b>28 я лечу женщин</b> — получается, большую часть своей жизни.
          </Bio>
          <Bio>
            Я хорошо понимаю молодых женщин — потому что уже прожила этот период. Я хорошо понимаю
            взрослых женщин — потому что сама взрослая и сейчас живу свою взрослую жизнь. Я хорошо
            понимаю дам серебряного возраста и преклонных лет — потому что постоянно с ними
            общаюсь на приёме и в операционной.
          </Bio>
          <Bio>
            28 лет я лечу, принимаю, оперирую, наблюдаю, помогаю, пишу небольшие рассказы о людях
            и их судьбах — и мне это нравится. У меня есть способность{" "}
            <b>слушать и слышать</b>, а также рассказывать сложные медицинские вещи{" "}
            <b>простым и понятным языком</b>.
          </Bio>
          <Bio>
            Очень часто на мероприятиях под занавес вечера я оказываюсь в окружении женщин и
            отвечаю на самые разные вопросы — как на экзамене по гинекологии. Спрашивают и про
            себя, и про дочь, и про маму, и про всё-всё. И про то, о чём иногда спрашивается только
            после пары бокалов.
          </Bio>
          <Bio>
            Много лет я оперирую бок о бок с хирургами, урологами, проктологами, онкологами,
            флебологами, отоларингологами — отсюда <b>широкое понимание проблем</b> пациенток и
            возможностей их решения. Моя авторская методика восстановления женского здоровья и
            фигуры работает для женщин <b>в любом возрасте</b>.
          </Bio>

          <div
            style={{
              marginTop: 6,
              padding: "20px 22px",
              borderRadius: 20,
              background:
                "linear-gradient(135deg, rgba(232,98,62,0.09) 0%, rgba(255,165,116,0.12) 100%)",
              border: `1px solid ${BRAND.accent}33`,
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontSize: 34,
                flex: "0 0 auto",
              }}
            >
              🌸
            </div>
            <div style={{ flex: 1, minWidth: 250 }}>
              <div style={{ fontWeight: 900, fontSize: 17 }}>
                Я знаю, как сделать женщину здоровой — в любом возрасте.
              </div>
              <div style={{ fontSize: 14, color: BRAND.sub, marginTop: 4 }}>
                И в этом курсе я дам вам не теорию из учебника, а то, что реально работает на
                практике — 28 лет наблюдений за тысячами женщин.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatMini({ emoji, title, sub }: { emoji: string; title: string; sub: string }) {
  return (
    <div
      style={{
        padding: "12px 12px",
        borderRadius: 14,
        background: BRAND.accentSoft,
        border: `1px solid ${BRAND.border}`,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div style={{ fontSize: 20 }}>{emoji}</div>
      <div>
        <div style={{ fontWeight: 900, fontSize: 15 }}>{title}</div>
        <div style={{ fontSize: 12, color: BRAND.sub }}>{sub}</div>
      </div>
    </div>
  );
}

function Bio({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: 15.5,
        lineHeight: 1.65,
        color: "#3D372E",
        background: "#fff",
        padding: "16px 18px",
        borderRadius: 18,
        border: `1px solid ${BRAND.border}`,
        boxShadow: "0 2px 10px rgba(31,27,22,0.03)",
      }}
    >
      {children}
    </p>
  );
}

/* ---------- WHO IS FOR ---------- */
function WhoIsFor() {
  const rows = [
    {
      icon: "🌷",
      t: "Вам 40–55 лет",
      d: "Появлись приливы, плохой сон, сухость, раздражительность — не понимаете, это климакс или просто устала.",
    },
    {
      icon: "🔬",
      t: "Сдали анализы, а врач молчит",
      d: "ФСГ, эстрадиол, ЛГ — а диагноза и лечения нет. Вы не понимаете, что с вами делать дальше.",
    },
    {
      icon: "⚖️",
      t: "Боитесь МГТ / ЗГТ",
      d: "Напугали «раком», «гормонами», «поправлюсь». Хотите разобраться по честному — где правда, где миф.",
    },
    {
      icon: "🦴",
      t: "Боитесь остеопороза / старости",
      d: "Хотите оставаться активной, сексуальной и в ресурсе — и понимаете, что одними БАДами тут не решить.",
    },
    {
      icon: "💔",
      t: "Преждевременная менопауза",
      d: "Удалили яичники / химиотерапия / генетика — вам 35, а уже климакс. Паника: что делать?",
    },
    {
      icon: "✨",
      t: "Просто хотите контроль",
      d: "Хотите понимать своё тело, говорить с врачом на одном языке и не зависеть от «а вдруг поможет».",
    },
  ];
  return (
    <section id="who" style={{ marginTop: 72 }}>
      <SectionHeader
        eyebrow="Для кого этот курс"
        title={
          <>
            Этот курс — <span style={{ color: BRAND.accent }}>для вас, если</span>
          </>
        }
        subtitle="Если хоть один пункт совпал — вы попали по адресу. Мы разберём всё в calm-режиме, без паники и пугающих терминов."
      />
      <div
        style={{
          marginTop: 28,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}
        className="who-grid"
      >
        {rows.map((r) => (
          <article
            key={r.t}
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "22px 22px",
              border: `1px solid ${BRAND.border}`,
              boxShadow: "0 6px 22px rgba(31,27,22,0.04)",
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: BRAND.accentSoft,
                color: BRAND.accentDark,
                display: "inline-grid",
                placeItems: "center",
                fontSize: 22,
                flex: "0 0 auto",
              }}
            >
              {r.icon}
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16, color: BRAND.ink, marginBottom: 6 }}>
                {r.t}
              </div>
              <div style={{ fontSize: 14, color: BRAND.sub, lineHeight: 1.55 }}>{r.d}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- PRICING ---------- */
function Pricing() {
  return (
    <section id="buy" style={{ marginTop: 72 }}>
      <SectionHeader
        eyebrow="Тарифы и оплата"
        title={
          <>
            Выберите <span style={{ color: BRAND.accent }}>свой формат</span>
          </>
        }
        subtitle="Оплата картой, СБП, Тинькофф Pay. Юридическим лицам — закрывающие документы. Возврат — 14 дней по закону о защите прав потребителей."
      />

      <div
        style={{
          marginTop: 28,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 18,
          alignItems: "stretch",
        }}
        className="pricing-grid"
      >
        {PRICES.map((p) => (
          <article
            key={p.name}
            style={{
              background: p.highlight
                ? `linear-gradient(180deg, #FFF2EC 0%, #FFFFFF 50%)`
                : "#fff",
              borderRadius: 24,
              padding: "28px 26px 26px",
              border: p.highlight
                ? `2px solid ${BRAND.accent}`
                : `1px solid ${BRAND.border}`,
              boxShadow: p.highlight
                ? `0 18px 48px ${BRAND.accent}28`
                : "0 6px 22px rgba(31,27,22,0.05)",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {p.badge && (
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  padding: "5px 11px",
                  borderRadius: 999,
                  background: BRAND.accent,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 0.2,
                }}
              >
                {p.badge}
              </div>
            )}

            <div style={{ fontWeight: 900, fontSize: 19, color: BRAND.ink }}>{p.name}</div>
            <div
              style={{
                marginTop: 12,
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontSize: 13, color: BRAND.sub, textDecoration: "line-through" }}>
                {formatRub(p.oldPrice)}
              </div>
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 900,
                  color: p.highlight ? BRAND.accentDark : BRAND.ink,
                  letterSpacing: -0.7,
                  lineHeight: 1,
                }}
              >
                {formatRub(p.price)}
              </div>
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                color: BRAND.sub,
              }}
            >
              Единый платёж · возврат 14 дней · можно в рассрочку
            </div>

            <div
              style={{
                margin: "18px -10px",
                height: 1,
                background: BRAND.border,
              }}
            />

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                flex: 1,
              }}
            >
              {p.list.map((it) => (
                <li
                  key={it}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    fontSize: 14.5,
                    color: BRAND.ink,
                    lineHeight: 1.45,
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      background: BRAND.accentSoft,
                      color: BRAND.accentDark,
                      display: "inline-grid",
                      placeItems: "center",
                      fontSize: 12,
                      fontWeight: 900,
                      marginTop: 1,
                      flex: "0 0 auto",
                    }}
                  >
                    ✓
                  </span>
                  {it}
                </li>
              ))}
            </ul>

            <button
              style={p.highlight ? btnPrimary : btnGhostFill}
              onClick={() =>
                alert(
                  `Демо: оплата тарифа «${p.name}» ${formatRub(p.price)}.\n\nТут подключается ЮKassa / Тинькофф Pay / СБП. После оплаты — почта + доступ в LMS (Кабинет ученицы).`
                )
              }
            >
              {p.button} →
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- CTA ---------- */
function CTA() {
  return (
    <section
      style={{
        marginTop: 80,
        padding: "42px 40px",
        borderRadius: 28,
        background: `linear-gradient(135deg, ${BRAND.accent} 0%, #FF9166 100%)`,
        color: "#fff",
        boxShadow: `0 24px 60px ${BRAND.accent}33`,
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
            "radial-gradient(800px 320px at 100% 0%, rgba(255,255,255,0.22), transparent 60%), radial-gradient(700px 360px at 0% 120%, rgba(255,255,255,0.15), transparent 60%)",
        }}
      />
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 32, alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.5, opacity: 0.9 }}>
            🌿 ПОСЛЕДНИЙ ШАНС
          </div>
          <h2
            style={{
              fontSize: 32,
              lineHeight: 1.15,
              margin: "10px 0 10px",
              fontWeight: 900,
              letterSpacing: -0.3,
            }}
          >
            Начните эту осень <b>с ресурса и без страха</b>
            <br />
            за ваше здоровье
          </h2>
          <p style={{ fontSize: 16, opacity: 0.95, margin: 0, lineHeight: 1.55, maxWidth: 600 }}>
            Менопауза — лучшее время для того, чтобы вернуть себе себя. Без лишних слёз, приливов
            и сомнений. Курс стартует <b>в ближайшие 7 дней</b>. До старта цены ниже на 30%.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <a
            href="#buy"
            style={{
              ...btnPrimary,
              background: "#fff",
              color: BRAND.accentDark,
              boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
              justifyContent: "center",
            }}
          >
            🔥 Забрать цену до старта
          </a>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              fontSize: 13.5,
              opacity: 0.95,
            }}
          >
            <span>✓ Рассрочка 0% 6 мес</span>
            <span>·</span>
            <span>✓ Возврат 14 дней</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- FOOTER ---------- */
function Footer() {
  return (
    <footer
      style={{
        marginTop: 64,
        paddingTop: 28,
        borderTop: `1px solid ${BRAND.border}`,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 20,
        color: BRAND.sub,
        fontSize: 13.5,
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <div style={{ fontWeight: 800, color: BRAND.ink, fontSize: 15, marginBottom: 6 }}>
          🌿 Елена Майванди
        </div>
        <div style={{ lineHeight: 1.55 }}>
          Информационный онлайн-курс по менопаузе и МГТ/ЗГТ. Не является медицинской услугой, не
          заменяет очную консультацию врача. Все рекомендации — ознакомительные.
        </div>
      </div>
      <div style={{ display: "flex", gap: 36, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 800, color: BRAND.ink, marginBottom: 8 }}>Курс</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <a href="#program" style={{ color: BRAND.sub, textDecoration: "none" }}>
              Программа
            </a>
            <a href="#buy" style={{ color: BRAND.sub, textDecoration: "none" }}>
              Тарифы
            </a>
            <Link href="/courses" style={{ color: BRAND.sub, textDecoration: "none" }}>
              Академия МГТ
            </Link>
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 800, color: BRAND.ink, marginBottom: 8 }}>Инструменты</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Link href="/" style={{ color: BRAND.sub, textDecoration: "none" }}>
              🩺 Бот-чекап МГТ
            </Link>
            <Link href="/dr-elena" style={{ color: BRAND.sub, textDecoration: "none" }}>
              Лендинг курса
            </Link>
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 800, color: BRAND.ink, marginBottom: 8 }}>Контакты</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span>Telegram: @elena_mayvandi</span>
            <span>Почта: hello@elena-mayvandi.ru</span>
            <span>ИП Майванди Е.В. · ИНН xxx</span>
          </div>
        </div>
      </div>
      <div style={{ width: "100%", marginTop: 8, opacity: 0.7 }}>
        © {new Date().getFullYear()} Елена Майванди · Все права защищены
      </div>
    </footer>
  );
}

/* ---------- SHARED ---------- */
function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div style={{ maxWidth: 760 }}>
      {eyebrow && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 1.2,
            textTransform: "uppercase" as const,
            color: BRAND.accent,
            marginBottom: 10,
          }}
        >
          {eyebrow}
        </div>
      )}
      <h2
        style={{
          fontSize: 34,
          lineHeight: 1.1,
          margin: 0,
          fontWeight: 900,
          letterSpacing: -0.7,
          color: BRAND.ink,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p style={{ marginTop: 12, color: BRAND.sub, fontSize: 16, lineHeight: 1.55 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px 20px",
  borderRadius: 14,
  fontWeight: 800,
  fontSize: 15,
  background: BRAND.accent,
  color: "#fff",
  border: "none",
  cursor: "pointer",
  textDecoration: "none",
  boxShadow: `0 8px 22px ${BRAND.accent}33`,
  transition: "0.15s",
};

const btnGhost: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px 18px",
  borderRadius: 14,
  fontWeight: 700,
  fontSize: 15,
  background: "#fff",
  color: BRAND.ink,
  border: `1.5px solid ${BRAND.border}`,
  cursor: "pointer",
  textDecoration: "none",
};

const btnGhostFill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "14px 20px",
  borderRadius: 14,
  fontWeight: 800,
  fontSize: 15,
  background: BRAND.accentSoft,
  color: BRAND.accentDark,
  border: `1.5px solid ${BRAND.accent}55`,
  cursor: "pointer",
  marginTop: 20,
};

function formatRub(n: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);
}
