import { PropsWithChildren } from "react";

interface PageContainerProps extends PropsWithChildren {
  className?: string;
}

export default function PageContainer({ className, children }: PageContainerProps) {
  const defaultClassName = "flex justify-center h-full";

  className = className?.length == 0 ? defaultClassName : `${defaultClassName} ${className}`;

  return <div className={className}>{children}</div>;
}
