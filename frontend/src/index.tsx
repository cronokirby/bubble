import React from "react";
import BubbleNode from "./bubbles/BubbleNode";
import { render } from "react-dom";
import SeaProvider from "./bubbles/SeaProvider";
import { idFromString } from "./BubbleID";

function Application() {
  return (
    <SeaProvider>
      <div className="mt-4 md:mt-6 md:container mx-auto lg:w-1/2">
        <BubbleNode id={idFromString("0x0")} title/>
      </div>
    </SeaProvider>
  );
}

render(<Application />, document.getElementById("root"));
