import React, { Context } from "react";
import { idFromString } from "../BubbleID";
import { NoRemoteSea } from "./RemoteSea";
import Sea from "./Sea";
import { SeaState } from "./SeaState";

const Context = React.createContext<Sea>(null as any);

export function useSea() {
  return React.useContext(Context);
}

const SeaProvider: React.FunctionComponent<{}> = (props) => {
  const [state, setState] = React.useState(
    SeaState.using(
      new NoRemoteSea(),
      [
        idFromString("0x0"),
        {
          inner: "Null Page",
          children: [idFromString("0x1")],
        },
      ],
      [
        idFromString("0x1"),
        { inner: "The first Child", children: [idFromString("0x2")] },
      ],
      [idFromString("0x2"), { inner: "The second Child", children: [] }]
    )
  );

  const value = new Sea(state, setState);

  return <Context.Provider value={value}>{props.children}</Context.Provider>;
};
export default SeaProvider;
