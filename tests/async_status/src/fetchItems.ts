function randomInt(min: number, max: number) {
  return min + Math.floor((max - min + 1) * Math.random());
}

function randomColor() {
  let rgb = [randomInt(0, 255), randomInt(0, 255), randomInt(0, 255)];

  return `rgba(${rgb.join()})`;
}

export type Item = {
  id: string;
  text: string;
  color: string;
};

function createItems(): Item[] {
  let items = [];

  for (let i = 0; i < 5; i++)
    items.push({
      id: `item-${i}`,
      text: `Item #${i + 1}`,
      color: randomColor(),
    });

  return items;
}

let failed = false;

export async function fetchItems(): Promise<Item[]> {
  // Emulating an async network request
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Uncomment the following line to make an error
      // occur once in a several page reloads:
      // failed = !failed && Math.random() < 0.3;

      if (failed) reject("Unavailable");
      else resolve(createItems());
    }, 1000);
  });
}
