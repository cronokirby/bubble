import { BubbleID } from "../BubbleID";
import React, { Context } from "react";
import { Bubble, BubbleInner } from "./bubble";
import { SeaState } from "./SeaState";
import { NoRemoteSea } from "./RemoteSea";

/**
 * Represents an interface we have into the Sea of nodes, the raw
 * graph we can interact with.
 */
interface Sea {
  /**
   * Look up the value of a certain Bubble.
   *
   * @param id the id of the bubble to lookup
   * @return undefined if said bubble doesn't exist
   */
  lookup(id: BubbleID): Promise<Bubble | undefined>;
  /**
   * Modify the inside of a bubble.
   *
   * This won't change the links of the bubble, only the contents
   * of the bubble itself.
   *
   * @param id
   * @param inner the new inner contents for that bubble
   */
  modifyInner(id: BubbleID, inner: BubbleInner): Promise<void>;
  /**
   * Unlink a given bubble as the child of another
   *
   * @param id the bubble to detach
   * @param from the parent bubble
   */
  unlink(id: BubbleID, from: BubbleID): Promise<void>;
  /**
   * Link a bubble as a direct descendant of another bubble
   *
   * @param id the bubble to link
   * @param to the node becoming the parent
   */
  link(id: BubbleID, to: BubbleID): Promise<void>;
}

const Context = React.createContext<Sea>(null as any);

export function useSea() {
  return React.useContext(Context);
}

const SeaProvider: React.FunctionComponent<{}> = (props) => {
  const [seaState, setSeaState] = React.useState(
    SeaState.using(new NoRemoteSea())
  );

  const value: Sea = {
    lookup: async (id: BubbleID) => {
      const res = await seaState.lookup(id);
      if (res.newSea) {
        setSeaState(res.newSea);
      }
      return res.bubble;
    },
    modifyInner: async (id: BubbleID, inner: BubbleInner) => {
      const newSea = await seaState.modifyInner(id, inner);
      setSeaState(newSea);
    },
    unlink: async (id: BubbleID, from: BubbleID) => {
      const newSea = await seaState.unlink(id, from);
      setSeaState(newSea);
    },
    link: async (id: BubbleID, to: BubbleID) => {
      const newSea = await seaState.link(id, to);
      setSeaState(newSea);
    },
  };

  return <Context.Provider value={value}>{props.children}</Context.Provider>;
};
export default SeaProvider;
