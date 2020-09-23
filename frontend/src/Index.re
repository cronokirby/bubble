module App = {
  [@react.component]
  let make = () => {
    <div className="font-sans">
      <p className="bg-red-300"> {React.string("Hello Reason!")} </p>
    </div>;
  };
};

ReactDOMRe.renderToElementWithId(<App />, "root");
