import Chat from "@/components/Chat";

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 md:py-16">
      <header className="mb-8 md:mb-12 border-b border-border pb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-3">
          Предварительный чек-лист
        </p>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
          Диагностика к МГТ / ЗГТ
        </h1>
        <div className="text-sm text-neutral-600 leading-relaxed max-w-2xl">
          Ответьте на несколько вопросов — бот соберёт анамнез и выдаст
          предварительное заключение по показаниям и противопоказаниям к
          менопаузальной гормональной терапии.
          <span className="block mt-2 font-medium text-neutral-800">
            ⚠️ Этот инструмент не заменяет очную консультацию врача.
          </span>
        </div>
      </header>

      <Chat />
    </main>
  );
}
