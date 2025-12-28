# T8 React Pending

Self-contained async action state management for React apps

[![npm](https://img.shields.io/npm/v/@t8/react-pending?labelColor=345&color=46e)](https://www.npmjs.com/package/@t8/react-pending) ![Lightweight](https://img.shields.io/bundlephobia/minzip/@t8/react-pending?label=minzip&labelColor=345&color=46e)

**Features:** Decoupled from app state management and async actions' internals&nbsp;&middot; Local or shared async action state&nbsp;&middot; CSR/SSR-compatible

<!-- docsgen-show-start --
```diff
+ import { usePendingState } from "@t8/react-pending";

  export let ItemList = () => {
    let [items, setItems] = useState([]);
+   let [state, withState] = usePendingState("fetch-items");

    useEffect(() => {
-     fetchItems().then(setItems);
+     withState(fetchItems()).then(setItems);
    }, [fetchItems, withState]);

+   if (!state.complete) return <p>Loading...</p>;
+   if (state.error) return <p>An error occurred</p>;

    return <ul>{items.map(/* ... */)}</ul>;
  };
```
-- docsgen-show-end -->

Installation: `npm i @t8/react-pending`

## Shared pending state

Objective: Track the pending state of the asynchronous action `fetchItems()` to tell the user whether the UI is busy handling the async action or encountered an error, without rewriting the action and the app's state management.

In our setup, there are two components rendering their content with regard to the current state of `fetchItems()`, so the pending state is shared between these components:

```diff
+ import { usePendingState } from "@t8/react-pending";

  export let ItemList = () => {
    let [items, setItems] = useState([]);
+   let [state, withState] = usePendingState("fetch-items");

    useEffect(() => {
-     fetchItems().then(setItems);
+     withState(fetchItems()).then(setItems);
    }, [fetchItems, withState]);

+   if (!state.complete) return <p>Loading...</p>;
+   if (state.error) return <p>An error occurred</p>;

    return <ul>{items.map(/* ... */)}</ul>;
  };
```

```diff
+ import { usePendingState } from "@t8/react-pending";

  export let Status = () => {
+   let [state] = usePendingState("fetch-items");

    if (!state.initialized) return null;
    if (!state.complete) return <>Busy</>;
    if (state.error) return <>Error</>;

    return <>OK</>;
  };
```

[Live demo](https://codesandbox.io/p/sandbox/rrr9cl?file=%2Fsrc%2FItemList.tsx)

⬥ To share the async action's pending state with multiple components we're using the string key parameter of `usePendingState(stateKey)`. This key can be used with `usePendingState(stateKey)` in other components to refer to the same pending state (as in the `Status` component above), so `stateKey` should be unique to the particular pending state.

⬥ In the example above, the data returned from the async action is stored in the component's local state, but it can be stored in any app state of the developer's choice without affecting how the `usePendingState()` hook is used.

## Local pending state

Omit the custom string key parameter of `usePendingState()` to scope the pending state locally within a single component:

```diff
- let [state, withState] = usePendingState("fetch-items"); // shared
+ let [state, withState] = usePendingState(); // local
```

## Silent tracking of background actions and optimistic updates

```diff
- withState(fetchItems())
+ withState(fetchItems(), { silent: true })
```

⬥ This option prevents `state.complete` from switching to `false` in the pending state.

## Delayed pending state

```diff
- withState(fetchItems())
+ withState(fetchItems(), { delay: 500 }) // in milliseconds
```

⬥ Use case: avoiding flashing a process indicator when the action is likely to complete by the end of a short delay.

## Custom rejection handler

```diff
- withState(fetchItems())
+ withState(fetchItems(), { throws: true }).catch(handleError)
```

⬥ This option allows the async action to reject explicitly, along with exposing `state.error` that goes by default.

## Providing blank initial pending&nbsp;state

```diff
+ import { PendingStateProvider } from "@t8/react-pending";

- <App/>
+ <PendingStateProvider>
+   <App/>
+ </PendingStateProvider>
```

⬥ `<PendingStateProvider>` creates an isolated instance of initial shared action state. Its prime use cases are SSR and tests. It isn't required with client-side rendering, but it can be used to separate action states of larger self-contained portions of an app.

## Providing custom initial pending&nbsp;state

```diff
+ let initialState = {
+   "fetch-items": { initialized: true, complete: true },
+ };

- <PendingStateProvider>
+ <PendingStateProvider value={initialState}>
    <App/>
  </PendingStateProvider>
```

⬥ While fully optional, this setup allows to redefine the initial state received from `usePendingState(stateKey)`.

⬥ With an explicit value or without, the `<PendingStateProvider>`'s nested components will only respond to updates in the particular action states they subscribed to by means of `usePendingState(stateKey)`.
