import { isStore, type SetStoreValue, Store, useStore } from "@t8/react-store";
import { useCallback, useContext, useMemo, useRef, useState } from "react";
import type { PendingState } from "./PendingState.ts";
import { PendingStateContext } from "./PendingStateContext.ts";

function createState(
  initial = true,
  pending = false,
  error?: unknown,
): PendingState {
  return {
    initial,
    pending,
    error,
    time: Date.now(),
  };
}

export type TrackOptions = {
  /**
   * Whether to track the action state silently (e.g. with a background
   * action or an optimistic update).
   *
   * When set to `true`, the state's `pending` property doesn't switch
   * to `true` in the pending state.
   */
  silent?: boolean;
  /**
   * Delays switching the action state's `pending` property to `true`
   * in the pending state by the given number of milliseconds.
   *
   * Use case: to avoid flashing a process indicator if the action is
   * likely to complete by the end of a short delay.
   */
  delay?: number;
  /**
   * Allows the async action to reject explicitly, along with exposing
   * the action state's `error` property that goes by default.
   */
  throws?: boolean;
};

/**
 * Returns an instance of an action's state and the functions to update it.
 *
 * @param store - An optional unique string key or a store. Providing a
 * key or a shared store allows to share the state across multiple
 * components. If omitted, the pending state stays locally scoped to the
 * component where the hook is used.
 *
 * @returns `{ initial, pending, error, track, update }`, where
 * - `initial`, `pending`, `error` reflect the current action's state;
 * - `track(action, options?)` tracks the `actions`'s state;
 * - `update(nextState | ((state) => nextState))` can be used to replace
 * the current pending state directly with an another value.
 */
export function usePendingState(
  store?: string | Store<PendingState> | null,
): PendingState & {
  track: <T>(value: T) => T;
  update: SetStoreValue<PendingState>;
} {
  let storeMap = useContext(PendingStateContext);
  let storeRef = useRef<Store<PendingState> | null>(null);
  let [storeItemInited, setStoreItemInited] = useState(false);

  let resolvedStore = useMemo(() => {
    if (isStore<PendingState>(store)) return store;

    if (typeof store === "string") {
      let storeItem = storeMap.get(store);

      if (!storeItem) {
        storeItem = new Store(createState());
        storeMap.set(store, storeItem);

        if (!storeItemInited) setStoreItemInited(true);
      }

      return storeItem;
    }

    if (!storeRef.current) storeRef.current = new Store(createState());

    return storeRef.current;
  }, [store, storeMap, storeItemInited]);

  let [state, setState] = useStore(resolvedStore);

  let track = useCallback(
    <T>(value: T, options?: TrackOptions): T => {
      if (value instanceof Promise) {
        let delayedPending: ReturnType<typeof setTimeout> | null = null;

        if (!options?.silent) {
          let delay = options?.delay;

          if (delay === undefined)
            setState((prevState) => ({
              ...prevState,
              ...createState(false, true),
            }));
          else
            delayedPending = setTimeout(() => {
              setState((prevState) => ({
                ...prevState,
                ...createState(false, true),
              }));

              delayedPending = null;
            }, delay);
        }

        return value
          .then((resolvedValue) => {
            if (delayedPending !== null) clearTimeout(delayedPending);

            setState((prevState) => ({
              ...prevState,
              ...createState(false, false),
            }));

            return resolvedValue;
          })
          .catch((error) => {
            if (delayedPending !== null) clearTimeout(delayedPending);

            setState((prevState) => ({
              ...prevState,
              ...createState(false, false, error),
            }));

            if (options?.throws) throw error;
          }) as T;
      }

      setState((prevState) => ({
        ...prevState,
        ...createState(false, false),
      }));

      return value;
    },
    [setState],
  );

  return useMemo(
    () => ({
      ...state,
      track,
      update: setState,
    }),
    [state, track, setState],
  );
}
