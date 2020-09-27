import { BubbleID, fromString as bubbleIDFromString } from "../BubbleID";

enum TokenType {
  OpenParens,
  CloseParens,
  Bubble,
  StringLitt,
  Identifier,
  BubbleID,
}

interface Token {
  type: TokenType;
  text?: string;
}

const STARTS_ID_REG = /^[_a-zA-z]+$/;
const CONTINUES_ID_REG = /^[_a-zA-z0-9]+$/;
const WHITESPACE_REG = /^\s+$/;

function startsIdentifier(c: string): boolean {
  return STARTS_ID_REG.test(c);
}

function continuesIdentifier(c: string): boolean {
  return CONTINUES_ID_REG.test(c);
}

class Lexer {
  private i = 0;

  constructor(private text: string) {}

  private curr(): string {
    return this.text[this.i];
  }

  private advance() {
    ++this.i;
  }

  private done(): boolean {
    return this.i >= this.text.length;
  }

  private bubbleID(): string {
    let text = "0x";
    if (this.curr() !== "x") {
      throw new Error("LEX: expected 'x' after 0");
    }
    this.advance();
    while (!this.done()) {
      const c = this.curr();
      if (!"0123456789ABCDEF".includes(c)) {
        break;
      }
      text += c;
      this.advance();
    }
    return text;
  }

  private stringLitt(): string {
    let text = "";
    let escaping = false;
    while (!this.done()) {
      const c = this.curr();
      this.advance();
      if (escaping) {
        if (c === '"') {
          // We want to preserve the escapedness of the string
          text += '\\"';
        } else {
          text += "\\";
          text += c;
        }
        if (c != "\\") {
          escaping = false;
        }
      } else {
        if (c === '"') {
          return text;
        }
        if (c === "\\") {
          escaping = true;
        } else {
          text += c;
        }
      }
    }
    throw new Error("LEX: unclosed string litteral");
  }

  private identifier(): string {
    let text = "";
    while (!this.done()) {
      const c = this.curr();
      if (!continuesIdentifier(c)) {
        break;
      }
      this.advance();
      text += c;
    }
    return text;
  }

  lex(): Token[] {
    const tokens: Token[] = [];
    while (!this.done()) {
      const c = this.curr();
      if (c === "(") {
        this.advance();
        tokens.push({ type: TokenType.OpenParens });
      } else if (c === ")") {
        this.advance();
        tokens.push({ type: TokenType.CloseParens });
      } else if (c === "0") {
        this.advance();
        const text = this.bubbleID();
        tokens.push({ type: TokenType.BubbleID, text });
      } else if (c === '"') {
        this.advance();
        const text = this.stringLitt();
        tokens.push({ type: TokenType.StringLitt, text });
      } else if (startsIdentifier(c)) {
        const text = this.identifier();
        if (text === "bubble") {
          tokens.push({ type: TokenType.Bubble });
        } else {
          tokens.push({ type: TokenType.Identifier, text });
        }
      } else if (WHITESPACE_REG.test(c)) {
        this.advance();
      }
    }
    return tokens;
  }
}

/**
 * Represents the inside of a Bubble.
 *
 * Right now the only supported type is just a piece of text.
 */
export type BubbleInner = string;

/**
 * Represents a Bubble / Block.
 *
 * A bubble has the inner text / element composing it, as well as a potential list of
 * children, which are simply references to other Bubbles, through their IDs.
 *
 * In text, this is represented as `(bubble "text" 0x12 0x1F)` where we have a
 * lisp-esque function call, with a string litteral as the first argument, and then all the following
 * arguments as references to other bubbles.
 */
export interface Bubble {
  inner: BubbleInner;
  children: BubbleID[];
}

class Parser {
  private i = 0;

  constructor(private tokens: Token[]) {}

  private curr(): Token {
    return this.tokens[this.i];
  }

  private prev(): Token {
    return this.tokens[this.i - 1];
  }

  private advance() {
    ++this.i;
  }

  private done(): boolean {
    return this.i >= this.tokens.length;
  }

  private check(typ: TokenType): boolean {
    if (this.done()) {
      return false;
    }
    return this.curr().type == typ;
  }

  private match(...types: TokenType[]): boolean {
    for (const t of types) {
      if (this.check(t)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private expect(typ: TokenType) {
    if (!this.check(typ)) {
      throw new Error(`PARSE: expected ${typ}`);
    }
    this.advance();
  }

  private bubbleInner(): BubbleInner {
    this.expect(TokenType.StringLitt);
    return this.prev().text!;
  }

  parse(): Bubble {
    this.expect(TokenType.OpenParens);
    this.expect(TokenType.Bubble);
    const inner = this.bubbleInner();
    const children: BubbleID[] = [];
    while (this.match(TokenType.BubbleID)) {
      children.push(bubbleIDFromString(this.prev().text!));
    }
    this.expect(TokenType.CloseParens);
    return { inner, children };
  }
}

/**
 * Parse a textual representation of a Bubble into a usable representation.
 *
 * For information on what this representation looks like, see the Bubble type.
 *
 * @param text the string to aprse
 * @return null if we failed to parse, otherwise a Bubble
 */
export function parse(text: string): Bubble | null {
  try {
    const lexer = new Lexer(text);
    const parser = new Parser(lexer.lex());
    return parser.parse();
  } catch {
    return null;
  }
}
