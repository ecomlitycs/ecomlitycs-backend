import React, { useState, useEffect } from 'react';
import { 
    DatabaseIcon,
    TargetIcon, DollarSignIcon, ChartBarIcon, SettingsIcon, FileIcon, 
    PieChartIcon, ChartIcon, WalletIcon, ChevronDownIcon, CompassIcon
} from './icons';

type ActiveTab = 'dashboard' | 'control_panel' | 'planning' | 'annual_planning' | 'pricing' | 'tracking' | 'reports' | 'data' | 'settings';

interface NavItemSpec {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
}

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: (id: ActiveTab) => void;
    isSubItem?: boolean;
}> = ({ id, label, icon, isActive, onClick, isSubItem = false }) => (
    <button
      onClick={() => onClick(id)}
      className={`w-full flex items-center py-2.5 px-3 rounded-md text-left transition-all duration-200 group space-x-3 ${
        isActive
          ? 'bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary-soft-fg font-semibold'
          : 'text-slate-600 dark:text-dark-muted-foreground hover:bg-slate-100 dark:hover:bg-dark-card-alt/60 hover:text-slate-900 dark:hover:text-dark-foreground font-medium'
      } ${isSubItem ? 'pl-4' : ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className={`flex-shrink-0 w-5 h-5 transition-colors ${isActive ? 'text-primary dark:text-dark-primary-soft-fg' : 'text-slate-400 dark:text-dark-muted-foreground/70 group-hover:text-slate-600 dark:group-hover:text-dark-foreground'}`}>
          {icon}
      </span>
      <span className="whitespace-nowrap text-sm">{label}</span>
    </button>
);

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, setActiveTab, isMobileOpen, setIsMobileOpen
}) => {

  const mainNavItems: NavItemSpec[] = [
    { id: 'dashboard', label: 'Financeiro', icon: <ChartIcon /> },
  ];
  
  const strategySubItems: NavItemSpec[] = [
    { id: 'control_panel', label: 'Painel de Controle', icon: <PieChartIcon /> },
    { id: 'planning', label: 'Planejamento de Metas', icon: <TargetIcon /> },
    { id: 'annual_planning', label: 'Planejamento Anual', icon: <WalletIcon /> },
  ];

  const otherNavItems: NavItemSpec[] = [
    { id: 'pricing', label: 'Precificação', icon: <DollarSignIcon /> },
    { id: 'tracking', label: 'Acompanhamento', icon: <FileIcon /> },
    { id: 'reports', label: 'Relatórios', icon: <ChartBarIcon /> },
    { id: 'data', label: 'Dados', icon: <DatabaseIcon /> },
  ];
  
  const bottomNavItems: NavItemSpec[] = [
    { id: 'settings', label: 'Configurações', icon: <SettingsIcon /> },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    if(window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  const isStrategyActive = strategySubItems.some(item => item.id === activeTab);
  const [isStrategyOpen, setIsStrategyOpen] = useState(isStrategyActive);

  useEffect(() => {
    if (isStrategyActive) {
      setIsStrategyOpen(true);
    }
  }, [isStrategyActive]);


  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-20 transition-opacity lg:hidden ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      ></div>
      
      <aside 
        className={`fixed inset-y-0 left-0 bg-card dark:bg-dark-card flex flex-col z-30 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} w-64 border-r border-border dark:border-dark-border`}
      >
        <div className="flex flex-col h-full">
            <div className="p-6">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary dark:bg-dark-primary rounded-xl flex items-center justify-center">
                        <ChartIcon className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-headings font-bold text-lg text-foreground dark:text-dark-foreground leading-tight">EcomLytics</p>
                        <p className="text-xs font-medium text-muted-foreground dark:text-dark-muted-foreground">Financeiro Pro</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-2">
              {mainNavItems.map((item) => (
                <NavItem key={item.id} {...item} isActive={activeTab === item.id} onClick={handleNavClick} />
              ))}

              {/* Strategy Accordion */}
              <div>
                <button
                  onClick={() => setIsStrategyOpen(!isStrategyOpen)}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-md transition-colors duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <CompassIcon className="w-5 h-5 text-slate-400 dark:text-dark-muted-foreground/70 group-hover:text-slate-600 dark:group-hover:text-dark-foreground" />
                    <span className="text-sm font-semibold text-slate-600 dark:text-dark-muted-foreground group-hover:text-slate-900 dark:group-hover:text-dark-foreground">Estratégia</span>
                  </div>
                  <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isStrategyOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-[max-height,margin-top,opacity] duration-300 ease-in-out ${isStrategyOpen ? 'max-h-96 mt-1 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="space-y-1 pl-5">
                      {strategySubItems.map((item) => (
                        <NavItem key={item.id} {...item} isActive={activeTab === item.id} onClick={handleNavClick} />
                      ))}
                    </div>
                </div>
              </div>
              
              <div className="space-y-1">
                {otherNavItems.map((item) => (
                  <NavItem key={item.id} {...item} isActive={activeTab === item.id} onClick={handleNavClick} />
                ))}
              </div>
            </nav>

            <div className="mt-auto p-3 border-t border-border/50 dark:border-dark-border/50 space-y-1">
                 {bottomNavItems.map((item) => (
                    <NavItem key={item.id} {...item} isActive={activeTab === item.id} onClick={handleNavClick} />
                ))}
            </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;