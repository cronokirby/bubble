type TokenType = "*" | "**" | "span";

type TokenSpan = { type: "span"; span: string };
/**
 * Represents a kind of token produced by our lexer.
 *
 * The idea is that a token is either `*` or `**` delimiting the start or end of
 * span of italic or bold text in markdown, or a piece of normal text.
 */
type Token = { type: "*" } | { type: "**" } | TokenSpan;

function isSpecial(c: string) {
  return "*".includes(c);
}

class Lexer {
  private i = 0;

  constructor(private text: string) {}

  private curr() {
    return this.text[this.i];
  }

  private advance() {
    ++this.i;
  }

  private done() {
    return this.i >= this.text.length;
  }

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

  lex() {
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

export enum Tag {
  Bold,
  Italic,
  Plain,
}

export interface Tagged {
  tag: Tag;
  text: string;
}

class Parser {
  private i = 0;

  constructor(private tokens: Token[]) {}

  private curr() {
    return this.tokens[this.i];
  }

  private prev() {
    return this.tokens[this.i - 1];
  }

  private advance() {
    if (!this.done()) {
      ++this.i;
    }
    return this.prev();
  }

  private done() {
    return this.i >= this.tokens.length;
  }

  private check(t: TokenType): boolean {
    if (this.done()) {
      return false;
    }
    return this.curr().type == t;
  }

  private match(...ts: TokenType[]) {
    for (let t of ts) {
      if (this.check(t)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private expect(t: TokenType) {
    if (!this.match(t)) {
      throw new Error(`Expected: ${t}`);
    }
  }

  private span(): string {
    this.expect("span");
    const t = this.prev() as TokenSpan;
    return t.span;
  }

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

export function parse(text: string) {
  const lexer = new Lexer(text);
  const tokens = lexer.lex();
  const parser = new Parser(tokens);
  return parser.parse();
}
