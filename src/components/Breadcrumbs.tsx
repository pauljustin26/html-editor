import { ChevronRight } from 'lucide-react';
import type { BreadcrumbNode } from '../utils/breadcrumbParser';

interface BreadcrumbsProps {
  nodes: BreadcrumbNode[];
  onNodeClick: (node: BreadcrumbNode) => void;
}

export function Breadcrumbs({ nodes, onNodeClick }: BreadcrumbsProps) {
  if (nodes.length === 0) {
    return (
      <div className="flex items-center h-6 bg-[#1e1e1e] border-t border-[#333333] px-2 text-[11px] text-[#6b6b6b] shrink-0">
        Place cursor in HTML to see element path
      </div>
    );
  }

  return (
    <div className="flex items-center h-6 bg-[#1e1e1e] border-t border-[#333333] px-2 text-[11px] shrink-0 overflow-x-auto gap-0.5">
      {nodes.map((node, i) => (
        <span key={`${node.tag}-${node.startOffset}`} className="flex items-center gap-0.5 shrink-0">
          {i > 0 && <ChevronRight size={10} className="text-[#6b6b6b]" />}
          <button
            onClick={() => onNodeClick(node)}
            className="text-[#569cd6] hover:text-[#007acc] hover:underline cursor-pointer
              focus:outline-none focus:ring-1 focus:ring-[#007acc] rounded-sm px-0.5"
          >
            {node.tag}
            {node.id && <span className="text-[#4ec9b0]">#{node.id}</span>}
            {node.className && <span className="text-[#ce9178]">.{node.className.split(' ')[0]}</span>}
          </button>
        </span>
      ))}
    </div>
  );
}
