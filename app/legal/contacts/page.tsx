import Link from "next/link";

export const metadata = {
  title: "Контакты и реквизиты — VOSKHOD",
};

const TELEGRAM_URL = "https://t.me/moderatorBOCXOD";

export default function ContactsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="text-[11px] font-mono uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors"
        >
          ← На главную
        </Link>

        <h1 className="mt-6 text-[24px] sm:text-[32px] font-semibold tracking-[-0.02em] text-white">
          Контакты и реквизиты
        </h1>

        <div className="mt-8 space-y-6 text-[14px] sm:text-[15px] leading-relaxed text-white/60">
          <section>
            <h2 className="text-[16px] font-semibold text-white/80 mb-3">Реквизиты</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-white/50 text-[12px] font-mono uppercase tracking-wider">ИНН</dt>
                <dd className="mt-0.5 text-white/80 font-mono">312010878603</dd>
              </div>
              <div>
                <dt className="text-white/50 text-[12px] font-mono uppercase tracking-wider">ФИО</dt>
                <dd className="mt-0.5 text-white/80">Остапенко Михаил Вадимович</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-white/80 mb-3">Контакты</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-white/50 text-[12px] font-mono uppercase tracking-wider">Телефон</dt>
                <dd className="mt-0.5">
                  <a href="tel:89205760439" className="text-white/80 hover:text-gold transition-colors">
                    8 920 576-04-39
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-white/50 text-[12px] font-mono uppercase tracking-wider">Email</dt>
                <dd className="mt-0.5">
                  <a href="mailto:tratonis2004@mail.ru" className="text-white/80 hover:text-gold transition-colors">
                    tratonis2004@mail.ru
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-white/50 text-[12px] font-mono uppercase tracking-wider">Telegram</dt>
                <dd className="mt-0.5">
                  <a
                    href={TELEGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-gold transition-colors"
                  >
                    t.me/moderatorBOCXOD
                  </a>
                </dd>
              </div>
            </dl>

            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gold/40 bg-gold/[0.08] text-gold font-mono text-[12px] uppercase tracking-[0.2em] hover:bg-gold/[0.15] hover:border-gold/60 transition-all"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
              Написать в Telegram
            </a>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-white/80 mb-3">Юрисдикция</h2>
            <p>
              Оказание услуг и продажа товаров осуществляется исключительно в рамках юрисдикции Российской Федерации.
            </p>
          </section>

          <p className="text-[12px] text-white/30 pt-4 border-t border-white/[0.06]">
            Дата публикации: 21.03.2026. Действующая редакция.
          </p>
        </div>
      </div>
    </div>
  );
}
