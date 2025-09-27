import { usePendingState } from "../../..";

export const Status = () => {
  const [state] = usePendingState("fetch-items");

  // if (!state.initialized) return "⚪ Initial";

  if (!state.complete) return "⏳ Busy";

  if (state.error) return "❌ Error";

  return "✔️ OK";
};
