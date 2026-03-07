import Link from "next/link";

export const metadata = {
  title: "Оферта — VOSKHOD",
};

export default function OfferPage() {
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
          Публичная оферта
        </h1>

        <div className="mt-8 space-y-6 text-[14px] sm:text-[15px] leading-relaxed text-white/60">
          <section>
            <h2 className="text-[16px] font-semibold text-white/80 mb-3">1. Общие положения</h2>
            <p>
              Настоящий документ является официальным предложением (публичной офертой) интернет-магазина VOSKHOD
              (далее — «Продавец») и содержит все существенные условия продажи товаров дистанционным способом.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-white/80 mb-3">2. Предмет оферты</h2>
            <p>
              Продавец обязуется передать в собственность Покупателю товар, а Покупатель обязуется оплатить
              и принять товар на условиях настоящей оферты. Наименование, количество, цена товара определяются
              на основании сведений, предоставленных Покупателем при оформлении заказа.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-white/80 mb-3">3. Момент заключения договора</h2>
            <p>
              Договор считается заключённым с момента оплаты заказа Покупателем. Акцептом оферты является
              оплата заказа в порядке и на условиях, предусмотренных настоящей офертой.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-white/80 mb-3">4. Цена товара и оплата</h2>
            <p>
              Цены на товары указаны в российских рублях и включают все применимые налоги. Оплата производится
              безналичным способом через платёжный сервис ЮKassa. Продавец оставляет за собой право изменять
              цены на товары в одностороннем порядке до момента оплаты заказа.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-white/80 mb-3">5. Возврат и обмен</h2>
            <p>
              Покупатель вправе отказаться от товара надлежащего качества в течение 14 дней с момента получения.
              Возврат товара осуществляется при условии сохранения товарного вида, потребительских свойств,
              а также оригинальной упаковки и бирок.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-white/80 mb-3">6. Контакты</h2>
            <p>
              По всем вопросам, связанным с исполнением настоящей оферты, Покупатель может обратиться
              по электронной почте, указанной на сайте.
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
