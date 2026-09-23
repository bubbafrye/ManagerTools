import type { ButtonHTMLAttributes } from "react";
import styles from "./DefaultBtn.module.css";

export function DefaultBtn({
  className,
  children,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={className ? `${styles.btn} ${className}` : styles.btn}
      {...props}
    >
      <span className={styles.fill} aria-hidden />
      <span className={styles.label}>{children}</span>
      <span className={styles.bevel} aria-hidden />
    </button>
  );
}
