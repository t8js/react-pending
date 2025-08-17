import type {Store} from '@t8/react-store';
import {createContext} from 'react';
import type {PendingState} from './PendingState';

export const PendingStateContext = createContext(
    new Map<string, Store<PendingState>>(),
);
