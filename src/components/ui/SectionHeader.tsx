import type { ReactNode } from "react";
import styles from "./SectionHeader.module.css";

type SectionHeaderProps = {
  title: string;
  trailing?: ReactNode;
};

export function SectionHeader({ title, trailing }: SectionHeaderProps) {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      {trailing}
    </div>
  );
}
