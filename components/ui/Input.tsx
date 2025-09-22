import { cn } from "@/lib/utils";

/**
 * UI Primitive: Input
 * - 단일 책임: 공통 인풋 스타일 제공 + 원본 props 전달
 */
export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm outline-none ring-offset-0 focus:ring-2 focus:ring-ring",
        className
      )}
      {...props}
    />
  );
}

export default Input;
