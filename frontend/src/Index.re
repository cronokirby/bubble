module App = {
  [@react.component]
  let make = () => {
    <div> <p> {React.string("Hello Reason!")} </p> </div>;
  };
};

ReactDOMRe.renderToElementWithId(<App />, "root");
