/**
 * Utility to mask sensitive information in data objects.
 */

// Define keys considered sensitive and should be masked.
const sensitiveKeys = new Set([
  'password',
  'creditCard',
  'ssn',
  'phoneNumber',
  'email',
  'token',
  'apiKey',
]);

/**
 * Masks a value if deemed sensitive, leaving other values untouched.
 * This function supports both string and numeric types.
 *
 * @param value The value to potentially mask.
 * @returns The masked value or the original value.
 */
function maskValue(value: any): string {
  if (typeof value === 'string') {
    return value.replace(/./g, '*'); // Mask entire string
  } else if (typeof value === 'number') {
    return value.toString().replace(/./g, '*'); // Mask numeric values as well
  }
  return value; // If it's not a string or number, return it as-is
}

/**
 * Recursively masks sensitive information within an object.
 * This function handles arrays, objects, and primitive types.
 *
 * @param data The data object that might contain sensitive information.
 * @param keySet A set of keys for which values should be masked.
 * @returns A new object with sensitive information masked.
 */
function maskSensitiveData(
  data: any,
  keySet: Set<string> = sensitiveKeys,
): any {
  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item, keySet));
  } else if (typeof data === 'object' && data !== null) {
    return Object.entries(data).reduce((acc, [key, value]) => {
      // Mask the value if the key is sensitive, or recurse into the object/array.
      acc[key] =
        keySet.has(key) && typeof value === 'string'
          ? maskValue(value)
          : maskSensitiveData(value, keySet);
      return acc;
    }, {} as any);
  }
  return data; // Return the primitive value directly
}

/**
 * Adds additional sensitive keys to be masked during the masking process.
 *
 * @param keys An array of key names to be added to the sensitive key set.
 */
function addSensitiveKeys(keys: string[]): void {
  keys.forEach((key) => sensitiveKeys.add(key));
}

/**
 * Removes specified sensitive keys from the key set.
 *
 * @param keys An array of key names to be removed from the sensitive key set.
 */
function removeSensitiveKeys(keys: string[]): void {
  keys.forEach((key) => sensitiveKeys.delete(key));
}

export { maskSensitiveData, addSensitiveKeys, removeSensitiveKeys };
