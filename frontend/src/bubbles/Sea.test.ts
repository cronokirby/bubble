import { Map } from "immutable";
import * as BubbleID from "../BubbleID";
import { Bubble } from "./bubble";
import ReactSeaCache from "./cache/ReactSeaCache";
import { NoRemoteSea } from "./RemoteSea";
import Sea from "./Sea";

const id1 = BubbleID.idFromString("0x1");
const bubble1 = { inner: "1", children: [] };
const id2 = BubbleID.idFromString("0x2");
const bubble2 = { inner: "2", children: [] };

function createSea(...pairs: [BubbleID.BubbleID, Bubble][]): () => Sea {
  // It's important to use an object here so that we can have a mutable reference
  // that we can actually modify.
  const container = { state: Map(pairs) };
  return () => {
    const cache = new ReactSeaCache(container.state, (f) => {
      container.state = f(container.state);
    });
    return new Sea(new NoRemoteSea(), cache);
  };
}

test("modify -> lookup should return the modification", async () => {
  const sea = createSea();
  await sea().modify(id1, bubble1);
  const bubble = await sea().lookup(id1);
  expect(bubble).toEqual(bubble1);
});

test("creating a sea with bubbles lets us look them up", async () => {
  const sea = createSea([id1, bubble1], [id2, bubble2]);
  expect(await sea().lookup(id1)).toEqual(bubble1);
  expect(await sea().lookup(id2)).toEqual(bubble2);
});

test("adding bubbles works as expected", async () => {
  const sea = createSea([id1, bubble1]);
  const newID = await sea().create(id1);
  expect((await sea().lookup(id1))?.children).toEqual([newID]);
});

test("linking works as expected", async () => {
  const sea = createSea([id1, bubble1], [id2, bubble2]);
  await sea().link(id1, id2);
  const expected = { ...bubble2, children: [id1] };
  expect(await sea().lookup(id2)).toEqual(expected);
});

test("unlinking works as expected", async () => {
  const sea = createSea([id1, bubble1], [id2, bubble2]);
  await sea().link(id1, id2);
  await sea().unlink(id1, id2);
  expect(await sea().lookup(id2)).toEqual(bubble2);
});

test.only("indenting works as expected", async () => {
  const id3 = BubbleID.idFromString("0x3");
  const bubble3 = { inner: "3", children: [id1, id2] };
  const sea = createSea([id1, bubble1], [id2, bubble2], [id3, bubble3]);
  await sea().indent(id2, id1, id3);
  expect(await sea().lookup(id1)).toEqual({ ...bubble1, children: [id2] });
  expect(await sea().lookup(id3)).toEqual({ ...bubble3, children: [id1] });
});

test.only("unindenting works as expected", async () => {
  const id4 = BubbleID.idFromString("0x4");
  const bubble4 = { inner: "4", children: [] };
  const id5 = BubbleID.idFromString("0x5");
  const bubble5 = { inner: "5", children: [id4] };
  const id6 = BubbleID.idFromString("0x6");
  const id7 = BubbleID.idFromString("0x7");
  const bubble7 = { inner: "7", children: [id5, id6] };
  const sea = createSea([id4, bubble4], [id5, bubble5], [id7, bubble7]);
  await sea().unindent(id4, id5, id7);
  expect(await sea().lookup(id7)).toEqual({
    ...bubble7,
    children: [id5, id4, id6],
  });
  expect(await sea().lookup(id5)).toEqual({ ...bubble5, children: [] });
});
