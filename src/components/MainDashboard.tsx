



import React, { useMemo } from 'react';
import { PaymentMethodsData, GranularGoalData, DashboardData } from '../types';
import { formatCurrency, formatNumber, formatPercentage, formatDecimal } from '../utils/formatting';
import { 
    ArrowDownIcon, ArrowUpIcon, DollarSignIcon, PackageIcon, TrendingUpIcon, TicketIcon,
    InfoIcon, PiggyBankIcon, TargetIcon, AlertTriangleIcon, CheckCircleIcon
} from './icons';
import DateFilter from './DateFilter';
import Tooltip from './Tooltip';

interface MainDashboardProps {
    dashboardData: DashboardData;
    paymentMethodsData: PaymentMethodsData;
    granularGoalData: GranularGoalData;
    activeDateFilter: string;
    handleDateFilterChange: (preset: string, customRange?: { start: Date; end: Date }) => void;
    dateRange: { start: Date; end: Date };
}

const KpiCard: React.FC<{
    title: string;
    value: string;
    change: number;
    icon: React.ReactNode;
    invertChangeColor?: boolean;
    secondaryValue?: string;
    tooltipText?: string;
}> = ({ title, value, change, icon, invertChangeColor = false, secondaryValue, tooltipText }) => {
    const isNegative = change < 0;
    const isZero = change === 0;

    let isIncreaseGood = !invertChangeColor;
    let changeColorClass = '';
    if(!isZero) {
        changeColorClass = (isNegative && isIncreaseGood) || (!isNegative && !isIncreaseGood) ? 'text-accent-red dark:text-red-400' : 'text-accent-green dark:text-green-400';
    } else {
        changeColorClass = 'text-muted-foreground dark:text-slate-400';
    }

    return (
        <div className="bg-card dark:bg-slate-800 p-5 rounded-xl border border-border dark:border-slate-700 hover-zoom flex flex-col justify-between h-full">
            <div>
                <div className="flex items-center space-x-2 text-muted-foreground dark:text-slate-400 mb-2">
                    {icon}
                    <p className="font-semibold text-sm">{title}</p>
                    {tooltipText && (
                        <Tooltip text={tooltipText}>
                            <InfoIcon className="w-4 h-4 text-muted-foreground/50 dark:text-slate-500 hover:text-primary transition-colors cursor-help" />
                        </Tooltip>
                    )}
                </div>
                <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold text-foreground dark:text-slate-100 tracking-tight">{value}</p>
                     {secondaryValue && (
                        <p className="text-sm font-medium text-muted-foreground dark:text-slate-400 mb-0.5">{secondaryValue}</p>
                    )}
                </div>
            </div>
            
            {typeof change === 'number' && !isNaN(change) && (
                <div className={`flex items-center space-x-1 text-sm font-medium mt-2 ${changeColorClass}`}>
                    {isZero ? null : (isNegative ? <ArrowDownIcon className="w-3 h-3" /> : <ArrowUpIcon className="w-3 h-3" />)}
                    <span>{formatDecimal(Math.abs(change))}%</span>
                    <span className="text-muted-foreground/80 dark:text-slate-500 ml-1">vs. período anterior</span>
                </div>
            )}
        </div>
    );
};

const DonutChart: React.FC<{ percentage: number; color: string; size?: number; strokeWidth?: number; }> = ({ percentage, color, size = 70, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    return (
        <div className="relative flex-shrink-0" style={{width: size, height: size}}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                <circle className="text-card-alt dark:text-slate-700" stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
                <circle stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="transparent" r={radius} cx={size / 2} cy={size / 2}
                    style={{ strokeDasharray: circumference, strokeDashoffset: offset, transition: 'stroke-dashoffset 0.5s ease-out' }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-foreground dark:text-slate-200">{Math.round(percentage)}%</span>
            </div>
        </div>
    );
};

const PaymentMethodCard: React.FC<{ 
    title: string; 
    conversion: number; 
    color: string; 
    approvedValue: number; 
    approvedCount: number; 
    pendingValue: number; 
    pendingCount: number; 
    periodLabel: string;
}> = (props) => (
    <div className="bg-card dark:bg-slate-800 p-5 rounded-xl border border-border dark:border-slate-700 hover-zoom flex items-center justify-between">
        <div>
            <h3 className="font-semibold text-foreground dark:text-slate-100 mb-3 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full" style={{backgroundColor: props.color}}></span>
                <span>{props.title} <span className="text-muted-foreground dark:text-slate-400 font-normal text-xs">({props.periodLabel})</span></span>
            </h3>
             <div className="space-y-1">
                <p className="text-sm text-muted-foreground dark:text-slate-400 flex justify-between gap-4">
                    <span>Aprovados:</span>
                    <span className="font-medium text-foreground dark:text-slate-200">{props.approvedCount}</span>
                </p>
                {(props.pendingValue > 0 || props.title !== 'Cartões') && (
                     <p className="text-sm text-muted-foreground dark:text-slate-400 flex justify-between gap-4">
                        <span>Pendentes:</span>
                        <span className="font-medium text-foreground dark:text-slate-200">{props.pendingCount}</span>
                    </p>
                )}
            </div>
        </div>
        <DonutChart percentage={props.conversion} color={props.color} />
    </div>
);

const GoalBurnDownBanner: React.FC<{ goalData: GranularGoalData['month'] }> = ({ goalData }) => {
    const remaining = Math.max(0, goalData.goal - goalData.achieved);
    
    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysLeft = Math.max(1, daysInMonth - currentDay);
    
    const expectedProgress = (goalData.goal / daysInMonth) * currentDay;
    const isOffTrack = goalData.achieved < (expectedProgress * 0.95);
    const neededPerDay = remaining / daysLeft;

    return (
        <div className="bg-card dark:bg-slate-800 rounded-xl border border-border dark:border-slate-700 p-5 flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
             <div className={`absolute top-0 left-0 w-1.5 h-full ${isOffTrack ? 'bg-accent-red' : 'bg-accent-green'}`}></div>
             <div className="flex-1 pl-4 w-full">
                 <h2 className="text-xl font-bold text-foreground dark:text-slate-100 flex items-center flex-wrap gap-2">
                     {remaining > 0 ? (
                         <>
                            Faltam <span className="text-primary dark:text-blue-400 text-2xl">{formatCurrency(remaining)}</span> de Faturamento para bater a meta do mês!
                         </>
                     ) : (
                         <>
                            <CheckCircleIcon className="w-7 h-7 text-accent-green" />
                            <span className="text-accent-green">Meta do mês batida! Parabéns!</span>
                         </>
                     )}
                 </h2>
                 <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground dark:text-slate-400">
                     <span>Meta: <strong className="text-foreground dark:text-slate-200">{formatCurrency(goalData.goal)}</strong></span>
                     <span>Realizado: <strong className="text-foreground dark:text-slate-200">{formatCurrency(goalData.achieved)}</strong></span>
                     <span>Dias restantes: <strong className="text-foreground dark:text-slate-200">{daysLeft}</strong></span>
                 </div>
             </div>
             
             {remaining > 0 && (
                 <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="bg-card-alt dark:bg-slate-700 p-4 rounded-lg text-center min-w-[160px]">
                        <p className="text-xs text-muted-foreground dark:text-slate-400 font-semibold uppercase mb-1">Hoje precisa</p>
                        <p className="text-lg font-bold text-foreground dark:text-slate-100">{formatCurrency(neededPerDay)}</p>
                        <p className="text-xs text-muted-foreground dark:text-slate-400">para manter o ritmo</p>
                    </div>
                    <div className={`p-4 rounded-lg text-center min-w-[160px] flex flex-col justify-center ${isOffTrack ? 'bg-accent-red/10 text-accent-red dark:bg-red-900/40 dark:text-red-300' : 'bg-accent-green/10 text-accent-green dark:bg-green-900/40 dark:text-green-300'}`}>
                         <p className="text-sm font-bold uppercase flex items-center justify-center gap-2">
                            {isOffTrack ? <ArrowDownIcon className="w-4 h-4" /> : <TrendingUpIcon className="w-4 h-4" />}
                            {isOffTrack ? 'Atrasado' : 'No Ritmo'}
                         </p>
                         {isOffTrack && <p className="text-xs opacity-80 mt-1">Acelere suas vendas!</p>}
                    </div>
                 </div>
             )}
        </div>
    )
}

const ProfitWaterfallRow: React.FC<{ label: string; value: number; type: 'positive' | 'negative' | 'subtotal' | 'final'; tooltip?: string }> = ({ label, value, type, tooltip }) => {
    let valueClass = 'text-foreground dark:text-slate-200';
    let bgClass = '';
    let prefix = '';
    let borderClass = '';

    if (type === 'negative') {
        valueClass = 'text-accent-orange dark:text-orange-400';
        prefix = '– ';
        bgClass = 'hover:bg-accent-orange/5 dark:hover:bg-orange-900/30';
    } else if (type === 'positive') {
        valueClass = 'text-primary dark:text-blue-400';
        bgClass = 'bg-primary/5 dark:bg-blue-900/30 hover:bg-primary/10 dark:hover:bg-blue-900/40';
    } else if (type === 'subtotal') {
        valueClass = 'text-foreground dark:text-slate-100 font-bold';
        bgClass = 'bg-card-alt dark:bg-slate-700';
        borderClass = 'border-t border-border dark:border-slate-700 mt-2';
        prefix = '= ';
    } else if (type === 'final') {
        const isPositive = value >= 0;
        valueClass = `${isPositive ? 'text-accent-green dark:text-green-400' : 'text-accent-red dark:text-red-400'} font-extrabold text-lg`;
        bgClass = `${isPositive ? 'bg-accent-green/10 dark:bg-green-900/40' : 'bg-accent-red/10 dark:bg-red-900/40'} border-t-2 ${isPositive ? 'border-accent-green dark:border-green-600' : 'border-accent-red dark:border-red-600'} mt-2`;
        prefix = '= ';
    } else {
        valueClass = 'text-foreground dark:text-slate-100 font-semibold';
    }

    return (
        <div className={`flex justify-between items-center py-2 px-4 rounded-lg transition-colors ${bgClass} ${borderClass}`}>
            <div className="flex items-center space-x-2">
                <span className={`text-sm ${type === 'final' || type === 'subtotal' || type === 'positive' ? 'font-bold text-foreground dark:text-slate-100' : 'font-medium text-muted-foreground dark:text-slate-400'}`}>{label}</span>
                {tooltip && (
                     <Tooltip text={tooltip}>
                        <InfoIcon className="w-3.5 h-3.5 text-muted-foreground/50 dark:text-slate-500 hover:text-primary transition-colors cursor-help" />
                    </Tooltip>
                )}
            </div>
            <span className={`tabular-nums font-semibold ${valueClass}`}>{prefix}{formatCurrency(value)}</span>
        </div>
    );
}

const ProfitWaterfall: React.FC<{ data: DashboardData }> = ({ data }) => {
    return (
        <div className="bg-card dark:bg-slate-800 rounded-xl border border-border dark:border-slate-700 h-full overflow-hidden hover-zoom flex flex-col">
             <div className="p-5 border-b border-border dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-foreground dark:text-slate-100 flex items-center space-x-2">
                    <PiggyBankIcon className="w-5 h-5 text-primary dark:text-blue-400" />
                    <span>De Receita a Lucro Líquido</span>
                </h3>
                <span className="text-xs text-muted-foreground dark:text-slate-400 font-medium px-2 py-1 bg-card-alt dark:bg-slate-700 rounded-md">Mês Atual</span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-center space-y-0.5">
                <ProfitWaterfallRow label="Receita Líquida" value={data.netRevenue} type="positive" tooltip="Receita Bruta − Descontos − Devoluções | Fonte: Shopify + Gateway | SLA: 60min" />
                <ProfitWaterfallRow label="COGS (Custo Produtos)" value={data.totalCogs} type="negative" tooltip="∑(qtd × cogs unitário) | Fonte: Cadastro de Produtos | SLA: 60min" />
                <ProfitWaterfallRow label="Marketing (Ads)" value={data.totalMarketing} type="negative" tooltip="∑ gasto em anúncios no período | Fonte: Meta/Google Ads | SLA: 6h" />
                <ProfitWaterfallRow label="Taxas (Gateway/Plat.)" value={data.totalFees} type="negative" tooltip="Gateway + Plataforma + Impostos | Fonte: Configurações | SLA: D+0" />
                <ProfitWaterfallRow label="Margem de Contribuição" value={data.contributionMargin} type="subtotal" tooltip="Receita Líquida − COGS − Mkt − Taxas" />
                <ProfitWaterfallRow label="Custos Fixos (est.)" value={data.fixedCosts} type="negative" tooltip="Salários + Aluguel + Softwares | Fonte: Tabela Fixos | SLA: D+0" />
                <ProfitWaterfallRow label="Lucro Líquido" value={data.netProfit} type="final" tooltip="Margem de Contribuição − Custos Fixos" />
            </div>
             <div className="px-5 py-3 bg-card-alt dark:bg-slate-700/50 border-t border-border dark:border-slate-700 text-xs flex justify-between text-muted-foreground dark:text-slate-400 font-medium">
                <span>Margem Contrib.: <strong className="text-foreground dark:text-slate-200">{formatPercentage(data.contributionMarginPercent)}</strong></span>
                <span>Margem Líquida: <strong className={data.netProfitMargin >= 0 ? 'text-accent-green dark:text-green-400' : 'text-accent-red dark:text-red-400'}>{formatPercentage(data.netProfitMargin)}</strong></span>
            </div>
        </div>
    )
}


const MainDashboard: React.FC<MainDashboardProps> = (props) => {
    const { dashboardData, paymentMethodsData, granularGoalData, activeDateFilter, handleDateFilterChange, dateRange } = props;
    
    const periodLabel = useMemo(() => {
        const labels: { [key: string]: string } = {
            today: 'Hoje',
            yesterday: 'Ontem',
            last7days: '7d',
            last14days: '14d',
            thisMonth: 'Mês',
            allTime: 'Total',
            custom: 'Pers.'
        };
        return labels[activeDateFilter] || 'Período';
    }, [activeDateFilter]);

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-foreground dark:text-slate-100 tracking-tight">Visão Geral Financeira</h1>
                <DateFilter activeFilter={activeDateFilter} onFilterChange={handleDateFilterChange} initialDateRange={dateRange} />
            </div>

            <GoalBurnDownBanner goalData={granularGoalData.month} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Left Column */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <KpiCard 
                        title="Receita Líquida (Aprovada)" 
                        value={formatCurrency(dashboardData.netRevenue)} 
                        secondaryValue={`${formatNumber(dashboardData.ordersCount)} pedidos`}
                        change={dashboardData.netRevenueChange} 
                        icon={<DollarSignIcon className="w-5 h-5" />} 
                        tooltipText="Receita Bruta − Descontos − Devoluções | Fonte: Shopify + Gateway | SLA: 60min"
                    />
                    <KpiCard 
                        title="ROAS (Retorno sobre Ads)" 
                        value={`${formatDecimal(dashboardData.roas)}x`}
                        change={dashboardData.roasChange}
                        icon={<TrendingUpIcon className="w-5 h-5" />} 
                        tooltipText="Receita atribuída ÷ Gasto em anúncios | SLA: 6h"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <KpiCard 
                            title="Ticket Médio" 
                            value={formatCurrency(dashboardData.avgTicket)} 
                            change={dashboardData.avgTicketChange} 
                            icon={<TicketIcon className="w-5 h-5" />} 
                            tooltipText="Receita Líquida ÷ Pedidos Aprovados | SLA: 60min"
                        />
                         <KpiCard 
                            title="CPA (Custo por Pedido)" 
                            value={formatCurrency(dashboardData.cpa)} 
                            change={dashboardData.cpaChange} 
                            icon={<TargetIcon className="w-5 h-5" />} 
                            invertChangeColor 
                            tooltipText="Gasto Total Ads ÷ Total Pedidos (novos+antigos) | SLA: 6h"
                        />
                         <KpiCard 
                            title="Pedidos Pendentes" 
                            value={formatNumber(dashboardData.pendingOrdersCount)}
                            secondaryValue={formatCurrency(dashboardData.pendingOrdersValue)}
                            change={0}
                            icon={<PackageIcon className="w-5 h-5" />} 
                            tooltipText="Pedidos aguardando pagamento (Boleto/Pix) | SLA: D+0"
                        />
                         <KpiCard 
                            title="Lucro Líquido Final" 
                            value={formatCurrency(dashboardData.netProfit)} 
                            change={dashboardData.netProfitChange} 
                            icon={<PiggyBankIcon className="w-5 h-5" />} 
                            tooltipText="Resultado final após todos os custos variáveis e fixos."
                        />
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 h-full">
                    <ProfitWaterfall data={dashboardData} />
                </div>
            </div>
            
            {/* Payment Methods Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <PaymentMethodCard 
                    title="Cartões" 
                    conversion={paymentMethodsData.card.conversion} 
                    color="hsl(var(--accent-blue))" 
                    approvedValue={paymentMethodsData.card.approved.value} 
                    approvedCount={paymentMethodsData.card.approved.count} 
                    pendingValue={0} 
                    pendingCount={0} 
                    periodLabel={periodLabel}
                />
                <PaymentMethodCard 
                    title="Boletos" 
                    conversion={paymentMethodsData.boleto.conversion} 
                    color="hsl(var(--accent-green))" 
                    approvedValue={paymentMethodsData.boleto.approved.value} 
                    approvedCount={paymentMethodsData.boleto.approved.count} 
                    pendingValue={paymentMethodsData.boleto.pending.value} 
                    pendingCount={paymentMethodsData.boleto.pending.count} 
                    periodLabel={periodLabel}
                />
                <PaymentMethodCard 
                    title="Pix" 
                    conversion={paymentMethodsData.pix.conversion} 
                    color="#A259FF" 
                    approvedValue={paymentMethodsData.pix.approved.value} 
                    approvedCount={paymentMethodsData.pix.approved.count} 
                    pendingValue={paymentMethodsData.pix.pending.value} 
                    pendingCount={paymentMethodsData.pix.pending.count} 
                    periodLabel={periodLabel}
                />
            </div>
        </div>
    );
};

export default MainDashboard;