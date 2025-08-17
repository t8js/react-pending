import {Store} from '@t8/react-store';
import {type ReactNode, useMemo, useRef} from 'react';
import type {PendingState} from './PendingState';
import {PendingStateContext} from './PendingStateContext';

export type PendingStateProviderProps = {
    value?:
        | Record<string, PendingState>
        | Map<string, Store<PendingState>>
        | null
        | undefined;
    children?: ReactNode;
};

export const PendingStateProvider = ({
    value,
    children,
}: PendingStateProviderProps) => {
    let defaultValueRef = useRef<Map<string, Store<PendingState>> | null>(
        null,
    );

    let resolvedValue = useMemo(() => {
        if (value instanceof Map) return value;

        if (typeof value === 'object' && value !== null)
            return new Map(
                Object.entries(value).map(([key, state]) => [
                    key,
                    new Store(state),
                ]),
            );

        if (defaultValueRef.current === null)
            defaultValueRef.current = new Map<string, Store<PendingState>>();

        return defaultValueRef.current;
    }, [value]);

    return (
        <PendingStateContext.Provider value={resolvedValue}>
            {children}
        </PendingStateContext.Provider>
    );
};
