export function ifNaNThen(value: number, fallback: number) {
  return isNaN(value) ? fallback : value;
}
