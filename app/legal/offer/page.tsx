import { LegalDocumentLayout } from "@/components/legal/LegalDocumentLayout";
import { LegalParagraphs } from "@/components/legal/LegalParagraphs";
import { OFFER_PARAGRAPHS } from "@/lib/legal/offer-paragraphs";
import { SELLER } from "@/lib/legal/seller";

export const metadata = {
  title: "Оферта — РАССВЕТ",
};

export default function OfferPage() {
  return (
    <LegalDocumentLayout title="Публичная оферта" publishedAt={SELLER.legalPublishedAt}>
      <LegalParagraphs paragraphs={OFFER_PARAGRAPHS} skipTitle />
    </LegalDocumentLayout>
  );
}
