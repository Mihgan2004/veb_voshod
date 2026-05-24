import styles from "./text-parallax-section.module.css";

type PhraseProps = {
  src: string;
  label: string;
  accent?: string;
  iconVariant?: "square" | "tall";
};

function PhraseText({ label, accent }: { label: string; accent?: string }) {
  if (!accent) {
    return <p className={styles.text}>{label}</p>;
  }

  const accentIndex = label.indexOf(accent);
  if (accentIndex === -1) {
    return <p className={styles.text}>{label}</p>;
  }

  const before = label.slice(0, accentIndex);
  const after = label.slice(accentIndex + accent.length);

  return (
    <p className={styles.text}>
      {before}
      <span className={styles.textAccent}>{accent}</span>
      {after}
    </p>
  );
}

export function Phrase({ src, label, accent, iconVariant = "square" }: PhraseProps) {
  const iconClassName =
    iconVariant === "tall" ? `${styles.iconWrap} ${styles.iconWrapTall}` : styles.iconWrap;

  return (
    <div className={styles.phrase}>
      <PhraseText label={label} accent={accent} />
      <span className={iconClassName}>
        {/* eslint-disable-next-line @next/next/no-img-element -- прозрачные иконки без оптимизации Next */}
        <img src={src} alt="" className={styles.icon} decoding="async" draggable={false} />
      </span>
    </div>
  );
}
