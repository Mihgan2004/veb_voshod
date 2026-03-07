import Link from "next/link";

export const metadata = {
  title: "Конфиденциальность — VOSKHOD",
};

export default function PolicyPage() {
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
          Политика конфиденциальности
        </h1>

        <div className="mt-8 space-y-6 text-[14px] sm:text-[15px] leading-relaxed text-white/60">
          <section>
            <h2 className="text-[16px] font-semibold text-white/80 mb-3">1. Сбор информации</h2>
            <p>
              При оформлении заказа мы собираем следующие данные: имя, адрес электронной почты,
              номер телефона (при указании), адрес доставки. Данные используются исключительно
              для обработки заказа и связи с покупателем.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-white/80 mb-3">2. Использование данных</h2>
            <p>
              Персональные данные используются для: обработки и доставки заказа, информирования
              о статусе заказа, улучшения качества обслуживания. Мы не передаём персональные данные
              третьим лицам, за исключением случаев, необходимых для исполнения заказа (служба доставки,
              платёжный сервис).
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-white/80 mb-3">3. Защита данных</h2>
            <p>
              Мы принимаем необходимые организационные и технические меры для защиты персональных
              данных от несанкционированного доступа, изменения, раскрытия или уничтожения. Оплата
              осуществляется через защищённый сервис ЮKassa — данные банковских карт не хранятся
              на наших серверах.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-white/80 mb-3">4. Файлы cookie</h2>
            <p>
              Сайт может использовать файлы cookie для обеспечения корректной работы корзины
              и персонализации. Вы можете отключить cookies в настройках браузера.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-white/80 mb-3">5. Права пользователя</h2>
            <p>
              Вы вправе запросить удаление своих персональных данных, обратившись по электронной
              почте, указанной на сайте. Запрос будет обработан в течение 30 рабочих дней.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-white/80 mb-3">6. Изменения</h2>
            <p>
              Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности.
              Актуальная версия всегда доступна на данной странице.
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
