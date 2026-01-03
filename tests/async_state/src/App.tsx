import { ItemList } from "./ItemList.tsx";
import { Status } from "./Status.tsx";

export let App = () => (
  <>
    <p>
      Status: <Status />
    </p>
    <hr />
    <p>Available items:</p>
    <ItemList />
  </>
);
