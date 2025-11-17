import { ItemList } from "./ItemList.tsx";
import { Status } from "./Status.tsx";

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
