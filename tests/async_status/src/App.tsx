import { ItemList } from "./ItemList";
import { Status } from "./Status";

export const App = () => {
  return (
    <>
      <p>Available items:</p>
      <ItemList />
      <hr />
      <p>
        Status: <Status />
      </p>
    </>
  );
};
