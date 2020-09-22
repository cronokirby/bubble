module App = {
  [@react.component]
  let make = () => {
    <div> <p className="bg-red-300"> {React.string("Hello Reason!")} </p> </div>;
  };
};

ReactDOMRe.renderToElementWithId(<App />, "root");
