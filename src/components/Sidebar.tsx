import { Image, AlertTriangle, PanelRightClose, PanelRightOpen } from 'lucide-react';
import type { SidebarTab } from '../types';

interface SidebarProps {
  isOpen: boolean;
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onToggle: () => void;
  children: React.ReactNode;
}

export function Sidebar({ isOpen, activeTab, onTabChange, onToggle, children }: SidebarProps) {
  const tabs: Array<{ id: SidebarTab; icon: React.ReactNode; label: string }> = [
    { id: 'images', icon: <Image size={16} />, label: 'Images' },
    { id: 'diagnostics', icon: <AlertTriangle size={16} />, label: 'Diagnostics' },
  ];

  return (
    <div className="flex h-full">
      {/* Tab strip */}
      <div className="flex flex-col w-10 bg-[#252526] border-l border-[#333333] shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              if (activeTab === tab.id && isOpen) {
                onToggle();
              } else {
                onTabChange(tab.id);
                if (!isOpen) onToggle();
              }
            }}
            title={tab.label}
            className={`flex items-center justify-center h-10 transition-colors cursor-pointer
              focus:outline-none focus:ring-1 focus:ring-inset focus:ring-[#007acc]
              ${activeTab === tab.id && isOpen
                ? 'text-[#cccccc] border-l-2 border-[#007acc] bg-[#2a2d2e]'
                : 'text-[#6b6b6b] border-l-2 border-transparent hover:text-[#cccccc]'
              }`}
          >
            {tab.icon}
          </button>
        ))}

        <div className="flex-1" />

        <button
          onClick={onToggle}
          title={isOpen ? 'Close sidebar' : 'Open sidebar'}
          className="flex items-center justify-center h-10 text-[#6b6b6b] hover:text-[#cccccc]
            transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-inset focus:ring-[#007acc]"
        >
          {isOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
        </button>
      </div>

      {/* Panel content */}
      {isOpen && (
        <div className="w-64 border-l border-[#333333] overflow-hidden flex flex-col">
          {children}
        </div>
      )}
    </div>
  );
}
