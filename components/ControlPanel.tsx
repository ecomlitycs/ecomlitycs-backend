

import React, { useState } from 'react';
import { AccumulatedResults, DashboardData, ProductRank, DailyProfit } from '../types';
import { formatCurrency, formatNumber, formatDecimal, formatPercentage } from '../utils/formatting';
import { DollarSignIcon, PiggyBankIcon, TrendingUpIcon, TrophyIcon, PercentageIcon, TargetIcon } from './icons';


interface ControlPanelProps {
    accumulatedActuals: AccumulatedResults;
    dashboardData: DashboardData;
    rankedProducts: ProductRank[];
    dailyProfitData: DailyProfit[];
}

const KpiCard: React.FC<{
    title: string;
    value: string;
    icon: React.ReactNode;
    iconColor: string;
}> = ({ title, value, icon, iconColor }) => (
    <div className="bg-card p-5 rounded-xl border border-border">
        <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${iconColor}1A` }}>
                <div className="w-6 h-6" style={{ color: iconColor }}>{icon}</div>
            </div>
            <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
        </div>
    </div>
);

const DailyProfitChart: React.FC<{ data: { date: string; profit: number | null }[] }> = ({ data }) => {
    const [tooltip, setTooltip] = useState<{
        visible: boolean;
        content: string;
        date: string;
        x: number;
        y: number;
    } | null>(null);

    if (!data || data.length === 0 || data.every(d => d.profit === null)) {
        return (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Sem dados de lucro para exibir.
            </div>
        );
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, profit: number, dateStr: string) => {
        setTooltip({
            visible: true,
            content: `${formatCurrency(profit)}`,
            date: new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            x: e.clientX,
            y: e.clientY,
        });
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    const maxAbsProfit = Math.max(...data.map(d => Math.abs(d.profit ?? 0)), 1);

    return (
        <>
            <div className="w-full h-full flex items-end justify-center gap-2 pt-2">
                {data.map(({ date, profit }) => {
                    const hasData = profit !== null;
                    const barHeightPercentage = hasData ? (Math.abs(profit ?? 0) / maxAbsProfit) * 100 : 0;
                    const barColor = hasData ? (profit! >= 0 ? 'bg-primary' : 'bg-accent-red') : 'bg-transparent';

                    return (
                        <div
                            key={date}
                            className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer"
                            onMouseMove={(e) => hasData && handleMouseMove(e, profit!, date)}
                            onMouseLeave={hasData ? handleMouseLeave : undefined}
                        >
                            <div className="w-full h-full bg-background dark:bg-slate-700/50 rounded-t-md absolute bottom-0"></div>
                            <div
                                className={`w-full rounded-t-md transition-all duration-300 group-hover:brightness-110 relative ${barColor}`}
                                style={{ height: `${barHeightPercentage}%` }}
                            ></div>
                        </div>
                    );
                })}
            </div>
            {tooltip && (
                <div
                    className="fixed bg-background/80 dark:bg-slate-800/80 backdrop-blur-sm border border-border text-foreground text-xs rounded-md shadow-lg px-2 py-1 z-50 pointer-events-none whitespace-nowrap"
                    style={{
                        left: `${tooltip.x}px`,
                        top: `${tooltip.y}px`,
                        transform: 'translate(-50%, calc(-100% - 8px))',
                    }}
                >
                    <p className="font-bold">{tooltip.date}</p>
                    <p>{tooltip.content}</p>
                </div>
            )}
        </>
    );
};

const TopProductItem: React.FC<{ rank: number; name: string; profit: number }> = ({ rank, name, profit }) => (
     <div className="flex items-center space-x-4 py-2 border-b border-border last:border-b-0">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-card-alt flex items-center justify-center font-bold text-foreground">{rank}</div>
        <div>
            <p className="font-semibold text-foreground text-sm">{name}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(profit)} de Lucro Líquido</p>
        </div>
    </div>
);


const ControlPanel: React.FC<ControlPanelProps> = ({ accumulatedActuals, dashboardData, rankedProducts, dailyProfitData }) => {
    
    return (
        <>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                    Painel de Controle
                </h1>
                <p className="text-base text-muted-foreground mt-1">
                    Análise de performance com os dados reais acumulados no mês.
                </p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <KpiCard title="Receita Realizada" value={formatCurrency(accumulatedActuals.revenue)} icon={<DollarSignIcon />} iconColor="hsl(var(--accent-blue))" />
                         <KpiCard title="Margem Contrib." value={formatCurrency(dashboardData.contributionMargin)} icon={<PiggyBankIcon />} iconColor="hsl(var(--accent-green))" />
                         <KpiCard title="ROAS Realizado" value={formatDecimal(dashboardData.roas)} icon={<TrendingUpIcon />} iconColor="hsl(var(--accent-orange))" />
                    </div>
                    <div className="bg-card p-6 rounded-xl border border-border h-64 flex flex-col">
                        <h3 className="text-lg font-bold text-foreground">Margem de Contribuição Diária (7 dias)</h3>
                        <div className="flex-grow mt-2">
                            <DailyProfitChart data={dailyProfitData} />
                        </div>
                    </div>
                </div>
                
                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-card p-6 rounded-xl border border-border">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-5 h-5 text-primary"><TrophyIcon/></div>
                            <h3 className="text-lg font-bold text-foreground">Ranking de Produtos</h3>
                        </div>
                        <div className="space-y-2">
                          {rankedProducts.map((p, i) => <TopProductItem key={i} rank={i+1} name={p.name} profit={p.profit} />)}
                        </div>
                    </div>
                     <div className="bg-card p-4 rounded-xl border border-border flex items-center justify-between">
                         <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary-soft text-primary-soft-fg p-1.5"><PercentageIcon/></div>
                            <p className="font-semibold text-foreground">Taxa de Conversão</p>
                         </div>
                         <p className="text-xl font-bold text-primary">{formatPercentage(accumulatedActuals.conversionRate)}</p>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border flex items-center justify-between">
                         <div className="flex items-center space-x-3">
                             <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-card-alt text-muted-foreground p-1.5"><DollarSignIcon/></div>
                            <p className="font-semibold text-foreground">Ticket Médio</p>
                         </div>
                         <p className="text-xl font-bold text-foreground">{formatCurrency(accumulatedActuals.avgTicket)}</p>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border flex items-center justify-between">
                         <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-card-alt text-muted-foreground p-1.5"><TargetIcon/></div>
                            <p className="font-semibold text-foreground">Total de Pedidos</p>
                         </div>
                         <p className="text-xl font-bold text-foreground">{formatNumber(accumulatedActuals.orders)}</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ControlPanel;