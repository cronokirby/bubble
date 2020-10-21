import { BubbleID } from "BubbleID";
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
  newSea?: SeaState;
}

/**
 * A class providing a cache stateful wrapper over a Remote Sea.
 *
 * The idea is that we store this class in a React state hook, or something like that,
 * so that we can manage the state we keep about the sea, and cached nodes. We want
 * to avoid interacting with this interface directly, because it's a bit cumbersome,
 * since it always return a new immutable copy if anything changed.
 */
export class SeaState {
  private constructor(
    private remote: RemoteSea,
    private map: Map<BubbleID, Bubble>
  ) {}

  /**
   * Construct a new Sea using a remote sea for fetching, and an initial state
   *
   * @param remote the remote sea for external lookups
   * @param pairs the initial bubbles we know about
   */
  static using(remote: RemoteSea, ...pairs: [BubbleID, Bubble][]): SeaState {
    let map: Map<BubbleID, Bubble> = Map(pairs);
    return new SeaState(remote, map);
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
    const newSea = new SeaState(this.remote, this.map.set(id, maybeBubble));
    return { bubble: maybeBubble, newSea };
  }

  /**
   * Replace a bubble completely, creating it if it doesn't exist
   *
   * @param id the ID of the bubble to modify or create
   * @param bubble the new contents to provide
   */
  async modify(id: BubbleID, bubble: Bubble): Promise<SeaState> {
    const newMap = this.map.set(id, bubble);
    return new SeaState(this.remote, newMap);
  }

  /**
   * Modify the inner contents of a bubble.
   *
   * This will modify the contents, but not the children
   *
   * @param id the identifier of the bubble to modify
   * @param inner the new inner contents
   */
  async modifyInner(id: BubbleID, inner: BubbleInner): Promise<SeaState> {
    const res = await this.lookup(id);
    const newSea = res.newSea ?? this;
    if (res.bubble) {
      return newSea.modify(id, { ...res.bubble, inner });
    } else {
      return newSea.modify(id, { inner, children: [] });
    }
  }

  /**
   * Remove a given Bubble as a child of another
   *
   * @param id the ID being removed
   * @param from the ID of the bubble we want to remove it from
   */
  async unlink(id: BubbleID, from: BubbleID): Promise<SeaState> {
    let { bubble, newSea } = await this.lookup(from);
    newSea = newSea ?? this;
    if (!bubble) {
      return newSea;
    }
    return newSea.modify(from, {
      ...bubble,
      children: bubble.children.filter((x) => x !== id),
    });
  }

  /**
   * Add a Bubble as the last child of another
   *
   * This does nothing if the bubble is already a child of `to`
   *
   * @param id the ID of the Bubble to add
   * @param to the ID of the new parent Bubble
   */
  async link(id: BubbleID, to: BubbleID): Promise<SeaState> {
    let { bubble, newSea } = await this.lookup(to);
    newSea = newSea ?? this;
    if (!bubble) {
      return newSea;
    }
    return newSea.modify(to, {
      ...bubble,
      children: [...bubble.children.filter((x) => x !== id), id],
    });
  }
}
