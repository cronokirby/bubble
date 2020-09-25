type Token = string;

/**
 * The class of special characters is all of those that can't appear in markdown
 */
function isSpecial(c: string) {
  return "***$\n".includes(c);
}

/**
 * A Lexer class that produces tokens from a string source.
 */
class Lexer {
  private i = 0;

  constructor(private text: string) {}

  /**
   * Get the current character in the lexing process
   *
   * @returns a character (in the form of a string, because JavaScript)
   */
  private curr(): string {
    return this.text[this.i];
  }

  /**
   * Advance our place in the string to the next character.
   */
  private advance() {
    ++this.i;
  }

  /**
   * Check whether or not we're out of characters to lex
   *
   * @return true if we've reached the end of the input
   */
  private done(): boolean {
    return this.i >= this.text.length;
  }

  /**
   * Run the lexer, genera
   */
  lex(): Token[] {
    const tokens: Token[] = [];

    while (!this.done()) {
      switch (this.curr()) {
        case "*": {
          this.advance();
          if (this.curr() == "*") {
            this.advance();
            tokens.push("**");
          } else {
            tokens.push("*");
          }
          break;
        }
        case "$": {
          this.advance();
          tokens.push("$");
          break;
        }
        case "\n": {
          this.advance();
          tokens.push("\n");
          break;
        }
        default: {
          tokens.push(this.curr());
          this.advance();
          break;
        }
      }
    }

    return tokens;
  }
}

/**
 * Represents the kind of Tag we can annotate a span of text with in markdown.
 *
 * This is used to say that a certain span of text is bold, italic, or something
 * like that.
 */
export enum Tag {
  /**
   * Marks a certain span of text as bold text
   */
  Bold,
  /**
   * Marks a certain span of text as italic text
   */
  Italic,
  /**
   * Marks a certain span of text as being math.
   */
  Math,
  /**
   * Marks an empty span of text as being a line break
   */
  LineBreak,
  /**
   * Marks a certain span of text as having no formatting at all
   */
  Plain,
}

/**
 * A piece of text accompanied with a given tag
 */
export interface Tagged {
  tag: Tag;
  text: string;
}

/**
 * A Parser allows us to take a stream of tokens produced by our lexer, and end up
 * with a series of Tagged pieces of text.
 */
class Parser {
  private i = 0;

  constructor(private tokens: Token[]) {}

  /**
   * Get the current token based on our position
   *
   * @return the current token
   */
  private curr(): Token {
    const c = this.tokens[this.i];
    return c;
  }

  /**
   * Get the previous token, based on our position
   *
   * This is useful to be able to recover whatever token we've just expected,
   * or matched on. The reason we care about getting that token is that
   * we only match based on the type, and we might want to use the contents,
   * for extracting the text out of a span Token, for example.
   *
   * @return the previous token we've seen
   */
  private prev(): Token {
    return this.tokens[this.i - 1];
  }

  /**
   * Advance our position inside of the stream of tokens
   */
  private advance() {
    if (!this.done()) {
      ++this.i;
    }
    return this.prev();
  }

  /**
   * Check whether or not we're done with the tokens
   */
  private done() {
    return this.i >= this.tokens.length;
  }

  private plain() {
    let res = "";
    while (!this.done()) {
      if (isSpecial(this.curr())) {
        break;
      }
      res += this.curr();
      this.advance();
    }
    return res;
  }

  private until(token: Token, tag: Tag): Tagged {
    let text = "";
    while (!this.done()) {
      if (this.curr() === token) {
        this.advance();
        return { tag, text };
      }
      text += this.curr();
      this.advance();
    }
    return { tag: Tag.Plain, text: token + text };
  }

  parse() {
    const tagged: Tagged[] = [];
    while (!this.done()) {
      switch (this.curr()) {
        case "*": {
          this.advance();
          tagged.push(this.until("*", Tag.Italic));
          break;
        }
        case "**": {
          this.advance();
          tagged.push(this.until("**", Tag.Bold));
          break;
        }
        case "$": {
          this.advance();
          tagged.push(this.until("$", Tag.Math));
          break;
        }
        case "\n": {
          this.advance();
          tagged.push({ tag: Tag.LineBreak, text: "" });
          break;
        }
        default: {
          const text = this.plain();
          tagged.push({ tag: Tag.Plain, text });
          break;
        }
      }
    }
    return tagged;
  }
}

/**
 * Try and parse some text into a piece of tagged / annotated parts.
 *
 * This used rudimentary markdown syntax (although perhaps a bit strictly).
 *
 * `*italic*` becomes italic
 *
 * `**bold**` becomes bold
 *
 * Different styles cannot be nested.
 *
 * If the text fails to parse cleanly, we return the entire text without annotation.
 *
 * @param text the text we want to parse
 * @return an array of tagged pieces of text
 */
export function parse(text: string) {
  const lexer = new Lexer(text);
  const tokens = lexer.lex();
  const parser = new Parser(tokens);
  return parser.parse();
}
