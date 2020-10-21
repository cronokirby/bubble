import { Sea } from "./Sea";
import { NoRemoteSea } from "./RemoteSea";
import * as BubbleID from "../BubbleID";

const id1 = BubbleID.fromString("0x1");
const bubble1 = { inner: "1", children: [] };
const id2 = BubbleID.fromString("0x2");
const bubble2 = { inner: "2", children: [] };

test("modify -> lookup should return the modification", async () => {
  let sea = Sea.using(new NoRemoteSea());
  sea = await sea.modify(id1, bubble1);
  const res = await sea.lookup(id1);
  expect(res.bubble).toEqual(bubble1);
});

test("creating a sea with bubbles lets us look them up", async () => {
  let sea = Sea.using(new NoRemoteSea(), [id1, bubble1], [id2, bubble2]);
  expect((await sea.lookup(id1)).bubble).toEqual(bubble1);
  expect((await sea.lookup(id2)).bubble).toEqual(bubble2);
});

test("linking works as expected", async () => {
  let sea = Sea.using(new NoRemoteSea(), [id1, bubble1], [id2, bubble2]);
  sea = await sea.link(id1, id2);
  const expected = { ...bubble2, children: [id1] };
  expect((await sea.lookup(id2)).bubble).toEqual(expected);
});

test("unlinking works as expected", async () => {
  let sea = Sea.using(new NoRemoteSea(), [id1, bubble1], [id2, bubble2]);
  sea = await sea.link(id1, id2);
  sea = await sea.unlink(id1, id2);
  expect((await sea.lookup(id2)).bubble).toEqual(bubble2);
});
