import React, { useState, useMemo } from 'react';
import { FinanceReport, PaymentsReport, ComparisonReport, DashboardData } from '../types';
import { formatCurrency, formatNumber, formatPercentage, formatDecimal } from '../utils/formatting';
import {
    TrendingUpIcon, PiggyBankIcon, DollarSignIcon,
    TargetIcon, ArrowUpIcon, ArrowDownIcon,
    CreditCardIcon, BarcodeIcon, PixIcon,
    RefreshIcon, AlertTriangleIcon, InfoIcon, DownloadCloudIcon,
    TrendingDownIcon, TrophyIcon, PercentageIcon, CheckCircleIcon, CalendarIcon
} from './icons';
import DateFilter from './DateFilter';
import Tooltip from './Tooltip';

interface ReportsDashboardProps {
    reports: {
        financeReport: FinanceReport;
        paymentsReport: PaymentsReport;
        comparisonReport: ComparisonReport;
    };
    dashboardData: DashboardData;
    activeDateFilter: string;
    handleDateFilterChange: (preset: string, customRange?: { start: Date; end: Date }) => void;
    dateRange: { start: Date; end: Date };
}

type ActiveTab = 'financeiro' | 'vendas' | 'pagamentos' | 'comparativos';

// --- UI HELPERS ---

const Badge: React.FC<{ children: React.ReactNode, variant?: 'default' | 'outline' | 'success' | 'warning' | 'danger', className?: string }> = ({ children, variant = 'default', className = '' }) => {
    const baseStyle = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
    const variants = {
        default: "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-blue-300",
        outline: "text-foreground dark:text-slate-300 border border-border dark:border-slate-700",
        success: "bg-accent-green/10 text-accent-green hover:bg-accent-green/20 dark:bg-green-900/40 dark:text-green-300",
        warning: "bg-accent-orange/10 text-accent-orange hover:bg-accent-orange/20 dark:bg-orange-900/40 dark:text-orange-300",
        danger: "bg-accent-red/10 text-accent-red hover:bg-accent-red/20 dark:bg-red-900/40 dark:text-red-300",
    };
    return <div className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</div>
}

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`rounded-xl border border-border dark:border-slate-700 bg-card dark:bg-slate-800 text-foreground dark:text-slate-100 shadow-sm ${className}`}>{children}</div>
)

const CardHeader: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
)

const CardTitle: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
)

const CardContent: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`p-6 pt-0 ${className}`}>{children}</div>
)

const Separator: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`shrink-0 bg-border dark:bg-slate-700 h-[1px] w-full ${className}`} />
)

// --- CUSTOM SVG CHARTS ---

const WaterfallChart: React.FC<{ values: FinanceReport['waterfall'] }> = ({ values }) => {
    const data = [
        { label: 'Receita', value: values.receita_liquida, type: 'pos' },
        { label: 'COGS', value: -values.cogs, type: 'neg' },
        { label: 'Marketing', value: -values.marketing, type: 'neg' },
        { label: 'Taxas', value: -values.taxas, type: 'neg' },
        { label: 'Margem', value: values.margem_contribuicao, type: 'subtotal' },
        { label: 'Fixos', value: -values.custos_fixos, type: 'neg' },
        { label: 'Lucro', value: values.lucro_liquido, type: 'final' },
    ];

    let runningTotal = 0;
    const chartHeight = 200;
    const maxVal = Math.max(values.receita_liquida, ...data.map(d => Math.abs(d.value))) * 1.1;

    return (
        <div className="h-[240px] w-full flex items-end justify-between space-x-2 pt-8 pb-6">
            {data.map((item, i) => {
                const isTotal = item.type === 'pos' || item.type === 'subtotal' || item.type === 'final';
                const start = isTotal ? 0 : runningTotal;
                const end = isTotal ? item.value : runningTotal + item.value;
                
                const barBottomVal = Math.min(start, end);
                const barTopVal = Math.max(start, end);
                
                const barBottomPx = (barBottomVal / maxVal) * chartHeight;
                const barHeightPx = Math.max(2, ((barTopVal - barBottomVal) / maxVal) * chartHeight); // Min height for visibility

                if (!isTotal) runningTotal += item.value;
                else runningTotal = item.value;

                let colorClass = 'bg-primary';
                if (item.type === 'neg') colorClass = 'bg-accent-orange';
                if (item.type === 'subtotal') colorClass = 'bg-muted-foreground/30 dark:bg-slate-600';
                if (item.type === 'final') colorClass = values.lucro_liquido >= 0 ? 'bg-accent-green' : 'bg-accent-red';

                return (
                    <div key={i} className="flex-1 flex flex-col items-center relative group h-full justify-end">
                         <div className="absolute -top-6 text-[10px] font-semibold text-muted-foreground dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {formatCurrency(item.value)}
                        </div>
                        <div 
                            className={`w-full rounded-sm ${colorClass} relative transition-all hover:opacity-80`}
                            style={{ height: `${barHeightPx}px`, marginBottom: `${barBottomPx}px` }}
                        >
                        </div>
                        <span className="text-[10px] text-muted-foreground dark:text-slate-400 mt-2 truncate w-full text-center" title={item.label}>{item.label}</span>
                    </div>
                )
            })}
        </div>
    )
}

const BurnDownChart: React.FC<{ expected: {date:string, value:number}[], actual: {date:string, value:number}[] }> = ({ expected, actual }) => {
    if (!expected.length) return null;
    const maxVal = expected[expected.length - 1].value * 1.05;
    const width = 500; // arbitrary internal SVG units
    const height = 150; 
    
    const pointsToPath = (data: {value:number}[]) => {
        return data.map((d, i) => {
            const x = (i / (expected.length - 1)) * width;
            const y = height - ((d.value / maxVal) * height);
            return `${x},${y}`;
        }).join(' ');
    };

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
             {/* Grid lines */}
             <line x1="0" y1={height} x2={width} y2={height} stroke="currentColor" className="text-border dark:text-slate-700" strokeWidth="1" opacity="0.5" />
             <line x1="0" y1="0" x2="0" y2={height} stroke="currentColor" className="text-border dark:text-slate-700" strokeWidth="1" opacity="0.5" />

             {/* Expected Line (Dashed) */}
            <polyline
                points={pointsToPath(expected)}
                fill="none"
                stroke="currentColor"
                className="text-muted-foreground/40 dark:text-slate-500/60"
                strokeWidth="2"
                strokeDasharray="8 4"
            />
            {/* Actual Line */}
             <polyline
                points={pointsToPath(actual)}
                fill="none"
                stroke="currentColor"
                className="text-primary dark:text-blue-400"
                strokeWidth="3"
            />
             {/* Current Point Dot */}
             {actual.length > 0 && (
                <circle 
                    cx={(actual.length - 1) / (expected.length - 1) * width} 
                    cy={height - ((actual[actual.length-1].value / maxVal) * height)} 
                    r="5" 
                    className="fill-primary dark:fill-blue-400"
                />
             )}
        </svg>
    )
}

const FunnelChart: React.FC<{ data: {label: string, value: number}[] }> = ({ data }) => {
    const maxVal = Math.max(...data.map(d => d.value));
    return (
        <div className="flex flex-col space-y-4 pt-4">
            {data.map((item, i) => (
                 <div key={i} className="flex items-center group">
                    <div className="w-32 text-sm text-muted-foreground dark:text-slate-400 font-medium truncate pr-4 text-right" title={item.label}>{item.label}</div>
                    <div className="flex-1 h-8 bg-card-alt dark:bg-slate-700 rounded-r-md overflow-hidden relative">
                         <div 
                            className="h-full bg-primary/80 dark:bg-primary/60 absolute left-0 top-0 rounded-r-md flex items-center justify-end px-3 transition-all duration-500 group-hover:bg-primary dark:group-hover:bg-primary" 
                            style={{width: `${Math.max(2, (item.value / maxVal) * 100)}%`}}
                        >
                            <span className="text-xs font-bold text-primary-foreground whitespace-nowrap">{formatNumber(item.value)}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

const DonutChart: React.FC<{ percentage: number; color: string; size?: number; strokeWidth?: number; }> = ({ percentage, color, size = 80, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    return (
        <div className="relative flex-shrink-0" style={{width: size, height: size}}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                <circle className="text-card-alt/50 dark:text-slate-700/50" stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
                <circle stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="transparent" r={radius} cx={size / 2} cy={size / 2}
                    style={{ strokeDasharray: circumference, strokeDashoffset: offset, transition: 'stroke-dashoffset 0.8s ease-out' }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-foreground dark:text-slate-200">{Math.round(percentage)}%</span>
            </div>
        </div>
    );
};

// --- REPORT VIEW COMPONENTS ---

const FinanceView: React.FC<{ report: FinanceReport }> = ({ report }) => {
    const { waterfall, top_movers, burn_down, ui, goal } = report;
    
    return (
        <div className="space-y-6 animate-fade-in">
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="col-span-2 shadow-sm hover-zoom">
                    <CardHeader>
                         <div className="flex justify-between items-center">
                            <CardTitle>{ui.title}</CardTitle>
                            <Badge variant="outline" className="font-normal">{report.period}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground dark:text-slate-400">{ui.subtitle}</p>
                    </CardHeader>
                    <CardContent>
                        <WaterfallChart values={waterfall} />
                        <Separator className="my-4" />
                        <div className="text-sm text-muted-foreground dark:text-slate-400 font-medium text-center">{ui.footer}</div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover-zoom flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle>Burn-down da Meta</CardTitle>
                         <div className="flex items-center gap-2 text-sm mt-1">
                            <Badge variant={burn_down.status === 'ahead' ? 'success' : (burn_down.status === 'on_track' ? 'default' : 'danger')}>
                                {burn_down.status === 'ahead' ? 'Adiantado' : (burn_down.status === 'on_track' ? 'No Ritmo' : 'Atrasado')}
                            </Badge>
                            <span className="text-muted-foreground dark:text-slate-400">Progresso: <strong className="text-foreground dark:text-slate-200">{Math.round(goal.progress_pct)}%</strong></span>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-[200px] pt-6 flex flex-col justify-between">
                        <div className="h-40">
                            <BurnDownChart expected={burn_down.line_expected} actual={burn_down.line_actual} />
                        </div>
                         <div className="mt-4 text-sm flex justify-between text-muted-foreground dark:text-slate-400 pt-4 border-t border-border dark:border-slate-700">
                            <span>Meta: <strong className="text-foreground dark:text-slate-200">{formatCurrency(goal.value)}</strong></span>
                            <span>Faltam: <strong className="text-foreground dark:text-slate-200">{formatCurrency(burn_down.remaining)}</strong></span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card className="hover-zoom">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrophyIcon className="w-5 h-5 text-primary" />
                            Top Movers (Lucro)
                        </CardTitle>
                        <p className="text-sm text-muted-foreground dark:text-slate-400">Produtos que mais impactaram o resultado.</p>
                    </CardHeader>
                    <CardContent>
                        {top_movers.sku.length > 0 ? (
                            <div className="space-y-3">
                                {top_movers.sku.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-card-alt/50 dark:bg-slate-700/50 rounded-lg border border-border/50 dark:border-slate-700/50">
                                        <span className="font-medium text-sm truncate mr-2 text-foreground dark:text-slate-200" title={item.sku}>{item.sku}</span>
                                        <span className={`font-bold text-sm ${item.delta_lucro >= 0 ? 'text-accent-green dark:text-green-400' : 'text-accent-red dark:text-red-400'}`}>
                                            {item.delta_lucro > 0 ? '+' : ''}{formatCurrency(item.delta_lucro)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground dark:text-slate-400 text-sm">Sem dados suficientes.</div>
                        )}
                    </CardContent>
                 </Card>
                  <Card className="hover-zoom opacity-75">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TargetIcon className="w-5 h-5 text-primary" />
                            Contribuição por Campanha
                        </CardTitle>
                        <p className="text-sm text-muted-foreground dark:text-slate-400">Performance das origens de tráfego.</p>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center min-h-[150px]">
                         <div className="text-center px-6 py-4 text-muted-foreground dark:text-slate-400 text-sm bg-card-alt/30 dark:bg-slate-700/30 rounded-lg border border-dashed border-border dark:border-slate-700">
                            <InfoIcon className="w-5 h-5 mx-auto mb-2 opacity-50" />
                            Integração de Marketing necessária para visualizar este relatório.
                        </div>
                    </CardContent>
                 </Card>
            </div>
        </div>
    );
};

const KPI: React.FC<{ title: string; value: string; delta?: number, icon?: React.ReactNode }> = ({ title, value, delta, icon }) => (
  <Card className="shadow-sm hover-zoom">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground dark:text-slate-400">{title}</CardTitle>
        {icon && <div className="text-muted-foreground/40 dark:text-slate-500">{icon}</div>}
      </div>
      <div className="text-2xl font-bold tracking-tight text-foreground dark:text-slate-100 mt-2">{value}</div>
    </CardHeader>
    <CardContent className="pt-0 pb-5">
      {typeof delta === 'number' && (
        <div className="text-xs flex items-center gap-1.5 font-medium mt-1">
          {delta >= 0 ? <TrendingUpIcon className="h-3.5 w-3.5 text-accent-green dark:text-green-400" /> : <TrendingDownIcon className="h-3.5 w-3.5 text-accent-red dark:text-red-400" />}
          <span className={delta >= 0 ? "text-accent-green dark:text-green-400" : "text-accent-red dark:text-red-400"}>{Math.abs(delta).toFixed(1)}%</span>
          <span className="text-muted-foreground dark:text-slate-400">vs. período anterior</span>
        </div>
      )}
    </CardContent>
  </Card>
);

const VendasView: React.FC<{ data: DashboardData }> = ({ data }) => {
    return (
        <div className="space-y-6 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPI title="ROAS (Retorno Ads)" value={`${formatDecimal(data.roas)}x`} delta={data.roasChange} icon={<TrendingUpIcon className="w-5 h-5"/>} />
                <KPI title="CAC (Custo Aquisição)" value={formatCurrency(data.cpa)} delta={data.cpaChange} icon={<TargetIcon className="w-5 h-5"/>} />
                <KPI title="Ticket Médio" value={formatCurrency(data.avgTicket)} delta={data.avgTicketChange} icon={<PercentageIcon className="w-5 h-5"/>} />
            </div>
            <Card className="shadow-sm hover-zoom">
                <CardHeader>
                    <CardTitle>Funil de Vendas (Estimado)</CardTitle>
                    <p className="text-sm text-muted-foreground dark:text-slate-400">Conversão de tráfego em receita.</p>
                </CardHeader>
                <CardContent>
                     <FunnelChart data={[
                        { label: 'Sessões', value: data.sessions },
                        { label: 'Pedidos', value: data.ordersCount }
                     ]} />
                     <p className="text-xs text-muted-foreground dark:text-slate-400 mt-6 text-center flex items-center justify-center gap-1">
                        <InfoIcon className="w-3 h-3" />
                        Funil simplificado. Conecte GA4 para dados intermediários (carrinho, checkout).
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

const PaymentsView: React.FC<{ report: PaymentsReport }> = ({ report }) => {
    const { approval, rates, ui, reconciliation } = report;
    const periodLabel = useMemo(() => {
        const labels: { [key: string]: string } = {
            today: 'Hoje',
            yesterday: 'Ontem',
            last7days: '7d',
            last14days: '14d',
            thisMonth: 'Este Mês',
            allTime: 'Total',
            custom: 'Personalizado'
        };
        return labels[report.period] || report.period;
    }, [report.period]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPI title="Aprovação Cartão" value={formatPercentage(rates.cartao_approval_pct)} icon={<CreditCardIcon className="w-5 h-5"/>} />
                <KPI title="Aprovação Pix" value={formatPercentage(rates.pix_approval_pct)} icon={<PixIcon className="w-5 h-5"/>} />
                <KPI title="Aprovação Boleto" value={formatPercentage(rates.boleto_approval_pct)} icon={<BarcodeIcon className="w-5 h-5"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-card dark:bg-slate-800 p-6 rounded-xl border border-border dark:border-slate-700 hover-zoom flex items-center justify-between shadow-sm">
                    <div>
                        <h3 className="font-bold text-foreground dark:text-slate-100 mb-4 flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-accent-blue"></span>
                            <span>Cartão <span className="text-muted-foreground dark:text-slate-400 font-normal text-xs ml-1">({periodLabel})</span></span>
                        </h3>
                        <div className="space-y-1.5 text-sm">
                            <p className="text-muted-foreground dark:text-slate-400 flex justify-between gap-6"><span>Aprovados:</span><span className="font-semibold text-foreground dark:text-slate-200">{formatNumber(approval.cartao.approved)}</span></p>
                            <p className="text-muted-foreground dark:text-slate-400 flex justify-between gap-6"><span>Reprovados:</span><span className="font-medium text-accent-red dark:text-red-400">{formatNumber(approval.cartao.rejected)}</span></p>
                        </div>
                    </div>
                    <DonutChart percentage={rates.cartao_approval_pct} color="hsl(var(--accent-blue))" />
                </div>
                 <div className="bg-card dark:bg-slate-800 p-6 rounded-xl border border-border dark:border-slate-700 hover-zoom flex items-center justify-between shadow-sm">
                    <div>
                        <h3 className="font-bold text-foreground dark:text-slate-100 mb-4 flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#A259FF]"></span>
                            <span>Pix <span className="text-muted-foreground dark:text-slate-400 font-normal text-xs ml-1">({periodLabel})</span></span>
                        </h3>
                        <div className="space-y-1.5 text-sm">
                            <p className="text-muted-foreground dark:text-slate-400 flex justify-between gap-6"><span>Aprovados:</span><span className="font-semibold text-foreground dark:text-slate-200">{formatNumber(approval.pix.approved)}</span></p>
                            <p className="text-muted-foreground dark:text-slate-400 flex justify-between gap-6"><span>Pendentes:</span><span className="font-medium text-accent-orange dark:text-orange-400">{formatNumber(approval.pix.pending)}</span></p>
                        </div>
                    </div>
                    <DonutChart percentage={rates.pix_approval_pct} color="#A259FF" />
                </div>
                 <div className="bg-card dark:bg-slate-800 p-6 rounded-xl border border-border dark:border-slate-700 hover-zoom flex items-center justify-between shadow-sm">
                    <div>
                        <h3 className="font-bold text-foreground dark:text-slate-100 mb-4 flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-accent-green"></span>
                            <span>Boleto <span className="text-muted-foreground dark:text-slate-400 font-normal text-xs ml-1">({periodLabel})</span></span>
                        </h3>
                        <div className="space-y-1.5 text-sm">
                            <p className="text-muted-foreground dark:text-slate-400 flex justify-between gap-6"><span>Aprovados:</span><span className="font-semibold text-foreground dark:text-slate-200">{formatNumber(approval.boleto.approved)}</span></p>
                             <p className="text-muted-foreground dark:text-slate-400 flex justify-between gap-6"><span>Pendentes:</span><span className="font-medium text-accent-orange dark:text-orange-400">{formatNumber(approval.boleto.pending)}</span></p>
                        </div>
                    </div>
                    <DonutChart percentage={rates.boleto_approval_pct} color="hsl(var(--accent-green))" />
                </div>
            </div>

            <Card className="shadow-sm">
                <CardContent className="p-4 flex items-center gap-3 text-sm">
                    <span className="font-medium text-muted-foreground dark:text-slate-400">Status da Reconciliação:</span>
                    {reconciliation.alert ? (
                            <Badge variant="warning" className="flex items-center gap-1.5 py-1 px-3">
                            <AlertTriangleIcon className="w-4 h-4" /> Divergência detectada ({formatDecimal(reconciliation.delta_pct)}%)
                        </Badge>
                    ) : (
                        <Badge variant="success" className="flex items-center gap-1.5 py-1 px-3">
                            <CheckCircleIcon className="w-4 h-4" /> Pedidos vs. Pagamentos OK
                        </Badge>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

const ComparativosView: React.FC<{ report: ComparisonReport }> = ({ report }) => {
    return (
        <div className="space-y-6 animate-fade-in">
             <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div>
                        <CardTitle>{report.ui.title}</CardTitle>
                        <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">{report.ui.subtitle}</p>
                    </div>
                    <div className="flex gap-2">
                         <button className="flex items-center gap-2 px-3 py-2 text-xs font-semibold border border-border dark:border-slate-700 rounded-lg hover:bg-card-alt dark:hover:bg-slate-700 transition-colors text-foreground dark:text-slate-200">
                            <DownloadCloudIcon className="w-4 h-4" /> Exportar CSV
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-card-alt/50 dark:bg-slate-700/50 border-y border-border dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground dark:text-slate-400 uppercase tracking-wider">KPI</th>
                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground dark:text-slate-400 uppercase tracking-wider">Período</th>
                                    <th className="px-6 py-3 text-right font-medium text-muted-foreground dark:text-slate-400 uppercase tracking-wider">Meta</th>
                                    <th className="px-6 py-3 text-right font-medium text-muted-foreground dark:text-slate-400 uppercase tracking-wider">Realizado</th>
                                    <th className="px-6 py-3 text-right font-medium text-muted-foreground dark:text-slate-400 uppercase tracking-wider">Delta (Δ)</th>
                                    <th className="px-6 py-3 text-center font-medium text-muted-foreground dark:text-slate-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border dark:divide-slate-700 bg-card dark:bg-slate-800">
                                {report.table.map((row, i) => (
                                    <tr key={i} className="hover:bg-card-alt/30 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground dark:text-slate-200">{row.kpi}</td>
                                        <td className="px-6 py-4 text-muted-foreground dark:text-slate-400">{row.period}</td>
                                        <td className="px-6 py-4 text-right tabular-nums text-muted-foreground dark:text-slate-400">{row.plan ? formatCurrency(row.plan) : '—'}</td>
                                        <td className="px-6 py-4 text-right tabular-nums font-bold text-foreground dark:text-slate-100">{formatCurrency(row.actual)}</td>
                                        <td className={`px-6 py-4 text-right tabular-nums font-medium ${(row.delta || 0) >= 0 ? 'text-accent-green dark:text-green-400' : 'text-accent-red dark:text-red-400'}`}>
                                            {row.delta ? formatCurrency(row.delta) : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                             <Badge variant={row.status === 'green' ? 'success' : (row.status === 'amber' ? 'warning' : 'danger')}>
                                                {row.status === 'green' ? 'OK' : (row.status === 'amber' ? 'Atenção' : 'Atrasado')}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// --- MAIN DASHBOARD COMPONENT ---

const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ reports, dashboardData, activeDateFilter, handleDateFilterChange, dateRange }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('financeiro');

    // Safety check to prevent crashing if reports are not yet available
    if (!reports || !reports.financeReport) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-pulse">
                <RefreshIcon className="w-8 h-8 text-muted-foreground/50 dark:text-slate-500 animate-spin" />
                <p className="text-muted-foreground dark:text-slate-400 font-medium">Gerando relatórios...</p>
            </div>
        );
    }

    const { financeReport, paymentsReport, comparisonReport } = reports;

    return (
        <div className="animate-fade-in">
             {/* Header with Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground dark:text-slate-100 tracking-tight">Relatórios Avançados</h1>
                    <p className="text-muted-foreground dark:text-slate-400 mt-1">Análises detalhadas de performance e saúde financeira.</p>
                </div>
                <div className="flex items-center gap-3 self-start md:self-auto">
                     <Badge variant="outline" className="py-1.5 px-3 text-xs font-medium gap-1.5 text-muted-foreground dark:text-slate-300">
                        <RefreshIcon className="w-3.5 h-3.5" />
                        {financeReport.ui.badges?.updated || 'Atualizado agora'}
                    </Badge>
                    {activeTab !== 'comparativos' && (
                         <DateFilter
                            activeFilter={activeDateFilter}
                            onFilterChange={handleDateFilterChange}
                            initialDateRange={dateRange}
                        />
                    )}
                </div>
            </div>

             {/* Navigation Tabs */}
             <div className="border-b border-border dark:border-slate-700 mb-6">
                <nav className="flex space-x-8 -mb-px overflow-x-auto" aria-label="Tabs">
                    {[
                        { id: 'financeiro', label: 'Financeiro', icon: <DollarSignIcon className="w-4 h-4"/> },
                        { id: 'vendas', label: 'Vendas & Tráfego', icon: <TrendingUpIcon className="w-4 h-4"/> },
                        { id: 'pagamentos', label: 'Pagamentos', icon: <CreditCardIcon className="w-4 h-4"/> },
                        { id: 'comparativos', label: 'Comparativos', icon: <CalendarIcon className="w-4 h-4"/> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as ActiveTab)}
                            className={`
                                py-4 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                                ${activeTab === tab.id
                                    ? 'border-primary text-primary dark:border-blue-400 dark:text-blue-400'
                                    : 'border-transparent text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-slate-200 hover:border-border dark:hover:border-slate-600'}
                            `}
                            aria-current={activeTab === tab.id ? 'page' : undefined}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="pb-12">
                {activeTab === 'financeiro' && <FinanceView report={financeReport} />}
                {activeTab === 'vendas' && <VendasView data={dashboardData} />}
                {activeTab === 'pagamentos' && <PaymentsView report={paymentsReport} />}
                {activeTab === 'comparativos' && <ComparativosView report={comparisonReport} />}
            </div>
        </div>
    );
};

export default ReportsDashboard;