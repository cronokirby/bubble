import { BubbleID } from "BubbleID";
import { Bubble } from "../bubble";
import SeaCache from "./SeaCache";
import { Map } from "immutable";

export type BubbleMap = Map<BubbleID, Bubble>;

/**
 * Implements a cache given a `[state, setState]` pair from React.
 *
 * These should provide us with an immutable map from Bubble IDs to Bubbles,
 * and we use that to implement a cache
 */
export default class ReactSeaCache implements SeaCache {
  constructor(
    private state: BubbleMap,
    private setState: (f: (map: BubbleMap) => BubbleMap) => void
  ) {}

  modify(id: BubbleID, bubble: Bubble) {
    this.setState((map) => map.set(id, bubble));
  }

  lookup(id: BubbleID) {
    return this.state.get(id) ?? null;
  }
}
