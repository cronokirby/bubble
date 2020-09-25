import React from "react";
import Block from "./blocks/Block";
import { render } from "react-dom";

function Application() {
  return <Block />;
}

render(<Application />, document.getElementById("root"));
