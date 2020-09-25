import React from "react";
import ContentEditable from "react-contenteditable";

interface State {
  html: string;
}

export default class Block extends React.Component {
  private ref: React.RefObject<any>;
  public state: State = { html: "Edit Me!" };

  constructor(props: {}) {
    super(props);

    this.ref = React.createRef();
  }

  handleChange(event: any) {
    this.setState({ html: event.target.value });
  }

  render() {
    return (
      <ContentEditable
        innerRef={this.ref}
        html={this.state.html}
        disabled={false}
        onChange={this.handleChange.bind(this)}
      />
    );
  }
}
