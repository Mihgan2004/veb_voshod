import { LegalDocumentLayout } from "@/components/legal/LegalDocumentLayout";
import { SELLER } from "@/lib/legal/seller";

export const metadata = {
  title: "Доставка — РАССВЕТ",
};

export default function ShippingPage() {
  return (
    <LegalDocumentLayout title="Условия доставки" publishedAt={SELLER.legalPublishedAt}>
        <div className="space-y-6 text-[14px] sm:text-[15px] leading-relaxed text-white/60">
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

        </div>
    </LegalDocumentLayout>
  );
}
