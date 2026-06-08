import { useMemo } from 'react';
import { marked } from 'marked';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  const html = useMemo(() => marked(content) as string, [content]);
  return (
    <div
      className={`md-body${className ? ' ' + className : ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
