import { Map } from "immutable";
import React, { Context } from "react";
import { BubbleID, idFromString } from "../BubbleID";
import { Bubble } from "./bubble";
import ReactSeaCache, { BubbleMap } from "./cache/ReactSeaCache";
import { NoRemoteSea } from "./RemoteSea";
import Sea from "./Sea";

const Context = React.createContext<Sea>(null as any);

export function useSea() {
  return React.useContext(Context);
}

function createMap(...pairs: [BubbleID, Bubble][]): BubbleMap {
  return Map(pairs);
}

const SeaProvider: React.FunctionComponent<{}> = (props) => {
  const [state, setState] = React.useState<BubbleMap>(
    createMap(
      [
        idFromString("0x0"),
        { inner: "Null Page", children: [idFromString("0x1")] },
      ],
      [
        idFromString("0x1"),
        { inner: "Node 1", children: [idFromString("0x2")] },
      ],
      [idFromString("0x2"), { inner: "Node 2", children: [] }]
    )
  );

  const cache = new ReactSeaCache(state, setState);
  const value = new Sea(new NoRemoteSea(), cache);

  return <Context.Provider value={value}>{props.children}</Context.Provider>;
};
export default SeaProvider;
