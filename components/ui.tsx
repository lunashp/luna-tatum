import { cn } from "@/lib/utils";
import { ReactNode } from "react";

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

/**
 * UI Primitive: Dialog
 * - 단일 책임: 모달 컨테이너와 오버레이
 */
export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-2xl rounded-lg bg-white p-4"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * UI Primitive: DialogHeader
 * - 단일 책임: 다이얼로그 제목 영역
 */
export function DialogHeader({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 text-lg font-semibold flex-shrink-0">{children}</div>
  );
}

/**
 * UI Primitive: DialogFooter
 * - 단일 책임: 다이얼로그 버튼 영역 레이아웃
 */
export function DialogFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 flex justify-end gap-2 flex-shrink-0 px-6 py-4">
      {children}
    </div>
  );
}
