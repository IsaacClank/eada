import { PropsWithChildren } from "react";

interface PageContainerProps extends PropsWithChildren {
  className?: string;
}

export function PageContainer({ className, children }: PageContainerProps) {
  return (
    <div
      className={`h-full px-8 lg:py-40 flex flex-col flex-wrap justify-center lg:justify-start items-center bg-blue-50 ${className}`}
    >
      {children}
    </div>
  );
}
