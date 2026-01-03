import { usePendingState } from "../../../index.ts";

export let Status = () => {
  let { initial, pending, error } = usePendingState("fetch-items");

  // if (initial) return <>⚪ Initial</>;

  if (initial || pending) return <>⏳ Busy</>;

  if (error) return <>❌ Error</>;

  return <>✔️ OK</>;
};
