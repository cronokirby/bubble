import React from "react";
import Bubble from "./bubbles/ShowBubble";
import { render } from "react-dom";

function Application() {
  return <Bubble />;
}

render(<Application />, document.getElementById("root"));
