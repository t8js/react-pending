import { isStore, type SetStoreValue, Store, useStore } from "@t8/react-store";
import { useCallback, useContext, useMemo, useRef, useState } from "react";
import type { PendingState } from "./PendingState.ts";
import { PendingStateContext } from "./PendingStateContext.ts";

function createState(
  initialized = false,
  complete = false,
  error?: unknown,
): PendingState {
  return {
    initialized,
    complete,
    error,
    time: Date.now(),
  };
}

export type TrackOptions = {
  /**
   * Whether to track the action state silently (e.g. with a background
   * action or an optimistic update).
   *
   * When set to `true`, the state's `complete` property doesn't switch
   * to `false` in the pending state.
   */
  silent?: boolean;
  /**
   * Delays switching the action state's `complete` property to `false`
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
 * @param store - A unique store key or a store. Providing a store
 * key or a shared store allows to share the state across multiple
 * components.
 *
 * @returns `{ initialized, complete, error, track, update }`, where
 * - `initialized`, `complete`, `error` reflect the current action's state;
 * - `track(action, options?)` tracks the `actions`'s state;
 * - `update(nextState | ((state) => nextState))` can be used to replace
 * the current `state` value directly with an another state value.
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
              ...createState(true, false),
            }));
          else
            delayedPending = setTimeout(() => {
              setState((prevState) => ({
                ...prevState,
                ...createState(true, false),
              }));

              delayedPending = null;
            }, delay);
        }

        return value
          .then((resolvedValue) => {
            if (delayedPending !== null) clearTimeout(delayedPending);

            setState((prevState) => ({
              ...prevState,
              ...createState(true, true),
            }));

            return resolvedValue;
          })
          .catch((error) => {
            if (delayedPending !== null) clearTimeout(delayedPending);

            setState((prevState) => ({
              ...prevState,
              ...createState(true, true, error),
            }));

            if (options?.throws) throw error;
          }) as T;
      }

      setState((prevState) => ({
        ...prevState,
        ...createState(true, true),
      }));

      return value;
    },
    [setState],
  );

  return {
    ...state,
    track,
    update: setState,
  };
}
