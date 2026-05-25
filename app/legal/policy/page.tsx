import Link from "next/link";
import { LegalDocumentLayout } from "@/components/legal/LegalDocumentLayout";
import { LegalParagraphs } from "@/components/legal/LegalParagraphs";
import { POLICY_PARAGRAPHS } from "@/lib/legal/policy-paragraphs";
import { SELLER } from "@/lib/legal/seller";

export const metadata = {
  title: "Конфиденциальность — РАССВЕТ",
};

export default function PolicyPage() {
  return (
    <LegalDocumentLayout
      title="Политика обработки персональных данных"
      publishedAt={SELLER.legalPublishedAt}
    >
      <LegalParagraphs paragraphs={POLICY_PARAGRAPHS} skipTitle />
      <p className="mt-6 text-[14px] text-white/60">
        Контакты оператора и реквизиты:{" "}
        <Link href="/legal/contacts" className="text-white/80 hover:text-gold underline underline-offset-2">
          страница контактов
        </Link>
        .
      </p>
    </LegalDocumentLayout>
  );
}
