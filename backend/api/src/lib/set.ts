export function valuesFromSet<T>(set: Set<T>) {
  let values: T[] = [];
  for (let value of set.values()) {
    values = values.concat(value);
  }
  return values;
}
