import { SeaState } from "./SeaState";
import { NoRemoteSea } from "./RemoteSea";
import * as BubbleID from "../BubbleID";
import Sea from "./Sea";
import { Bubble } from "./bubble";

const id1 = BubbleID.idFromString("0x1");
const bubble1 = { inner: "1", children: [] };
const id2 = BubbleID.idFromString("0x2");
const bubble2 = { inner: "2", children: [] };

function createSea(...pairs: [BubbleID.BubbleID, Bubble][]): () => Sea {
  // It's important to use an object here so that we can have a mutable reference
  // that we can actually modify.
  const container = { state: SeaState.using(new NoRemoteSea(), ...pairs) };
  const setState = (s: SeaState) => {
    container.state = s;
  };
  return () => new Sea(container.state, setState);
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
