import * as React from "react";
import { BubbleID } from "../BubbleID";
import { Bubble } from "./bubble";
import { useSea } from "./SeaProvider";
import ShowBubble from "./ShowBubble";

interface Props {
  id: BubbleID;
  parent?: BubbleID;
  title?: boolean;
}

function Loading() {
  return <div>...</div>;
}

type BubbleState =
  | { loading: true }
  | { loading: false; bubble: Bubble | null };

export default function BubbleNode({ id, title, parent }: Props) {
  const sea = useSea();
  const [state, setState] = React.useState<BubbleState>({ loading: true });

  const onEnter = () => {
    if (parent) {
      sea.create(parent);
      return true;
    } else {
      return false;
    }
  };

  React.useEffect(() => {
    sea.lookup(id).then((b) => setState({ loading: false, bubble: b }));
  }, [id, sea]);

  if (state.loading) {
    return <Loading />;
  } else if (state.bubble) {
    const bubble = state.bubble;
    const children = bubble.children.map((theirID) => (
      <React.Fragment key={`${theirID}`}>
        <BubbleNode id={theirID} parent={id} />
      </React.Fragment>
    ));
    return (
      <div>
        <div className={title ? "text-3xl font-bold mb-6" : ""}>
          <ShowBubble
            starting={bubble.inner}
            onModify={(s) => sea.modifyInner(id, s)}
            onEnter={onEnter}
          />
        </div>
        <div className={title ? "" : "ml-4"}>{children}</div>
      </div>
    );
  } else {
    return <></>;
  }
}
