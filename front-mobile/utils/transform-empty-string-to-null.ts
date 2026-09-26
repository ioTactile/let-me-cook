export const transformEmptyStringsToNull = <T extends Record<string, any>>(data: T): Partial<T> => {
  const result: Partial<T> = { ...data };
  for (const key in result) {
    if (result[key] === '') {
      result[key] = null as any;
    }
  }
  return result;
};
