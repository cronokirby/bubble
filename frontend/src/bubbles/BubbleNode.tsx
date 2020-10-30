import * as React from "react";
import { BubbleID } from "../BubbleID";
import { Bubble } from "./bubble";
import { useSea } from "./SeaProvider";
import ShowBubble from "./ShowBubble";

interface Props {
  id: BubbleID;
  parent?: BubbleID;
  senpai?: BubbleID;
  grandparent?: BubbleID;
  title?: boolean;
}

function Loading() {
  return <div>...</div>;
}

type BubbleState =
  | { loading: true }
  | { loading: false; bubble: Bubble | null };

export default function BubbleNode({
  id,
  title,
  parent,
  senpai,
  grandparent,
}: Props) {
  const sea = useSea();
  const [state, setState] = React.useState<BubbleState>({ loading: true });

  const onEnter = () => {
    if (parent !== undefined) {
      sea.create(parent);
      return true;
    } else {
      return false;
    }
  };

  const onIndent = () => {
    console.log('should indent', id, senpai, parent)
    if (senpai !== undefined && parent !== undefined) {
      sea.indent(id, senpai, parent);
      return true;
    } else {
      return false;
    }
  };

  const onUnIndent = () => {
    if (parent !== undefined && grandparent !== undefined) {
      sea.unindent(id, parent, grandparent);
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
    const children = [];
    let previous;
    for (const child of bubble.children) {
      children.push(
        <React.Fragment key={`${child}`}>
          <BubbleNode
            id={child}
            parent={id}
            grandparent={parent}
            senpai={previous}
          />
        </React.Fragment>
      );
      previous = child;
    }
    return (
      <div>
        <div className={title ? "text-3xl font-bold mb-6" : ""}>
          <ShowBubble
            starting={bubble.inner}
            onModify={(s) => sea.modifyInner(id, s)}
            onEnter={onEnter}
            onIndent={onIndent}
            onUnIndent={onUnIndent}
          />
        </div>
        <div className={title ? "" : "ml-4"}>{children}</div>
      </div>
    );
  } else {
    return <></>;
  }
}
