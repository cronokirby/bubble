import { BubbleID, createID } from "../BubbleID";
import { Bubble, BubbleInner } from "./bubble";
import SeaCache from "./cache/SeaCache";
import { RemoteSea } from "./RemoteSea";

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
  constructor(private remote: RemoteSea, private cache: SeaCache) {}

  /**
   * Look up a given bubble using its Identifier.
   *
   * @param id the identifier for this bubble
   * @returns undefined if said bubble does not exist
   */
  async lookup(id: BubbleID): Promise<Bubble | null> {
    const cached = this.cache.lookup(id);
    if (cached) {
      return cached;
    }
    const real = await this.remote.lookup(id);
    if (real) {
      this.cache.modify(id, real);
    }
    return real ?? null;
  }

  /**
   * Replace the entirety of a bubble.
   *
   * @param id the id of the bubble to replace
   * @param bubble the new state of that bubble
   */
  async modify(id: BubbleID, bubble: Bubble) {
    this.cache.modify(id, bubble);
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
    // We can kick this off in parallel
    const modifyPromise = this.modifyInner(newID, "");
    if (parent) {
      await this.link(newID, parent);
    }
    await modifyPromise;
    return newID;
  }

  /**
   * Indent a bubble, so that it becomes a child of the one directly above it, i.e. the senpai
   *
   * @param id the bubble to move
   * @param senpai the child bubble directly above this one
   * @param parent the bubble containing both the moving one, and the senpai
   */
  async indent(id: BubbleID, senpai: BubbleID, parent: BubbleID) {
    await Promise.all([this.unlink(id, parent), this.link(id, senpai)]);
  }
}
