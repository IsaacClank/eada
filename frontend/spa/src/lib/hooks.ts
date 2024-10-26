import { useCallback, useState } from "react";
import { AsyncAction } from "./std";

export function useFetch(dataLoader: AsyncAction) {
  const [finished, setFinished] = useState(false);
  const executeFetch = useCallback(
    () => () => dataLoader().finally(() => setFinished(true)),
    [dataLoader, setFinished],
  );

  return [finished, executeFetch];
}
