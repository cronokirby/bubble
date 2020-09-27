import type { BubbleID } from "../BubbleID";

/**
 * Represents some service capable of working with Bubbles remotely.
 *
 * The idea is that this is an abstraction over working with the local server
 * with direct access to whatever Bubbles we've stored on disk.
 */
export interface RemoteSea {
  /**
   * Lookup the contents of a given BubbleID.
   *
   * The reason we return a string is so that we can isolate the parsing logic
   * to some other layer.
   *
   * @param id the ID of the bubble to lookup
   * @return the string contents of that Bubble, or null if nothing was found
   */
  lookup(id: BubbleID): Promise<string | null>;
}