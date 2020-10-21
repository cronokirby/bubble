import * as React from "react";
import { BubbleID } from "../BubbleID";
import { Bubble } from "./bubble";
import { useSea } from "./SeaProvider";
import ShowBubble from "./ShowBubble";

interface Props {
  id: BubbleID;
}

function Loading() {
  return <div>...</div>;
}

export default function BubbleNode({ id }: Props) {
  const sea = useSea();
  const [bubble, setBubble] = React.useState(null as Bubble | null);

  React.useEffect(() => {
    sea.lookup(id).then((b) => setBubble(b ?? null));
  }, [id]);

  if (bubble) {
    const children = bubble.children.map((id) => (
      <React.Fragment key={`${id}`}>
        <BubbleNode id={id} />
      </React.Fragment>
    ));
    return (
      <div>
        <ShowBubble
          starting={bubble.inner}
          onModify={(s) => sea.modifyInner(id, s)}
        />
        <div className="ml-4">{children}</div>
      </div>
    );
  } else {
    return <Loading />;
  }
}
