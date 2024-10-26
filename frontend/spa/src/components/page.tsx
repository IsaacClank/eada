import { PropsWithChildren } from "react";

interface PageContainerProps extends PropsWithChildren {
  className?: string;
}

export function PageContainer({ className, children }: PageContainerProps) {
  const defaultClassName =
    "h-full px-8 py-40 flex flex-col flex-wrap justify-center lg:justify-start items-center";

  className = className?.length == 0 ? defaultClassName : `${defaultClassName} ${className}`;

  return <div className={className}>{children}</div>;
}
