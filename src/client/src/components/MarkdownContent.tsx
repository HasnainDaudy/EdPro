import React from 'react';

interface MarkdownContentProps {
  content: string;
  bionic?: boolean;
  className?: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  bionic = false,
  className = ''
}) => {
  if (!content) return null;

  // Helper to apply bionic reading to plain text chunks
  const applyBionic = (text: string): React.ReactNode => {
    if (!bionic) return text;

    const words = text.split(' ');
    return words.map((word, wIdx) => {
      if (word.length <= 1) return word + ' ';
      const mid = Math.ceil(word.length * 0.45);
      const boldPart = word.slice(0, mid);
      const rest = word.slice(mid);
      return (
        <span key={wIdx}>
          <strong className="font-black text-stone-950">{boldPart}</strong>
          <span>{rest} </span>
        </span>
      );
    });
  };

  // Helper to parse inline markdown (bold, italic, code) within a line
  const parseInline = (line: string): React.ReactNode[] => {
    // Regex matches: **bold**, *italic*, `code`
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    const parts = line.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const text = part.slice(2, -2);
        return (
          <strong key={index} className="font-extrabold text-stone-900">
            {applyBionic(text)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        const text = part.slice(1, -1);
        return (
          <em key={index} className="italic text-stone-800">
            {applyBionic(text)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        const text = part.slice(1, -1);
        return (
          <code
            key={index}
            className="font-mono text-xs bg-stone-100 text-stone-800 px-1.5 py-0.5 rounded border border-stone-200"
          >
            {text}
          </code>
        );
      }
      return <React.Fragment key={index}>{applyBionic(part)}</React.Fragment>;
    });
  };

  // Break content into blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentListItems: React.ReactNode[] = [];
  let listKey = 0;

  const flushList = () => {
    if (currentListItems.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="space-y-2 my-3 pl-5 list-disc list-outside text-stone-700 marker:text-stone-400">
          {currentListItems}
        </ul>
      );
      currentListItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Empty line
    if (!trimmed) {
      flushList();
      continue;
    }

    // Header 1: # Header
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={`h1-${i}`} className="text-2xl font-black text-stone-900 tracking-tight mt-6 mb-3">
          {parseInline(trimmed.slice(2))}
        </h1>
      );
      continue;
    }

    // Header 2: ## Header
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${i}`} className="text-xl font-extrabold text-stone-900 tracking-tight mt-5 mb-2.5">
          {parseInline(trimmed.slice(3))}
        </h2>
      );
      continue;
    }

    // Header 3: ### Header
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${i}`} className="text-lg font-bold text-stone-900 tracking-tight mt-5 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D94826]" />
          <span>{parseInline(trimmed.slice(4))}</span>
        </h3>
      );
      continue;
    }

    // Header 4: #### Header
    if (trimmed.startsWith('#### ')) {
      flushList();
      elements.push(
        <h4 key={`h4-${i}`} className="text-sm font-bold uppercase tracking-wider text-stone-800 mt-4 mb-1.5">
          {parseInline(trimmed.slice(5))}
        </h4>
      );
      continue;
    }

    // Blockquote: > quote
    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="border-l-3 border-[#D94826] bg-stone-50/70 p-3 my-3 text-xs italic text-stone-700 rounded-r-xl"
        >
          {parseInline(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Bullet List item: - item or * item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemText = trimmed.slice(2);
      currentListItems.push(
        <li key={`li-${i}`} className="text-xs sm:text-sm leading-relaxed text-stone-800">
          {parseInline(itemText)}
        </li>
      );
      continue;
    }

    // Normal Paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm text-stone-800 leading-relaxed mb-3">
        {parseInline(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
};
