import { parse } from "./bubble";

test("parsing simple bubbles", () => {
  expect(parse('(bubble "ABC")')).toEqual({ inner: "ABC", children: [] });
});

test.only("parsing escaped strings", () => {
  expect(parse('(bubble "\\"H")')).toEqual({ inner: '\\"H', children: [] });
});

test("parsing children works", () => {
  expect(parse('(bubble "x" 0x12 0x1F)')).toEqual({
    inner: "x",
    children: [BigInt(0x12), BigInt(0x1f)],
  });
});
