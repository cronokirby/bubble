import React from "react";
import BubbleNode from "./bubbles/BubbleNode";
import { render } from "react-dom";
import SeaProvider from "./bubbles/SeaProvider";
import { fromString } from "./BubbleID";

function Application() {
  return (
    <SeaProvider>
      <BubbleNode id={fromString("0x0")} />
    </SeaProvider>
  );
}

render(<Application />, document.getElementById("root"));
