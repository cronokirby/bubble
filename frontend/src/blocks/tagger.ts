// IMPROVE: Maybe we can generate this type by looking at the available keys
// inside of the Token type?
/**
 * The type of token that exists.
 */
type TokenType = "*" | "**" | "span";

/**
 * An isolated span token as a separate type.
 *
 * This is useful to have as a separate type so that we can cast to this variant.
 * Casting to this variant is desired to be able to extract out the span data.
 */
type TokenSpan = { type: "span"; span: string };

/**
 * Represents a kind of token produced by our lexer.
 *
 * The idea is that a token is either `*` or `**` delimiting the start or end of
 * span of italic or bold text in markdown, or a piece of normal text.
 */
type Token = { type: "*" } | { type: "**" } | TokenSpan;

/**
 * The class of special characters is all of those that can't appear in markdown
 */
function isSpecial(c: string) {
  return "*".includes(c);
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
   * Lex out a string consisting of normal characters in markdown
   */
  private span(): string {
    let res = "";
    while (!this.done()) {
      let curr = this.curr();
      if (isSpecial(curr)) {
        break;
      }
      res += curr;
      this.advance();
    }
    return res;
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
            tokens.push({ type: "**" });
          } else {
            tokens.push({ type: "*" });
          }
          break;
        }
        default: {
          const span = this.span();
          tokens.push({ type: "span", span });
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
    return this.tokens[this.i];
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

  /**
   * Check whether or not the current token matches a certain type
   *
   * @param t the type of token to look for
   * @return true if the current token matches this type
   */
  private check(t: TokenType): boolean {
    if (this.done()) {
      return false;
    }
    return this.curr().type == t;
  }

  /**
   * Try and match one of a type of token, and advance the parser if so
   *
   * @param ts the different tokens we want to match with
   * @return true if one of the options matched
   */
  private match(...ts: TokenType[]) {
    for (let t of ts) {
      if (this.check(t)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  /**
   * Expect to see a given token type, or throw an exception
   *
   * @param t the type of token to match
   * @throws an Error if we didn't see that type of token
   */
  private expect(t: TokenType) {
    if (!this.match(t)) {
      throw new Error(`Expected: ${t}`);
    }
  }

  /**
   * Try and parse a plain span of text
   */
  private span(): string {
    this.expect("span");
    const t = this.prev() as TokenSpan;
    return t.span;
  }

  /**
   * Parse out a single tagged piece of text
   */
  private expr(): Tagged {
    if (this.match("*")) {
      const text = this.span();
      this.expect("*");
      return { tag: Tag.Italic, text };
    } else if (this.match("**")) {
      const text = this.span();
      this.expect("**");
      return { tag: Tag.Bold, text };
    } else if (this.match("span")) {
      const t = this.prev() as TokenSpan;
      return { tag: Tag.Plain, text: t.span };
    }
    throw new Error("Failed to find any matches");
  }

  parse() {
    const tagged: Tagged[] = [];
    while (!this.done()) {
      tagged.push(this.expr());
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
export function parse(text: string): Tagged[] {
  const lexer = new Lexer(text);
  const tokens = lexer.lex();
  const parser = new Parser(tokens);
  try {
    return parser.parse();
  } catch (e) {
    console.warn(e);
    return [{ tag: Tag.Plain, text }];
  }
}
