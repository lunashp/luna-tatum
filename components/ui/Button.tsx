import { cn } from "@/lib/utils";

/**
 * UI Primitive: Button
 * - 단일 책임: 공통 버튼 스타일 제공 + 원본 props 전달
 */
export function Button({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:opacity-90 disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export default Button;
