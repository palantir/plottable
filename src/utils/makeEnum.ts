export function makeEnum<T extends string>(values: T[]): { [K in T]: K } {
  return values.reduce((obj, v) => {
    obj[v] = v;
    return obj;
  }, {} as any);
}
