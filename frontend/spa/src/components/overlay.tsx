import { useCallback, useRef } from "react";
import { BasePropsWithChildren } from "../lib/std";

interface OverlapProps extends BasePropsWithChildren {
  enabled?: boolean;
  toggle: (enabled: boolean) => void;
}

export function Overlay(props: OverlapProps) {
  const overlayRef = useRef(null);
  const disableUponBackgroundClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (overlayRef.current !== e.target) {
        return;
      }

      props.toggle(false);
    },
    [overlayRef, props.toggle],
  );

  return (
    props.enabled && (
      <div
        ref={overlayRef}
        className={`fixed top-0 left-0 h-screen w-screen bg-black/50 ${props.className}`}
        onClick={e => disableUponBackgroundClick(e)}
      >
        {props.children}
      </div>
    )
  );
}
