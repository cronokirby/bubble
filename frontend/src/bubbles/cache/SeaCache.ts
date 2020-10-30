import { BubbleID } from "../../BubbleID";
import { Bubble } from "../bubble";

/**
 * Represents an interface we have towards a cache of bubbles.
 *
 * We can lookup bubbles in the cache, which might fail to be there,
 * as well as modify things in the cache.
 */
export default interface SeaCache {
  /**
   * Try and find the bubble associated with a given identifier
   *
   * @param id the bubble to try and look up
   */
  lookup(id: BubbleID): Bubble | null;
  /**
   * Replace a given bubble with new contents
   *
   * @param id the bubble to replace
   * @param bubble the contents to replace the bubble with
   */
  modify(id: BubbleID, bubble: Bubble): void;
}
