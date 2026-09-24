export default function toCamelCase(row) {
  if (row == null) return null;

  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key.replace(/_([a-z])/g, (_, char) => char.toUpperCase()),
      value,
    ])
  );
}
