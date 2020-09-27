/**
 * Represents a reference to a given Bubble.
 *
 * Internally, this is represented as a 64 bit integer, hence the need for a BigInt.
 * You could use a string instead, but this representation should be more efficient
 */
export type BubbleID = bigint & { readonly __tag: unique symbol };

/**
 * Create a BubbleRef from a string
 *
 * @param str the string
 */
export function fromString(str: string): BubbleID {
  return BigInt(str) as BubbleID;
}

/**
 * Get the Date a reference was created at
 *
 * @param ref the reference to a bubble
 */
export function getDate(ref: BubbleID): Date {
  const r = ref as bigint;
  return new Date(Number((r >> BigInt(4)) / BigInt(1000)));
}