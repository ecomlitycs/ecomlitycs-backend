import React, { useMemo } from 'react';
import { ArchivedReport, DailyActuals, PlanningResults, AccumulatedResults } from '../types';
import { CloseIcon } from './icons';
import { formatCurrency, formatNumber, formatPercentage, formatDate } from '../utils/formatting';

interface ArchivedReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: ArchivedReport;
}

const safeDivide = (numerator: number, denominator: number): number => {
    if (denominator === 0 || isNaN(denominator) || !isFinite(denominator)) return 0;
    return numerator / denominator;
};

const ArchivedReportModal: React.FC<ArchivedReportModalProps> = ({ isOpen, onClose, report }) => {
    
    const dailyData = useMemo(() => {
        const year = report.month.getUTCFullYear();
        const month = report.month.getUTCMonth();
        const startDate = new Date(Date.UTC(year, month, 1));
        const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));

        const daysInRange: Date[] = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            daysInRange.push(new Date(currentDate));
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }

        const daysInMonth = endDate.getUTCDate();
        const plannedAvgTicket = safeDivide(report.planningResults.revenue, report.planningResults.orders);
        
        const dailyPlanned = {
            sessions: safeDivide(report.planningResults.sessions, daysInMonth),
            orders: safeDivide(report.planningResults.orders, daysInMonth),
            revenue: safeDivide(report.planningResults.revenue, daysInMonth),
            conversionRate: report.planningResults.roas * 10, // Approximation from planning inputs
            avgTicket: plannedAvgTicket,
            marketingSpend: safeDivide(report.planningResults.adSpend, daysInMonth),
            cps: report.planningResults.cps
        };

        const actualsMap = new Map<string, (typeof report.dailyData)[number]>(report.dailyData.map(a => [a.date, a]));
        
        return daysInRange.map(date => {
            const dateStr = formatDate(date);
            const actualForDay: DailyActuals = actualsMap.get(dateStr) || { sessions: null, revenue: null, marketingSpend: null, newCustomers: null };
            
            const actualSessions = actualForDay.sessions ?? 0;
            const actualRevenue = actualForDay.revenue ?? 0;
            const actualOrders = safeDivide(actualRevenue, plannedAvgTicket);
            const actualConversionRate = safeDivide(actualOrders, actualSessions) * 100;
            const actualAvgTicket = safeDivide(actualRevenue, actualOrders);
            const actualMarketingSpend = actualForDay.marketingSpend ?? 0;
            const actualCps = safeDivide(actualMarketingSpend, actualSessions);
            
            return {
                date,
                dateStr,
                planned: dailyPlanned,
                actual: {
                    sessions: actualSessions, orders: actualOrders, revenue: actualRevenue,
                    conversionRate: actualConversionRate, avgTicket: actualAvgTicket,
                    marketingSpend: actualMarketingSpend, cps: actualCps,
                }
            }
        });

    }, [report]);

    const metrics = [
        { key: 'sessions', title: 'Sessão', format: formatNumber },
        { key: 'orders', title: 'Nº de Pedidos', format: formatNumber },
        { key: 'revenue', title: 'Faturamento', format: formatCurrency },
        { key: 'conversionRate', title: 'Tx. Conversão', format: formatPercentage },
        { key: 'avgTicket', title: 'Ticket Médio', format: formatCurrency },
        { key: 'marketingSpend', title: 'Marketing', format: formatCurrency },
        { key: 'cps', title: 'CPS', format: formatCurrency }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-6xl p-6 flex flex-col"
                onClick={e => e.stopPropagation()}
                style={{ maxHeight: '90vh' }}
            >
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-foreground capitalize">
                        Relatório Arquivado: {report.month.toLocaleString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-card-alt">
                        <CloseIcon />
                    </button>
                </div>

                <div className="overflow-auto">
                    <table className="w-full border-collapse text-sm" style={{ minWidth: '1200px' }}>
                        <thead className="sticky top-0 bg-card z-10">
                            <tr className="border-b-2 border-border">
                                <th rowSpan={2} className="sticky left-0 bg-card p-2 text-left font-semibold uppercase text-muted-foreground tracking-wider z-10 border-r border-border">Dia</th>
                                {metrics.map(m => (
                                    <th key={m.key} colSpan={2} className="p-2 text-center font-semibold uppercase text-muted-foreground tracking-wider border-x border-border">{m.title}</th>
                                ))}
                            </tr>
                            <tr className="border-b border-border">
                                {metrics.map(m => (
                                    <React.Fragment key={m.key}>
                                        <th className="py-2 px-2 text-center text-xs font-medium uppercase text-muted-foreground bg-card-alt border-l border-border">Previsto</th>
                                        <th className="py-2 px-2 text-center text-xs font-medium uppercase text-muted-foreground bg-card-alt border-r border-border">Realizado</th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {/* Accumulated Row */}
                            <tr className="font-bold bg-card-alt sticky top-[77px] z-10">
                                <td className="sticky left-0 bg-card-alt p-2 text-left text-foreground border-r border-border">Acumulado</td>
                                {metrics.map(m => (
                                    <React.Fragment key={m.key}>
                                        <td className="p-2 text-right tabular-nums text-foreground border-l border-border">
                                            {m.key in report.planningResults ? m.format(report.planningResults[m.key as keyof PlanningResults]) : '-'}
                                        </td>
                                        <td className="p-2 text-right tabular-nums text-foreground border-r border-border">
                                            {m.key in report.accumulatedActuals ? m.format(report.accumulatedActuals[m.key as keyof AccumulatedResults]) : '-'}
                                        </td>
                                    </React.Fragment>
                                ))}
                            </tr>
                            {/* Daily Rows */}
                            {dailyData.map(({ date, dateStr, planned, actual }) => (
                                <tr key={dateStr} className="hover:bg-card-alt">
                                    <td className="sticky left-0 bg-card hover:bg-card-alt p-2 text-center font-semibold text-foreground border-r border-border whitespace-nowrap">{date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' })}</td>
                                    {metrics.map(m => (
                                        <React.Fragment key={m.key}>
                                            <td className="p-2 text-right tabular-nums text-muted-foreground border-l border-border">
                                                {m.format(planned[m.key as keyof typeof planned])}
                                            </td>
                                            <td className="p-2 text-right tabular-nums text-foreground border-r border-border">
                                                {m.format(actual[m.key as keyof typeof actual])}
                                            </td>
                                        </React.Fragment>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ArchivedReportModal;