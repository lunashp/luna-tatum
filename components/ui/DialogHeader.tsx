import { ReactNode } from "react";

/**
 * UI Primitive: DialogHeader
 * - 단일 책임: 다이얼로그 제목 영역
 */
export function DialogHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`px-6 py-4 border-b text-lg font-semibold flex-shrink-0 bg-gray-50 ${className}`}
    >
      {children}
    </div>
  );
}

export default DialogHeader;
