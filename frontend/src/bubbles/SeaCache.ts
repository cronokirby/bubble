import { BubbleID, createID } from "../BubbleID";
import { Map } from "immutable";
import { Bubble, BubbleInner, parse } from "./bubble";
import { RemoteSea } from "./RemoteSea";

/**
 * The result of looking some ID up.
 *
 * We have a potential Bubble, if it exists, and a new Sea updated after inserting
 * it into the Cache. The idea is that we want to be able to update the cache
 * as soon as we see some value for the first time.
 */
export interface LookupResult {
  bubble?: Bubble;
  newSea?: SeaCache;
}

/**
 * A class providing a cache stateful wrapper over a Remote Sea.
 *
 * The idea is that we store this class in a React state hook, or something like that,
 * so that we can manage the state we keep about the sea, and cached nodes. We want
 * to avoid interacting with this interface directly, because it's a bit cumbersome,
 * since it always return a new immutable copy if anything changed.
 * 
 * This provides a write-through cache, in the sense that modification will
 * immediately fill the cache, and then send the update back to the server.
 */
export class SeaCache {
  private constructor(
    private remote: RemoteSea,
    private map: Map<BubbleID, Bubble>
  ) {}

  /**
   * Construct a new SeaCache using a remote sea for fetching, and an initial state
   *
   * @param remote the remote sea for external lookups
   * @param pairs the initial bubbles we know about
   */
  static using(remote: RemoteSea, ...pairs: [BubbleID, Bubble][]): SeaCache {
    let map: Map<BubbleID, Bubble> = Map(pairs);
    return new SeaCache(remote, map);
  }

  /**
   * Lookup a given Bubble by its ID
   *
   * This is asynchronous because we might end up having to do some external lookup.
   *
   * @param id the identifier to lookup
   */
  async lookup(id: BubbleID): Promise<LookupResult> {
    let bubble = this.map.get(id);
    if (bubble) {
      return { bubble };
    }
    const str = await this.remote.lookup(id);
    const maybeBubble = str ? parse(str) : null;
    if (maybeBubble === null) {
      return {};
    }
    const newSea = new SeaCache(this.remote, this.map.set(id, maybeBubble));
    return { bubble: maybeBubble, newSea };
  }

  /**
   * Replace a bubble completely, creating it if it doesn't exist
   *
   * @param id the ID of the bubble to modify or create
   * @param bubble the new contents to provide
   */
  async modify(id: BubbleID, bubble: Bubble): Promise<SeaCache> {
    const newMap = this.map.set(id, bubble);
    return new SeaCache(this.remote, newMap);
  }
}
