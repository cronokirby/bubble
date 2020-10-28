import { BubbleID } from "BubbleID";
import { BubbleInner } from "./bubble";
import { SeaState } from "./SeaState";

/**
 * Represents a sea of nodes we can interact with.
 * 
 * This gives us an interface towards the state of the graph of nodes,
 * or bubbles, as we call them here. We can lookup different bubbles by
 * their ID. We can also modify, or create bubbles.
 * 
 * Various shortcut operations built on this primitives, such as
 * creating links between two nodes, and other things like that.
 */
export default class Sea {
  constructor(
    private state: SeaState,
    private setState: (s: SeaState) => void
  ) {}

  async lookup(id: BubbleID) {
    const res = await this.state.lookup(id);
    if (res.newSea) {
      this.setState(res.newSea);
    }
    return res.bubble;
  }

  async modifyInner(id: BubbleID, inner: BubbleInner) {
    const newSea = await this.state.modifyInner(id, inner);
    this.setState(newSea);
  }

  async unlink(id: BubbleID, from: BubbleID) {
    const newSea = await this.state.unlink(id, from);
    this.setState(newSea);
  }

  async link(id: BubbleID, to: BubbleID) {
    const newSea = await this.state.link(id, to);
    this.setState(newSea);
  }

  async create(parent: BubbleID) {
    const { newID, newSea } = await this.state.create(parent);
    this.setState(newSea);
    return newID;
  }
}
