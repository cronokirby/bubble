import { BubbleID, createID, idFromString } from "../BubbleID";
import { Bubble, BubbleInner } from "./bubble";
import { SeaCache } from "./SeaCache";

/**
 * Represents a sea of nodes we can interact with.
 *
 * This gives us an interface towards the state of the graph of nodes,
 * or bubbles, as we call them here. We can lookup different bubbles by
 * their ID. We can also modify, or create bubbles.
 *
 * Various shortcut operations built on this primitives, such as
 * creating links between two nodes, and other things like that.
 *
 * The operations are all fundamentally asynchronous,
 * since they can potentially involve accessing the network
 * to the underlying sea.
 */
export default class Sea {
  constructor(
    private state: SeaCache,
    private setState: (s: SeaCache) => void
  ) {}

  /**
   * Look up a given bubble using its Identifier.
   *
   * @param id the identifier for this bubble
   * @returns undefined if said bubble does not exist
   */
  async lookup(id: BubbleID): Promise<Bubble | undefined> {
    const res = await this.state.lookup(id);
    if (res.newSea) {
      this.setState(res.newSea);
    }
    return res.bubble;
  }

  /**
   * Replace the entirety of a bubble.
   *
   * @param id the id of the bubble to replace
   * @param bubble the new state of that bubble
   */
  async modify(id: BubbleID, bubble: Bubble) {
    const newSea = await this.state.modify(id, bubble);
    this.setState(newSea);
  }

  /**
   * Replace the inner contents of a bubble.
   *
   * This does not affect the bubble's children.
   *
   * @param id the identifier of the bubble to modify
   * @param inner the inner contents to change
   */
  async modifyInner(id: BubbleID, inner: BubbleInner) {
    const bubble = await this.lookup(id);
    if (bubble) {
      await this.modify(id, { ...bubble, inner });
    } else {
      await this.modify(id, { inner, children: [] });
    }
  }

  /**
   * Unlink a given bubble from some parent.
   *
   * This removes the bubble from the children of that parent.
   *
   * @param id the identifier of the bubble we're unlinking
   * @param parent the bubble that should become the parent
   */
  async unlink(id: BubbleID, parent: BubbleID) {
    const bubble = await this.lookup(parent);
    if (!bubble) {
      return;
    }
    await this.modify(parent, {
      ...bubble,
      children: bubble.children.filter((x) => x !== id),
    });
  }

  /**
   * Link a given bubble to some parent
   *
   * This adds the bubble as the last child of the parent,
   * if it doesn't already exist.
   *
   * @param id the identifier of the bubble to link
   * @param parent
   */
  async link(id: BubbleID, parent: BubbleID) {
    const bubble = await this.lookup(parent);
    if (!bubble) {
      return;
    }
    await this.modify(parent, {
      ...bubble,
      children: [...bubble.children.filter((x) => x !== id), id],
    });
  }

  /**
   * Create a new bubble, attached to a given parent.
   *
   * @param parent the bubble this should be attached to, if desired
   */
  async create(parent?: BubbleID): Promise<BubbleID> {
    const newID = createID();
    // If you don't do things in this order, things are not correct
    await this.modifyInner(newID, "");
    if (parent) {
      await this.link(newID, parent);
    }
    return newID;
  }
}
