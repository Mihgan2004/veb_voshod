import Link from "next/link";
import { LegalDocumentLayout } from "@/components/legal/LegalDocumentLayout";
import { SELLER } from "@/lib/legal/seller";

export const metadata = {
  title: "Контакты и реквизиты — РАССВЕТ",
};

export default function ContactsPage() {
  const siteHost = SELLER.siteUrl.replace(/^https?:\/\//, "");

  return (
    <LegalDocumentLayout title="Контакты и реквизиты" publishedAt={SELLER.legalPublishedAt}>
      <div className="space-y-8 text-[14px] sm:text-[15px] leading-relaxed text-white/60">
        <section>
          <h2 className="text-[16px] font-semibold text-white/80 mb-3">Продавец</h2>
          <p>{SELLER.legalName}</p>
          <p className="mt-2">
            Интернет-магазин «{SELLER.brand}» —{" "}
            <a
              href={SELLER.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-gold underline underline-offset-2"
            >
              {siteHost}
            </a>
          </p>
          <p className="mt-2 text-white/50 text-[13px]">
            Дата регистрации ИП: {SELLER.registrationDate} (ОГРНИП {SELLER.ogrnip}).
          </p>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-white/80 mb-3">Реквизиты</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-white/50 text-[12px] font-mono uppercase tracking-wider">ИНН</dt>
              <dd className="mt-0.5 text-white/80 font-mono">{SELLER.inn}</dd>
            </div>
            <div>
              <dt className="text-white/50 text-[12px] font-mono uppercase tracking-wider">ОГРНИП</dt>
              <dd className="mt-0.5 text-white/80 font-mono">{SELLER.ogrnip}</dd>
            </div>
            <div>
              <dt className="text-white/50 text-[12px] font-mono uppercase tracking-wider">Расчётный счёт</dt>
              <dd className="mt-0.5 text-white/80 font-mono">{SELLER.bank.account}</dd>
            </div>
            <div>
              <dt className="text-white/50 text-[12px] font-mono uppercase tracking-wider">Банк</dt>
              <dd className="mt-0.5 text-white/80">{SELLER.bank.name}</dd>
            </div>
            <div>
              <dt className="text-white/50 text-[12px] font-mono uppercase tracking-wider">БИК</dt>
              <dd className="mt-0.5 text-white/80 font-mono">{SELLER.bank.bik}</dd>
            </div>
            <div>
              <dt className="text-white/50 text-[12px] font-mono uppercase tracking-wider">Корр. счёт</dt>
              <dd className="mt-0.5 text-white/80 font-mono">{SELLER.bank.corrAccount}</dd>
            </div>
            <div>
              <dt className="text-white/50 text-[12px] font-mono uppercase tracking-wider">ИНН банка</dt>
              <dd className="mt-0.5 text-white/80 font-mono">{SELLER.bank.inn}</dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-white/80 mb-3">Контакты</h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-white/50 text-[12px] font-mono uppercase tracking-wider">Телефон</dt>
              <dd className="mt-0.5">
                <a href={`tel:${SELLER.phoneTel}`} className="text-white/80 hover:text-gold transition-colors">
                  {SELLER.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-white/50 text-[12px] font-mono uppercase tracking-wider">Email</dt>
              <dd className="mt-0.5">
                <a href={`mailto:${SELLER.email}`} className="text-white/80 hover:text-gold transition-colors">
                  {SELLER.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-white/50 text-[12px] font-mono uppercase tracking-wider">Telegram</dt>
              <dd className="mt-0.5">
                <a
                  href={SELLER.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-gold transition-colors"
                >
                  {SELLER.telegramHandle}
                </a>
              </dd>
            </div>
          </dl>

          <a
            href={SELLER.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gold/40 bg-gold/[0.08] text-gold font-mono text-[12px] uppercase tracking-[0.2em] hover:bg-gold/[0.15] hover:border-gold/60 transition-all"
          >
            Написать в Telegram
          </a>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-white/80 mb-3">Документы</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/legal/offer" className="text-white/80 hover:text-gold underline underline-offset-2">
                Публичная оферта
              </Link>
            </li>
            <li>
              <Link href="/legal/policy" className="text-white/80 hover:text-gold underline underline-offset-2">
                Политика обработки персональных данных
              </Link>
            </li>
            <li>
              <Link href="/legal/shipping" className="text-white/80 hover:text-gold underline underline-offset-2">
                Условия доставки
              </Link>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-white/80 mb-3">Юрисдикция</h2>
          <p>
            Оказание услуг и продажа товаров осуществляется в рамках юрисдикции Российской Федерации.
          </p>
        </section>
      </div>
    </LegalDocumentLayout>
  );
}
