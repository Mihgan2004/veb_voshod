import { CheckoutPageClient } from "@/components/checkout/CheckoutPageClient";
import { PageShell } from "@/components/site/PageShell";

export const metadata = {
  title: "Оформление заказа | РАССВЕТ",
  description: "Оформление заказа в интернет-магазине РАССВЕТ",
};

export default function CheckoutPage() {
  return (
    <PageShell>
      <CheckoutPageClient />
    </PageShell>
  );
}
