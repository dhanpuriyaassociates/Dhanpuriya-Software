import React from 'react';
import { 
  CreditCard, 
  ChefHat, 
  Scan, 
  UtensilsCrossed, 
  Package, 
  BarChart3,
  Flame
} from 'lucide-react';

export type ActiveTab = 'pos' | 'kds' | 'mess' | 'catering' | 'inventory' | 'tax';

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  activeKotCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  activeKotCount,
}) => {
  const tabs = [
    { id: 'pos' as ActiveTab, label: 'Counter POS', icon: CreditCard, shortcut: 'F1' },
    { id: 'kds' as ActiveTab, label: 'Kitchen KDS', icon: ChefHat, shortcut: 'F2', badge: activeKotCount },
    { id: 'mess' as ActiveTab, label: 'Mess & RFID Tap', icon: Scan, shortcut: 'F3' },
    { id: 'catering' as ActiveTab, label: 'Catering Pipeline', icon: UtensilsCrossed, shortcut: 'F4' },
    { id: 'inventory' as ActiveTab, label: 'Inventory & BOM', icon: Package, shortcut: 'F5' },
    { id: 'tax' as ActiveTab, label: 'Bharat Tax & Analytics', icon: BarChart3, shortcut: 'F6' },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-1.5">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? 'bg-white text-orange-600' : 'bg-rose-500/80 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
                <span className={`text-[10px] font-mono hidden md:inline opacity-60 ${
                  isActive ? 'text-orange-200' : 'text-slate-500'
                }`}>
                  [{tab.shortcut}]
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden xl:flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>RLS Active</span>
          </span>
          <span>·</span>
          <span>Dual-Clock Sync Ready</span>
        </div>
      </div>
    </div>
  );
};
