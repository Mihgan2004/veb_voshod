import Link from "next/link";

export const metadata = {
  title: "Доставка — VOSKHOD",
};

export default function ShippingPage() {
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
          Условия доставки
        </h1>

        <div className="mt-8 space-y-6 text-[14px] sm:text-[15px] leading-relaxed text-white/60">
          <section>
            <h2 className="text-[16px] font-semibold text-white/80 mb-3">Способы доставки</h2>
            <p>
              Доставка осуществляется по всей территории Российской Федерации следующими службами:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-white/70">СДЭК</strong> — до пункта выдачи (ПВЗ), постамата или курьером до двери. Стоимость рассчитывается автоматически при оформлении заказа.</li>
              <li><strong className="text-white/70">Яндекс Доставка</strong> — до пункта выдачи. Стоимость уточняется менеджером.</li>
              <li><strong className="text-white/70">Озон Доставка</strong> — до пункта выдачи. Стоимость уточняется менеджером.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-white/80 mb-3">Сроки доставки</h2>
            <p>
              Сроки доставки зависят от выбранного способа и региона. Ориентировочные сроки указываются
              при оформлении заказа. Стандартный срок обработки и отправки заказа — 1–3 рабочих дня.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-white/80 mb-3">Стоимость доставки</h2>
            <p>
              Стоимость доставки через СДЭК рассчитывается автоматически на этапе оформления заказа
              и зависит от города назначения и выбранного способа (ПВЗ, постамат, курьер).
              Для Яндекс Доставки и Озон стоимость уточняется менеджером после оформления заказа.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-white/80 mb-3">Получение заказа</h2>
            <p>
              При получении заказа проверьте целостность упаковки и соответствие содержимого.
              В случае обнаружения повреждений составьте акт с представителем службы доставки.
            </p>
          </section>

          <p className="text-[12px] text-white/30 pt-4 border-t border-white/[0.06]">
            Дата публикации: 01.01.2026. Действующая редакция.
          </p>
        </div>
      </div>
    </div>
  );
}
