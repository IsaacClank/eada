export function collect<T>(items: T[]) {
  return Collection.from(items);
}

export class Collection<T> {
  private _array: T[] = [];

  constructor(array: T[]) {
    this._array = array;
  }

  static from<T>(array: T[]) {
    return new Collection<T>(array);
  }

  toArray() {
    return this._array;
  }

  isEmpty() {
    return this._array.length < 1;
  }

  groupBy(keySelector: (item: T) => string | number) {
    const keyToGroup = new Map<string | number, T[]>();

    this._array.forEach((item) => {
      const key = keySelector(item);
      const group = keyToGroup.get(key);

      if (group) {
        keyToGroup.set(key, group.concat(item));
      } else {
        keyToGroup.set(key, [item]);
      }
    });

    return Collection.from(keyToGroup.values().toArray());
  }
}
