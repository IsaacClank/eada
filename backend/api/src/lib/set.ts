export function setFromArray<T>(values: T[]) {
  const set = new Set<T>();
  values.forEach(v => set.add(v));
  return set;
}

export function valuesFromSet<T>(set: Set<T>) {
  let values: T[] = [];
  for (let value of set.values()) {
    values = values.concat(value);
  }
  return values;
}
