import {isStore, type SetStoreState, Store, useStore} from '@t8/react-store';
import {useCallback, useContext, useMemo, useRef, useState} from 'react';
import type {PendingState} from './PendingState';
import {PendingStateContext} from './PendingStateContext';

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

export type WithStateOptions = {
    silent?: boolean;
    throws?: boolean;
    delay?: number;
};

/**
 * Returns an array containing `[state, withState, setState]`:
 * - `state` reflects the state of a value passed to `withState()`;
 * - `withState(value, [options])` enables the tracking of the state
 * of `value`; setting the options to `{silent: true}` prevents
 * `withState()` from updating the state while `value` is pending
 * (e.g. for background or optimistic updates);
 * - `setState()` to directly update the state.
 */
export function usePendingState(
    /**
     * A unique store key or a store. Providing a store key or a
     * shared store allows to share the state across multiple
     * components.
     */
    store?: string | Store<PendingState> | null,
): [PendingState, <T>(value: T) => T, SetStoreState<PendingState>] {
    let storeMap = useContext(PendingStateContext);
    let storeRef = useRef<Store<PendingState> | null>(null);
    let [storeItemInited, setStoreItemInited] = useState(false);

    let resolvedStore = useMemo(() => {
        if (isStore<PendingState>(store)) return store;

        if (typeof store === 'string') {
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

    let withState = useCallback(
        <T>(value: T, options?: WithStateOptions): T => {
            if (value instanceof Promise) {
                let delayedPending: ReturnType<typeof setTimeout> | null = null;

                if (!options?.silent) {
                    let delay = options?.delay;

                    if (delay === undefined)
                        setState(prevState => ({
                            ...prevState,
                            ...createState(true, false),
                        }));
                    else
                        delayedPending = setTimeout(() => {
                            setState(prevState => ({
                                ...prevState,
                                ...createState(true, false),
                            }));

                            delayedPending = null;
                        }, delay);
                }

                return value
                    .then(resolvedValue => {
                        if (delayedPending !== null)
                            clearTimeout(delayedPending);

                        setState(prevState => ({
                            ...prevState,
                            ...createState(true, true),
                        }));

                        return resolvedValue;
                    })
                    .catch(error => {
                        if (delayedPending !== null)
                            clearTimeout(delayedPending);

                        setState(prevState => ({
                            ...prevState,
                            ...createState(true, true, error),
                        }));

                        if (options?.throws) throw error;
                    }) as T;
            }

            setState(prevState => ({
                ...prevState,
                ...createState(true, true),
            }));

            return value;
        },
        [setState],
    );

    return [state, withState, setState];
}
