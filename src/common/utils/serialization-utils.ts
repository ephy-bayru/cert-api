/**
 * Serializes the provided data into a JSON string while handling circular references
 * and excluding specified keys. In case of serialization errors, it returns a standardized error message.
 *
 * @param data The data to serialize.
 * @param excludeKeys An array of keys to exclude from serialization.
 * @returns A JSON string representation of the data.
 */
export function serialize<T>(data: T, excludeKeys: string[] = []): string {
  const cache = new Set();
  try {
    return JSON.stringify(data, (key, value) => {
      if (excludeKeys.includes(key)) {
        return undefined;
      }
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return '[Circular]';
        }
        cache.add(value);
      }
      return value;
    });
  } catch (error) {
    console.error('Serialization error:', error);
    return '{"error": "Failed to serialize data. See server logs for more details."}';
  } finally {
    cache.clear();
  }
}

/**
 * Deserializes the provided JSON string into an object of type T. If the string is not valid JSON,
 * it logs the error and returns null.
 *
 * @param jsonStr The JSON string to deserialize.
 * @returns An object of type T or null if the string cannot be deserialized.
 */
export function deserialize<T>(jsonStr: string): T | null {
  try {
    return JSON.parse(jsonStr, (key, value) => {
      const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
      if (typeof value === 'string' && datePattern.test(value)) {
        return new Date(value);
      }
      return value;
    }) as T;
  } catch (error) {
    console.error('Deserialization error:', error);
    return null;
  }
}
