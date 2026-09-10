"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Message =
  | { role: "bot"; text: string; stepMeta?: StepMeta; kind?: "question" | "final" | "followup" }
  | { role: "user"; text: string };

type StepMeta = {
  stepId: string;
  answerType: "number" | "boolean" | "multi" | "object" | "text" | "final";
  options?: { key: string; label: string; hint?: string }[] | null;
  objectSchema?: Record<string, { kind: "number" | "boolean" | "select"; label: string; options?: { key: string; label: string }[] }> | null;
  helpText?: string | null;
  title?: string;
  followupAvailable?: boolean;
};

const SESSION_KEY = "mht_session_id_v1";

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "s-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stepMeta, setStepMeta] = useState<StepMeta | null>(null);
  const [typing, setTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [finalDone, setFinalDone] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(SESSION_KEY) : null;
    const id = stored || uuid();
    if (!stored) window.localStorage.setItem(SESSION_KEY, id);
    setSessionId(id);
    void boot(id);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  async function boot(id: string) {
    setTyping(true);
    const r = await fetch("/api/bot/step", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: id }),
    }).then((res) => res.json());
    setTyping(false);
    if (r?.question) pushBotQuestion(r);
  }

  function pushBotQuestion(r: any) {
    const meta: StepMeta = {
      stepId: r.nextStepId,
      answerType: r.answerType,
      options: r.options,
      objectSchema: r.objectSchema,
      helpText: r.helpText,
      title: r.title,
      followupAvailable: r.followupAvailable,
    };
    setStepMeta(meta);
    setMessages((m) => [
      ...m,
      {
        role: "bot",
        text: r.question,
        stepMeta: meta,
        kind: r.isFinal ? "final" : "question",
      },
    ]);
    if (r.isFinal && r.summary) {
      setMessages((m) => [
        ...m,
        { role: "bot", text: r.summary, kind: "final" },
      ]);
      setFinalDone(true);
      if (r.followupAvailable) {
        setStepMeta({
          stepId: "followup",
          answerType: "text",
          helpText: "Можно оставить пустым — пропустить.",
          title: "Уточняющий вопрос ИИ",
        });
        setMessages((m) => [
          ...m,
          {
            role: "bot",
            text: "Если у вас есть уточняющий вопрос по теме — напишите ниже, ответит ИИ (не заменяет врача).",
            stepMeta: { stepId: "followup", answerType: "text" },
            kind: "followup",
          },
        ]);
      }
    }
  }

  async function submit(answer: unknown) {
    if (!sessionId || typing) return;
    let userText = formatUserText(answer);
    if (userText) setMessages((m) => [...m, { role: "user", text: userText }]);
    setTyping(true);
    const stepId = stepMeta?.stepId;
    const isFollowup = stepId === "followup";
    const payload: any = { sessionId };
    if (isFollowup) {
      payload.followupQuestion = typeof answer === "string" ? answer : "";
    } else {
      payload.answer = answer;
    }
    const r = await fetch("/api/bot/step", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((res) => res.json());
    setTyping(false);
    if (r?.followupReply) {
      setMessages((m) => [
        ...m,
        { role: "bot", text: r.followupReply, kind: "followup" },
      ]);
      setStepMeta(null);
      return;
    }
    if (r?.question) pushBotQuestion(r);
  }

  function formatUserText(a: unknown): string {
    if (typeof a === "string") return a;
    if (typeof a === "number") return String(a);
    if (typeof a === "boolean") return a ? "Да" : "Нет";
    if (a && typeof a === "object") {
      const entries = Object.entries(a as Record<string, unknown>);
      if (entries.every(([, v]) => typeof v === "boolean")) {
        const chosen = entries.filter(([, v]) => v).map(([k]) => k);
        if (chosen.length === 0) return "Ничего не отмечено";
        const label = stepMeta?.options?.find((o) => o.key === chosen[0])?.label;
        if (label) {
          return entries
            .filter(([, v]) => v)
            .map(([k]) => stepMeta?.options?.find((o) => o.key === k)?.label || k)
            .join(", ");
        }
        return JSON.stringify(a);
      }
      return Object.entries(a as Record<string, unknown>)
        .map(([k, v]) => `${k}: ${typeof v === "boolean" ? (v ? "Да" : "Нет") : String(v)}`)
        .join("; ");
    }
    return "";
  }

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm">
      <div
        ref={scrollRef}
        className="max-h-[68vh] overflow-y-auto p-5 md:p-8 space-y-5"
      >
        {messages.length === 0 && (
          <div className="text-sm text-neutral-500">Загружаем первый вопрос…</div>
        )}

        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}

        {typing && <TypingDots />}
      </div>

      <div className="border-t border-border p-5 md:p-6">
        {stepMeta && !isCompletedScreen(stepMeta, messages) && (
          <InputByType stepMeta={stepMeta} onSubmit={submit} />
        )}
        {!stepMeta && finalDone && (
          <div className="text-sm text-neutral-500">
            Опрос завершён. Распечатайте заключение или сделайте скриншот для врача на приёме.
          </div>
        )}
      </div>
    </div>
  );

  function stepMetaIsQuestion(meta: StepMeta) {
    return ["number", "boolean", "multi", "object", "text"].includes(meta.answerType);
  }
}

function isCompletedScreen(meta: StepMeta, msgs: Message[]) {
  if (meta.stepId === "followup") return false;
  const hasFinal = msgs.some((x) => x.role === "bot" && (x as any).kind === "final");
  return hasFinal && !["number", "boolean", "multi", "object", "text"].includes(meta.answerType);
}

function finalDoneWhen(_meta: StepMeta, msgs: Message[]) {
  return msgs.some((x) => x.role === "bot" && (x as any).kind === "final");
}

function MessageBubble({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-neutral-900 text-neutral-50 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.text}
        </div>
      </div>
    );
  }
  const botMsg = message as Message & { kind?: string; stepMeta?: StepMeta };
  const isFinal = botMsg.kind === "final";
  return (
    <div className="flex justify-start">
      <div
        className={
          "max-w-[90%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words " +
          (isFinal
            ? "bg-amber-50 border border-amber-200 text-neutral-900"
            : "bg-neutral-100 text-neutral-900")
        }
      >
        {botMsg.stepMeta?.title && !isFinal && (
          <div className="text-[11px] uppercase tracking-wider text-neutral-500 mb-1">
            {botMsg.stepMeta.title}
          </div>
        )}
        {botMsg.kind === "final" && (
          <div className="text-[11px] uppercase tracking-wider text-amber-700 mb-1">
            Предварительное заключение · не заменяет врача
          </div>
        )}
        <div>{message.text}</div>
        {botMsg.stepMeta?.helpText && !isFinal && (
          <div className="mt-2 pt-2 border-t border-white/40 text-xs text-neutral-500">
            💡 {botMsg.stepMeta.helpText}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-neutral-100 px-5 py-4 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce"></span>
      </div>
    </div>
  );
}

function InputByType({
  stepMeta,
  onSubmit,
}: {
  stepMeta: StepMeta;
  onSubmit: (answer: unknown) => void;
}) {
  switch (stepMeta.answerType) {
    case "number":
      return <NumberInput onSubmit={onSubmit} />;
    case "boolean":
      return <BooleanInput onSubmit={onSubmit} />;
    case "multi":
      return <MultiInput stepMeta={stepMeta} onSubmit={onSubmit} />;
    case "object":
      return <ObjectInput stepMeta={stepMeta} onSubmit={onSubmit} />;
    case "text":
      return <TextInput stepMeta={stepMeta} onSubmit={onSubmit} />;
    case "final":
    default:
      return null;
  }
}

function NumberInput({ onSubmit }: { onSubmit: (a: number) => void }) {
  const [v, setV] = useState<string>("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const n = parseFloat(v);
        if (Number.isFinite(n)) onSubmit(n);
      }}
      className="flex gap-3 items-end"
    >
      <label className="flex-1">
        <span className="block text-xs text-neutral-500 mb-1.5">Число</span>
        <input
          type="number"
          autoFocus
          min={0}
          max={110}
          value={v}
          onChange={(e) => setV(e.target.value)}
          className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-neutral-900 transition"
          placeholder="Например: 51"
        />
      </label>
      <button
        type="submit"
        className="rounded-xl bg-neutral-900 text-white px-5 py-3 text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
        disabled={!v}
      >
        Далее
      </button>
    </form>
  );
}

function BooleanInput({ onSubmit }: { onSubmit: (b: boolean) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        autoFocus
        type="button"
        onClick={() => onSubmit(true)}
        className="rounded-xl border border-neutral-900/20 px-5 py-4 text-sm font-medium hover:bg-neutral-900 hover:text-white transition"
      >
        Да
      </button>
      <button
        type="button"
        onClick={() => onSubmit(false)}
        className="rounded-xl border border-border bg-white px-5 py-4 text-sm font-medium hover:bg-neutral-100 transition"
      >
        Нет
      </button>
    </div>
  );
}

function MultiInput({
  stepMeta,
  onSubmit,
}: {
  stepMeta: StepMeta;
  onSubmit: (value: Record<string, boolean>) => void;
}) {
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const options = stepMeta.options || [];
  const toggle = (k: string) => setSel((s) => ({ ...s, [k]: !s[k] }));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {options.map((o) => (
          <label
            key={o.key}
            className={
              "cursor-pointer select-none rounded-xl border px-4 py-3 text-sm transition " +
              (sel[o.key]
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-border bg-white hover:bg-neutral-50")
            }
          >
            <input
              type="checkbox"
              className="hidden"
              checked={!!sel[o.key]}
              onChange={() => toggle(o.key)}
            />
            <div className="flex items-start gap-2">
              <span
                className={
                  "mt-0.5 inline-block w-4 h-4 rounded border shrink-0 transition " +
                  (sel[o.key] ? "bg-white border-white" : "border-neutral-400 bg-white")
                }
              ></span>
              <span>{o.label}</span>
            </div>
            {o.hint && <div className="text-xs opacity-80 mt-1 ml-6">{o.hint}</div>}
          </label>
        ))}
      </div>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => onSubmit(sel)}
          className="rounded-xl bg-neutral-900 text-white px-5 py-3 text-sm font-medium hover:bg-neutral-800"
        >
          Далее
        </button>
      </div>
    </div>
  );
}

function ObjectInput({
  stepMeta,
  onSubmit,
}: {
  stepMeta: StepMeta;
  onSubmit: (value: Record<string, unknown>) => void;
}) {
  const schema = stepMeta.objectSchema || {};
  const keys = Object.keys(schema);
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const v: Record<string, unknown> = {};
    for (const k of keys) {
      const f = schema[k];
      if (f.kind === "number") v[k] = "";
      else if (f.kind === "boolean") v[k] = false;
      else v[k] = (f.options?.[0]?.key) || "";
    }
    return v;
  });

  function canSubmit() {
    for (const k of keys) {
      const f = schema[k];
      if (f.kind === "number") {
        const n = Number(values[k]);
        if (!Number.isFinite(n) || n <= 0) return false;
      }
    }
    return true;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit()) return;
        const out: Record<string, unknown> = {};
        for (const k of keys) {
          const f = schema[k];
          if (f.kind === "number") out[k] = Number(values[k]);
          else out[k] = values[k];
        }
        onSubmit(out);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {keys.map((k) => {
          const f = schema[k];
          if (f.kind === "number") {
            return (
              <label key={k} className="block">
                <span className="block text-xs text-neutral-500 mb-1.5">{f.label}</span>
                <input
                  type="number"
                  min={0}
                  value={values[k] as string}
                  onChange={(e) => setValues((v) => ({ ...v, [k]: e.target.value }))}
                  className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-neutral-900 transition"
                />
              </label>
            );
          }
          if (f.kind === "boolean") {
            const checked = !!values[k];
            return (
              <button
                key={k}
                type="button"
                onClick={() => setValues((v) => ({ ...v, [k]: !checked }))}
                className={
                  "text-left rounded-xl border px-4 py-3 text-sm transition " +
                  (checked
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-border bg-white hover:bg-neutral-50")
                }
              >
                {f.label}
                <span className="block text-[11px] opacity-70 mt-0.5">
                  {checked ? "Да" : "Нет"}
                </span>
              </button>
            );
          }
          return (
            <label key={k} className="block">
              <span className="block text-xs text-neutral-500 mb-1.5">{f.label}</span>
              <select
                value={values[k] as string}
                onChange={(e) => setValues((v) => ({ ...v, [k]: e.target.value }))}
                className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-neutral-900 transition bg-white"
              >
                {f.options?.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit()}
          className="rounded-xl bg-neutral-900 text-white px-5 py-3 text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
        >
          Далее
        </button>
      </div>
    </form>
  );
}

function TextInput({
  stepMeta,
  onSubmit,
}: {
  stepMeta: StepMeta;
  onSubmit: (text: string) => void;
}) {
  const [t, setT] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(t);
      }}
      className="space-y-3"
    >
      <textarea
        autoFocus
        value={t}
        onChange={(e) => setT(e.target.value)}
        rows={3}
        placeholder={stepMeta.stepId === "followup" ? "Задайте вопрос…" : "Текст"}
        className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-neutral-900 transition resize-none text-sm"
      />
      <div className="flex justify-end gap-2">
        {stepMeta.stepId === "followup" && (
          <button
            type="button"
            onClick={() => onSubmit("")}
            className="rounded-xl border border-border px-4 py-3 text-sm hover:bg-neutral-100"
          >
            Пропустить
          </button>
        )}
        <button
          type="submit"
          className="rounded-xl bg-neutral-900 text-white px-5 py-3 text-sm font-medium hover:bg-neutral-800"
        >
          Отправить
        </button>
      </div>
    </form>
  );
}
