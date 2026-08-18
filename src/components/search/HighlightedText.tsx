import { Fragment } from "react";
import { highlightSegments } from "@/services/search/search-highlight";

interface HighlightedTextProps {
  text: string;
  query: string;
  className?: string;
}

/** Surlignage sans HTML brut : chaque segment est rendu en texte React. */
export function HighlightedText({ text, query, className }: HighlightedTextProps) {
  const segments = highlightSegments(text, query);
  return (
    <span className={className}>
      {segments.map((segment, index) => (
        <Fragment key={`${segment.text}-${index}`}>
          {segment.match ? (
            <mark className="bg-accent/25 text-inherit">{segment.text}</mark>
          ) : (
            segment.text
          )}
        </Fragment>
      ))}
    </span>
  );
}
