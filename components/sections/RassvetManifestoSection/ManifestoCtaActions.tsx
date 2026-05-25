import Link from "next/link";
import { TELEGRAM_URL, VK_URL } from "@/lib/site-links";
import styles from "./rassvet-manifesto.module.css";

export function ManifestoCtaActions() {
  return (
    <div className={styles.ctaInner}>
      <nav className={styles.ctaActions} aria-label="Соцсети и каталог">
        <a
          href={VK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.ctaBtn}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/manifesto/vk.png"
            alt=""
            className={styles.ctaIcon}
            width={22}
            height={22}
          />
          <span>ВК</span>
        </a>
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.ctaBtn}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/manifesto/telegram.png?v=2"
            alt=""
            className={styles.ctaIcon}
            width={22}
            height={22}
          />
          <span>телеграм</span>
        </a>
        <Link href="/catalog" className={styles.ctaBtn}>
          <span className={styles.ctaCatalogMark} aria-hidden>
            →
          </span>
          <span>в КАТАЛОГ</span>
        </Link>
      </nav>
    </div>
  );
}
