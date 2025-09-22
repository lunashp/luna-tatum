import { cn } from "@/lib/utils";
import { ReactNode } from "react";

/**
 * UI Primitive: Label
 * - 단일 책임: 라벨 텍스트 레이아웃
 */
export function Label({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("mb-1 block text-sm font-medium", className)}>
      {children}
    </label>
  );
}

export default Label;
