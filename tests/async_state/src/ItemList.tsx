import { type CSSProperties, useCallback, useEffect, useState } from "react";
import { usePendingState } from "../../../index.ts";
import { fetchItems, type Item } from "./fetchItems.ts";

export const ItemList = () => {
  const [items, setItems] = useState<Item[]>([]);
  const { complete, error, track } = usePendingState("fetch-items");

  const loadItems = useCallback(() => {
    track(fetchItems()).then(setItems);
  }, [track]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  if (!complete) return <p>Loading...</p>;

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
