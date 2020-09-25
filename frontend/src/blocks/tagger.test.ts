import { Tag, parse } from "./tagger";

test("parsing plain sentences", () => {
  expect(parse("hello world!")).toEqual([
    { tag: Tag.Plain, text: "hello world!" },
  ]);
  expect(parse("ABC")).toEqual([{ tag: Tag.Plain, text: "ABC" }]);
});

test("parsing italics", () => {
  expect(parse("* *")).toEqual([{ tag: Tag.Italic, text: " " }]);
  expect(parse("*b*")).toEqual([{ tag: Tag.Italic, text: "b" }]);
});

test("parsing bold", () => {
  expect(parse("**BB**")).toEqual([{ tag: Tag.Bold, text: "BB" }]);
});

test("parsing math", () => {
  expect(parse("$x + 2$")).toEqual([{ tag: Tag.Math, text: "x + 2" }]);
  expect(parse("$x* **$")).toEqual([{ tag: Tag.Math, text: "x* **" }]);
});

test("parsing mixed", () => {
  expect(parse("An *italic* and **bold**")).toEqual([
    { tag: Tag.Plain, text: "An " },
    { tag: Tag.Italic, text: "italic" },
    { tag: Tag.Plain, text: " and " },
    { tag: Tag.Bold, text: "bold" },
  ]);
});
