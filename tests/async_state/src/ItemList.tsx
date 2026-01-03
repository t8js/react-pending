import { type CSSProperties, useCallback, useEffect, useState } from "react";
import { usePendingState } from "../../../index.ts";
import { fetchItems, type Item } from "./fetchItems.ts";

export let ItemList = () => {
  let [items, setItems] = useState<Item[]>([]);
  let { initial, pending, error, track } = usePendingState("fetch-items");

  let loadItems = useCallback(() => {
    track(fetchItems()).then(setItems);
  }, [track]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  if (initial || pending) return <p>Loading...</p>;

  if (error)
    return (
      <div className="error">
        <p>Failed to load items</p>
        <p>
          <button onClick={loadItems}>Reload items</button>
        </p>
      </div>
    );

  return (
    <>
      <p>
        <button onClick={loadItems}>Reload items</button>
      </p>
      <ul>
        {items.map(({ id, text, color }) => (
          <li key={id} style={{ "--color": color } as CSSProperties}>
            <span className="badge" />
            {text}
          </li>
        ))}
      </ul>
    </>
  );
};
