import React from 'react';
import { PlanningResults } from '../types';
import { formatCurrency, formatNumber, formatDecimal } from '../utils/formatting';
import { 
    InfoIcon, 
    ArrowDownIcon, 
    ArrowUpIcon,
    TargetIcon,
    UsersIcon,
    TrendingUpIcon,
    DollarSignIcon,
    MousePointerIcon,
    PiggyBankIcon,
} from './icons';

interface KpiCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    change?: number;
    changeColor?: 'green' | 'red';
    iconColor?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, change, changeColor, iconColor }) => {
    const hasChange = typeof change === 'number';
    const finalChangeColor = changeColor || (hasChange && change >= 0 ? 'green' : 'red');
    const changeColorClass = finalChangeColor === 'red' ? 'text-accent-red' : 'text-accent-green';
    
    return (
        <div
            className="bg-card p-4 rounded-xl border border-border flex flex-col justify-between hover-zoom"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white`} style={{backgroundColor: iconColor}}>
                        <div className="w-5 h-5">
                          {icon}
                        </div>
                    </div>
                    <p className="font-semibold text-muted-foreground">{title}</p>
                </div>
                <button className="text-muted-foreground/50 hover:text-muted-foreground">
                    <InfoIcon />
                </button>
            </div>
            <div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                 {hasChange && (
                    <div className="flex items-center space-x-1 text-sm mt-1">
                        {change >= 0 ? <ArrowUpIcon className={`${changeColorClass} w-3 h-3`} /> : <ArrowDownIcon className={`${changeColorClass} w-3 h-3`} />}
                        <span className={changeColorClass}>{formatDecimal(Math.abs(change))}%</span>
                        <span className="text-muted-foreground/80">vs meta</span>
                    </div>
                )}
            </div>
        </div>
    );
};


const ResultsGrid: React.FC<{ results: PlanningResults }> = ({ results }) => {
    const { orders, sessions, adSpend, roas, cps, idealCpa, contributionMargin } = results;

    const kpis = [
        { title: "Pedidos Esperados", value: formatNumber(orders), icon: <TargetIcon />, iconColor: 'hsl(var(--accent-blue))' },
        { title: "Sessões Necessárias", value: formatNumber(sessions), icon: <UsersIcon />, iconColor: 'hsl(var(--accent-blue))' },
        { title: "Investimento em Ads", value: formatCurrency(adSpend), icon: <TrendingUpIcon />, iconColor: 'hsl(var(--accent-orange))' },
        { title: "ROAS Esperado", value: formatDecimal(roas), icon: <DollarSignIcon />, iconColor: 'hsl(var(--accent-green))' },
        { title: "CPS (Custo por Sessão)", value: formatCurrency(cps), icon: <MousePointerIcon />, iconColor: 'hsl(var(--accent-blue))' },
        { title: "CPA Ideal", value: formatCurrency(idealCpa), icon: <PiggyBankIcon />, iconColor: 'hsl(var(--accent-orange))' },
        { title: "Margem de Contribuição", value: formatCurrency(contributionMargin), icon: <PiggyBankIcon />, iconColor: 'hsl(var(--accent-green))' },
    ];


    return (
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Resultados do Planejamento</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpis.map((kpi, index) => (
                  <KpiCard 
                      key={index}
                      title={kpi.title}
                      value={kpi.value}
                      icon={kpi.icon}
                      iconColor={kpi.iconColor}
                  />
              ))}
          </div>
        </div>
    );
};

export default ResultsGrid;