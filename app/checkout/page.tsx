import { CheckoutPageClient } from "@/components/checkout/CheckoutPageClient";
import { PageShell } from "@/components/site/PageShell";

export const metadata = {
  title: "Оформление заказа | VOSKHOD",
  description: "Оформление заказа в интернет-магазине VOSKHOD",
};

export default function CheckoutPage() {
  return (
    <PageShell>
      <CheckoutPageClient />
    </PageShell>
  );
}
