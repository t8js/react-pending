import { usePendingState } from "../../../index.ts";

export const Status = () => {
  const { complete, error } = usePendingState("fetch-items");

  // if (!initialized) return <>⚪ Initial</>;

  if (!complete) return <>⏳ Busy</>;

  if (error) return <>❌ Error</>;

  return <>✔️ OK</>;
};
