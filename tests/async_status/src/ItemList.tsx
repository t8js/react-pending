import { type CSSProperties, useCallback, useEffect, useState } from "react";
import { usePendingState } from "../../..";
import { fetchItems, type Item } from "./fetchItems";

export const ItemList = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [state, withState] = usePendingState("fetch-items");

  const loadItems = useCallback(() => {
    withState(fetchItems()).then(setItems);
  }, [withState]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  if (!state.complete) return <p>Loading...</p>;

  if (state.error)
    return (
      <div className="error">
        <p>Failed to load items</p>
        <p>
          <button onClick={loadItems}>Reload items</button>
        </p>
      </div>
    );

  return (
    <ul>
      {items.map(({ id, text, color }) => (
        <li key={id} style={{ "--color": color } as CSSProperties}>
          <span className="badge" />
          {text}
        </li>
      ))}
    </ul>
  );
};
