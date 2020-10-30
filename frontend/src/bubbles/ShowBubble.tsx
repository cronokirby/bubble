import React from "react";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import katex from "katex";
import { Tagged, Tag, parse } from "./tagger";

function unescapeHTML(text: string): string {
  return text.replaceAll("&amp;", "&").replaceAll("<br>", "\n");
}

/**
 * Format tagged segments of text into HTML
 *
 * @param tagged the tagged segments
 * @return a piece of HTML displaying the formatted text
 */
function format(tagged: Tagged[]): string {
  return tagged
    .map((x) => {
      switch (x.tag) {
        case Tag.Bold:
          return `<b>${x.text}</b>`;
        case Tag.Italic:
          return `<i>${x.text}</i>`;
        case Tag.Math:
          return katex.renderToString(unescapeHTML(x.text));
        case Tag.Code:
          return `<code class="inline-code" spellcheck="false">${x.text}</code>`;
        case Tag.Plain:
          return x.text;
      }
    })
    .join("");
}

/**
 * Transform a piece of markdown text into HTML
 *
 * @param text a piece of markdown text to transform
 * @return formatted HTML based on markdown
 */
function transform(text: string): string {
  return format(parse(text));
}

/**
 * Represents the current State of the Bubble component.
 *
 * The idea is that the Bubble is either being edited, in which case we want to display
 * the raw text, or is not being edited, in which case we want to display the
 * formatted HTML instead. The Bubble thus needs to keep track of its raw text,
 * its formatted HTML, and which state it's in.
 */
interface State {
  /**
   * The raw string composing this bubble, without any formatting.
   */
  raw: string;
  /**
   * The raw string transformed into HTML.
   *
   * For efficiency reasons, this isn't always kept in sync with the raw text.
   * Instead, we only recalculate this when we need to start displaying it again,
   * because the block has lost focus.
   */
  transformed: string;
  /**
   * True if the bubble is not currently being edited.
   */
  static: boolean;
}

interface Props {
  starting: string;
  onModify(str: string): void;
  onEnter(): boolean;
  onIndent(): boolean;
  onUnIndent(): boolean;
}

/**
 * Represents an editable Bubble of text.
 *
 * Bubbles allow formatting in a Markdown-esque syntax, and will display the
 * formatted version of the text when focus is lost. When focus is re-gained,
 * the raw representation will be displayed instead.
 */
export default class ShowBubble extends React.Component<Props> {
  private ref: React.RefObject<HTMLElement>;
  public state: State;

  constructor(props: Props) {
    super(props);

    this.ref = React.createRef();

    const raw = props.starting;
    this.state = { raw, transformed: transform(raw), static: true };
  }

  // We want to update the raw text here. It's fine if the transformed text is
  // out of sync since the user is editing currently, and we'll be able to
  // calculate the formatting once they're done.
  private handleChange(event: ContentEditableEvent) {
    this.setState({ ...this.state, raw: event.target.value });
  }

  componentDidMount() {
    this.ref.current?.focus();
  }

  // The user has given focus to something else, so we can transform
  // the text they've edited, and declare this Bubble to now be static.
  private onBlur() {
    this.setState({
      ...this.state,
      static: true,
      transformed: transform(this.state.raw),
    });
    this.props.onModify(this.state.raw);
  }

  // The user wants to start editing, so this Bubble should no longer be static
  private onFocus() {
    this.setState({ ...this.state, static: false });
  }

  private onKeyDown(event: React.KeyboardEvent) {
    // Enter press
    if (event.key === "Enter" && !event.shiftKey) {
      if (this.props.onEnter()) {
        event.preventDefault();
      }
    } else if (event.key === "Tab") {
      event.preventDefault();
      if (event.shiftKey) {
        this.onBlur();
        this.props.onUnIndent();
      } else {
        this.onBlur();
        this.props.onIndent();
      }
    }
  }

  render() {
    const html = this.state.static ? this.state.transformed : this.state.raw;
    return (
      <ContentEditable
        innerRef={this.ref}
        html={html}
        disabled={false}
        onChange={this.handleChange.bind(this)}
        onKeyDown={this.onKeyDown.bind(this)}
        onBlur={this.onBlur.bind(this)}
        onFocus={this.onFocus.bind(this)}
        style={{ display: "block" }}
        tagName="span"
      />
    );
  }
}
