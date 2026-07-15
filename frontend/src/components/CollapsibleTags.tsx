import { Text } from "@mantine/core";
import { useLayoutEffect, useRef, useState } from "react";

import { TAG_FILTER_COLOR } from "../theme/tagColor";
import { toCamelTag } from "../utils/tags";

const MAX_LINES = 3;

interface Props {
  tags: string[];
  onTagClick: (tag: string) => void;
}

/** Wrapped #tag list that collapses to 3 rows (measured from actual layout, not a
 * guessed line-height) with a "Show more" toggle when tags overflow that. */
export function CollapsibleTags({ tags, onTagClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    const rowTops = Array.from(new Set(children.map((c) => c.offsetTop))).sort((a, b) => a - b);
    setCollapsedHeight(rowTops.length > MAX_LINES ? rowTops[MAX_LINES] - rowTops[0] : null);
  }, [tags]);

  if (tags.length === 0) return null;

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <div
        ref={containerRef}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          overflow: "hidden",
          maxHeight: !expanded && collapsedHeight != null ? collapsedHeight : undefined,
        }}
      >
        {tags.map((t) => (
          <Text
            key={t}
            size="xs"
            fw={700}
            onClick={(e) => { e.stopPropagation(); onTagClick(t); }}
            style={{ color: TAG_FILTER_COLOR, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            #{toCamelTag(t)}
          </Text>
        ))}
      </div>
      {collapsedHeight != null && (
        <Text
          size="xs"
          fw={600}
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          style={{ color: "var(--gk-text-muted)", cursor: "pointer", marginTop: 2 }}
        >
          {expanded ? "Show less" : "Show more"}
        </Text>
      )}
    </div>
  );
}
