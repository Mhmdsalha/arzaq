import Link from "next/link";
import type { ReactNode } from "react";

type PrimaryButtonProps = {
  children: ReactNode;
  href?: string;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
  onClick?: () => void;
  className?: string;
};

export function PrimaryButton({
  children,
  href,
  type = "button",
  variant = "primary",
  onClick,
  className = "",
}: PrimaryButtonProps) {
  const classes = `${variant === "primary" ? "primary-button" : "secondary-button"} ${className}`;

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} type={type} onClick={onClick}>
      {children}
    </button>
  );
}
