import React, { useMemo, useState, useEffect } from 'react';
import { PlanningInputs, PlanningResults, DailyActuals, AccumulatedResults } from '../types';
import { formatCurrency, formatNumber, formatPercentage, formatDate } from '../utils/formatting';
import { SpinnerIcon, ShopifyLogo, MetaLogo, GoogleAdsLogo, ArchiveIcon, CaretDownIcon } from './icons';

const safeDivide = (numerator: number, denominator: number): number => {
    if (denominator === 0 || isNaN(denominator) || !isFinite(denominator)) {
      return 0;
    }
    return numerator / denominator;
};

const EditableCell: React.FC<{
    value: number | null;
    onChange: (value: number | null) => void;
    isCurrency?: boolean;
}> = ({ value, onChange, isCurrency }) => {
    const [inputValue, setInputValue] = React.useState('');
    const [isFocused, setIsFocused] = React.useState(false);

    React.useEffect(() => {
        if (!isFocused) {
            if (value === null || value === 0) {
                setInputValue('');
            } else {
                 const formatted = isCurrency
                    ? formatCurrency(value).replace('R$', '').trim()
                    : formatNumber(value);
                 setInputValue(formatted);
            }
        }
    }, [value, isFocused, isCurrency]);
    
    const handleFocus = () => {
        setIsFocused(true);
        setInputValue(value === null ? '' : String(value).replace('.',','));
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let currentVal = e.target.value;
        currentVal = currentVal.replace(/[^0-9,]/g, '');
        const parts = currentVal.split(',');
        if (parts.length > 2) {
            currentVal = parts[0] + ',' + parts.slice(1).join('');
        }
        setInputValue(currentVal);
    };
    
    const handleBlur = () => {
        setIsFocused(false);
        if (inputValue === '') {
            onChange(null);
            return;
        }
        const parsedValue = parseFloat(inputValue.replace(/\./g, '').replace(',', '.'));
        onChange(isNaN(parsedValue) ? null : parsedValue);
    };

    return (
        <input
            type="text"
            value={inputValue}
            onFocus={handleFocus}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full bg-card hover:bg-card-alt focus:bg-background focus:ring-2 focus:ring-primary focus:outline-none text-right rounded-md py-1 px-2 border border-transparent focus:border-primary transition-colors tabular-nums font-medium text-foreground"
            placeholder="-"
        />
    );
};

type IntegrationStatus = 'connected' | 'disconnected' | 'connecting';

interface TacticalTrackingProps {
  planningInputs: PlanningInputs;
  planningResults: PlanningResults;
  actuals: (DailyActuals & { date: string })[];
  accumulatedActuals: AccumulatedResults;
  handleActualsChange: (date: string, field: keyof DailyActuals, value: number | null) => void;
  integrations: { meta: IntegrationStatus; google: IntegrationStatus; shopify: IntegrationStatus; };
  isSyncing: { shopify: boolean; ads: boolean };
  handleSyncShopify: () => void;
  handleSyncAds: () => void;
  dateRange: { start: Date; end: Date };
  displayDate: Date;
  onMonthChange: (direction: 'prev' | 'next') => void;
  onArchive: () => void;
  archivedReportIds: string[];
}

const TacticalTracking: React.FC<TacticalTrackingProps> = ({ 
    planningInputs, planningResults, actuals, accumulatedActuals, handleActualsChange,
    integrations, isSyncing, handleSyncShopify, handleSyncAds, dateRange,
    displayDate, onMonthChange, onArchive, archivedReportIds
}) => {
    
    const [editedActuals, setEditedActuals] = useState(actuals);

    useEffect(() => {
        const startStr = formatDate(dateRange.start);
        const endStr = formatDate(dateRange.end);
        setEditedActuals(actuals.filter(a => a.date >= startStr && a.date <= endStr));
    }, [actuals, dateRange]);

    const hasUnsavedChanges = JSON.stringify(actuals.filter(a => {
        const d = new Date(a.date);
        return d.getUTCFullYear() === dateRange.start.getUTCFullYear() && d.getUTCMonth() === dateRange.start.getUTCMonth();
    })) !== JSON.stringify(editedActuals);

    const plannedAvgTicket = safeDivide(planningResults.revenue, planningResults.orders);
    
    const dailyData = useMemo(() => {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0); // Normalize to start of day UTC

        const displayYear = displayDate.getUTCFullYear();
        const displayMonth = displayDate.getUTCMonth();

        const currentYear = today.getUTCFullYear();
        const currentMonth = today.getUTCMonth();
        
        const isViewingCurrentMonth = displayYear === currentYear && displayMonth === currentMonth;
        
        const daysInRange: Date[] = [];
        let currentDate = new Date(dateRange.start);
        const loopEndDate = isViewingCurrentMonth ? today : dateRange.end;

        while (currentDate <= loopEndDate && currentDate.getUTCMonth() === displayMonth) {
            daysInRange.push(new Date(currentDate));
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }
        
        const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
        const divisor = daysInMonth || 30;
        
        const dailyPlanned = {
            sessions: safeDivide(planningResults.sessions, divisor),
            orders: safeDivide(planningResults.orders, divisor),
            revenue: safeDivide(planningResults.revenue, divisor),
            conversionRate: planningInputs.conversionRate,
            avgTicket: plannedAvgTicket,
            marketingSpend: safeDivide(planningResults.adSpend, divisor),
            cps: planningResults.cps
        };

        const actualsMap = new Map<string, (typeof actuals)[number]>(editedActuals.map(a => [a.date, a]));
        
        return daysInRange.map(date => {
            const dateStr = formatDate(date);
            const actualForDay: DailyActuals = actualsMap.get(dateStr) || { sessions: null, revenue: null, marketingSpend: null, newCustomers: null };
            
            const actualSessions = actualForDay.sessions ?? 0;
            const actualRevenue = actualForDay.revenue ?? 0;
            
            const actualOrders = safeDivide(actualRevenue, plannedAvgTicket); // Approximate based on ticket, ideally from input
            // Better approximation if we don't input orders directly:
            // If we want accurate orders we should probably input them, but for now derived is okay for MVP if user only inputs revenue.
            // Let's stick to derived for uniformity with current App state, but it might be slightly off.
            
            const actualConversionRate = safeDivide(actualOrders, actualSessions) * 100;
            const actualAvgTicket = safeDivide(actualRevenue, actualOrders);
            const actualMarketingSpend = actualForDay.marketingSpend ?? 0;
            const actualCps = safeDivide(actualMarketingSpend, actualSessions);
            
            return {
                date,
                dateStr,
                planned: dailyPlanned,
                actual: {
                    sessions: actualForDay.sessions,
                    orders: actualOrders,
                    revenue: actualForDay.revenue,
                    conversionRate: actualConversionRate,
                    avgTicket: actualAvgTicket,
                    marketingSpend: actualForDay.marketingSpend,
                    cps: actualCps,
                }
            }
        }).reverse(); // Show newest first

    }, [editedActuals, planningResults, planningInputs, dateRange, plannedAvgTicket, actuals, displayDate]);

    const handleLocalChange = (date: string, field: keyof DailyActuals, value: number | null) => {
        setEditedActuals(prevActuals => {
            const newActuals = [...prevActuals];
            const index = newActuals.findIndex(a => a.date === date);

            if (index !== -1) {
                newActuals[index] = { ...newActuals[index], [field]: value };
            } else {
                const newDay = { date, sessions: null, revenue: null, marketingSpend: null, newCustomers: null, [field]: value };
                newActuals.push(newDay);
            }
            return newActuals;
        });
    };

    const handleSaveChanges = () => {
        editedActuals.forEach(editedDay => {
            const originalDay = actuals.find(d => d.date === editedDay.date);
            if (!originalDay || originalDay.sessions !== editedDay.sessions) {
                handleActualsChange(editedDay.date, 'sessions', editedDay.sessions);
            }
            if (!originalDay || originalDay.revenue !== editedDay.revenue) {
                handleActualsChange(editedDay.date, 'revenue', editedDay.revenue);
            }
            if (!originalDay || originalDay.marketingSpend !== editedDay.marketingSpend) {
                handleActualsChange(editedDay.date, 'marketingSpend', editedDay.marketingSpend);
            }
        });
    };

    const handleDiscardChanges = () => {
        const startStr = formatDate(dateRange.start);
        const endStr = formatDate(dateRange.end);
        setEditedActuals(actuals.filter(a => a.date >= startStr && a.date <= endStr));
    };


    const metrics = [
        { key: 'revenue', title: 'Faturamento', format: formatCurrency, isInput: true, isCurrency: true, higherIsBetter: true },
        { key: 'marketingSpend', title: 'Marketing (Ads)', format: formatCurrency, isInput: true, isCurrency: true, higherIsBetter: false },
        { key: 'sessions', title: 'Sessões', format: formatNumber, isInput: true, higherIsBetter: true },
        { key: 'orders', title: 'Pedidos (est.)', format: formatNumber, higherIsBetter: true },
        { key: 'conversionRate', title: 'Tx. Conversão', format: formatPercentage, higherIsBetter: true },
        { key: 'avgTicket', title: 'Ticket Médio', format: formatCurrency, higherIsBetter: true },
    ];
    
    const getPerformanceColor = (actual: number, planned: number, higherIsBetter: boolean): string => {
        if (actual === null || planned === null || actual === 0 || planned === 0 || !isFinite(actual) || !isFinite(planned)) return 'text-muted-foreground';
        const diff = (actual - planned) / planned;
        if (Math.abs(diff) < 0.02) return 'text-foreground'; // Within 2% is neutral
        
        if (higherIsBetter) {
            return actual >= planned ? 'text-accent-green' : 'text-accent-red';
        } else {
            return actual <= planned ? 'text-accent-green' : 'text-accent-red';
        }
    };

    const isShopifySyncDisabled = integrations.shopify !== 'connected' || isSyncing.shopify || isSyncing.ads;
    const isAdsSyncDisabled = (integrations.meta !== 'connected' && integrations.google !== 'connected') || isSyncing.shopify || isSyncing.ads;
    
    const monthStr = displayDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    const isFutureMonth = new Date(displayDate.getUTCFullYear(), displayDate.getUTCMonth()) > new Date(new Date().getFullYear(), new Date().getMonth());

    const year = displayDate.getUTCFullYear();
    const month = displayDate.getUTCMonth();
    const reportId = `${year}-${String(month + 1).padStart(2, '0')}`;
    const isArchived = archivedReportIds.includes(reportId);

    return (
        <>
            <header className="flex flex-wrap items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">
                        Acompanhamento Tático Diário
                    </h1>
                     <div className="flex items-center space-x-2 mt-2">
                        <button onClick={() => onMonthChange('prev')} className="p-2 rounded-md hover:bg-card-alt transition-colors">
                            <CaretDownIcon className="w-5 h-5 rotate-90" />
                        </button>
                        <span className="text-lg font-semibold text-foreground w-48 text-center capitalize">{monthStr}</span>
                        <button onClick={() => onMonthChange('next')} disabled={isFutureMonth} className="p-2 rounded-md hover:bg-card-alt transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                             <CaretDownIcon className="w-5 h-5 -rotate-90" />
                        </button>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {hasUnsavedChanges && (
                        <>
                            <button
                                onClick={handleDiscardChanges}
                                className="bg-card-alt text-foreground font-semibold px-4 py-2 rounded-lg border border-border transition-colors hover:bg-border"
                            >
                                Descartar
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                className="bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg transition-colors hover:bg-primary/90"
                            >
                                Salvar Alterações
                            </button>
                        </>
                    )}
                     <button 
                        onClick={onArchive}
                        disabled={isArchived}
                        className="flex items-center justify-center space-x-2 bg-primary-soft text-primary-soft-fg font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-soft/80"
                    >
                        <ArchiveIcon className="w-5 h-5" />
                        <span>{isArchived ? 'Mês Arquivado' : 'Arquivar Mês'}</span>
                    </button>
                    <button 
                        onClick={handleSyncShopify}
                        disabled={isShopifySyncDisabled}
                        className="flex items-center justify-center space-x-2 bg-card-alt text-foreground font-semibold px-4 py-2 rounded-lg border border-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-border"
                    >
                        {isSyncing.shopify ? <SpinnerIcon className="w-5 h-5" /> : <ShopifyLogo className="w-5 h-5" />}
                        <span>{isSyncing.shopify ? 'Sinc...' : 'Shopify'}</span>
                    </button>
                     <button 
                        onClick={handleSyncAds}
                        disabled={isAdsSyncDisabled}
                        className="flex items-center justify-center space-x-2 bg-card-alt text-foreground font-semibold px-4 py-2 rounded-lg border border-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-border"
                    >
                        {isSyncing.ads ? <SpinnerIcon className="w-5 h-5" /> : (
                            <div className="flex items-center -space-x-1">
                                <MetaLogo className="w-5 h-5" />
                                <GoogleAdsLogo className="w-5 h-5 rounded-full" />
                            </div>
                        )}
                        <span>{isSyncing.ads ? 'Sinc...' : 'Ads'}</span>
                    </button>
                </div>
            </header>
            <div className="bg-card rounded-xl border border-border hover-zoom">
                <div className="overflow-x-auto h-[calc(100vh-270px)]">
                    <table className="w-full border-collapse text-sm" style={{ minWidth: '1200px' }}>
                        <thead className="sticky top-0 bg-card z-20 shadow-sm">
                            <tr className="border-b-2 border-border">
                                <th rowSpan={2} className="sticky left-0 bg-card p-3 text-left font-semibold uppercase text-muted-foreground tracking-wider z-10 border-r border-border">Dia</th>
                                {metrics.map(m => (
                                    <th key={m.key} colSpan={2} className="p-3 text-center font-semibold uppercase text-muted-foreground tracking-wider border-x border-border bg-card">{m.title}</th>
                                ))}
                            </tr>
                            <tr className="border-b border-border">
                                {metrics.map(m => (
                                    <React.Fragment key={m.key}>
                                        <th className="py-2 px-3 text-center text-xs font-medium uppercase text-muted-foreground bg-card-alt/50 border-l border-border">Meta Dia</th>
                                        <th className="py-2 px-3 text-center text-xs font-medium uppercase text-muted-foreground bg-card-alt border-r border-border">Realizado (Δ)</th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {dailyData.map(({ date, dateStr, planned, actual }) => (
                                <tr key={dateStr} className="hover:bg-card-alt/30 transition-colors">
                                    <td className="sticky left-0 bg-card hover:bg-card-alt/30 p-3 text-center font-medium text-foreground border-r border-border whitespace-nowrap">{date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' })}</td>
                                    {metrics.map(m => {
                                        const actualValue = actual[m.key as keyof typeof actual];
                                        const plannedValue = planned[m.key as keyof typeof planned];
                                        const colorClass = getPerformanceColor(actualValue as number, plannedValue, m.higherIsBetter);
                                        const delta = actualValue && plannedValue ? (actualValue - plannedValue) / plannedValue : 0;

                                        return (
                                            <React.Fragment key={m.key}>
                                                <td className="p-3 text-right tabular-nums text-muted-foreground border-l border-border bg-card-alt/10">
                                                    {m.format(plannedValue)}
                                                </td>
                                                <td className="p-1 text-right tabular-nums text-foreground border-r border-border relative group">
                                                    <div className="flex items-center justify-end space-x-2">
                                                         { m.isInput ? (
                                                            <div className="flex-1">
                                                                <EditableCell 
                                                                    value={actualValue as number | null} 
                                                                    onChange={(v) => handleLocalChange(dateStr, m.key as keyof DailyActuals, v)} 
                                                                    isCurrency={m.isCurrency} 
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className={`py-1.5 px-2 font-semibold flex-1 text-right`}>
                                                                <span>{actualValue > 0 ? m.format(actualValue as number) : '-'}</span>
                                                            </div>
                                                        )}
                                                        {actualValue !== null && actualValue !== 0 && Math.abs(delta) > 0.01 && (
                                                             <span className={`text-[10px] font-bold w-8 text-left ${delta > 0 ? (m.higherIsBetter ? 'text-accent-green' : 'text-accent-red') : (m.higherIsBetter ? 'text-accent-red' : 'text-accent-green')}`}>
                                                                {delta > 0 ? '+' : ''}{Math.round(delta * 100)}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </React.Fragment>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default TacticalTracking;