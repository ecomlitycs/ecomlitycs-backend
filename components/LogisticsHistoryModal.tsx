import React, { useState, useMemo } from 'react';
import { DailyData } from '../types';
import { CloseIcon } from './icons';
import DateFilter from './DateFilter';
import { formatDate, getDateRangeForPreset, formatNumber } from '../utils/formatting';

interface LogisticsHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    dailyData: DailyData[];
}

const LogisticsHistoryModal: React.FC<LogisticsHistoryModalProps> = ({ isOpen, onClose, dailyData }) => {
    const [activeDateFilter, setActiveDateFilter] = useState('last30days');
    const [dateRange, setDateRange] = useState(getDateRangeForPreset('last30days'));

    const handleDateFilterChange = (preset: string, customRange?: { start: Date; end: Date }) => {
        setActiveDateFilter(preset);
        setDateRange(getDateRangeForPreset(preset, customRange));
    };

    const filteredData = useMemo(() => {
        const startStr = formatDate(dateRange.start);
        const endStr = formatDate(dateRange.end);
        
        return dailyData
            .filter(d => d.date >= startStr && d.date <= endStr)
            .map(dayData => {
                 const counts = { entregue: 0, em_transito: 0, aguardando_retirada: 0, falha: 0, devolvido: 0 };
                 dayData.logistics.shipments.forEach(s => {
                    const status = s.status as keyof typeof counts;
                    if (status in counts) {
                      counts[status]++;
                    }
                });
                return {
                    date: new Date(dayData.date + 'T00:00:00'),
                    ...counts
                };
            })
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [dateRange, dailyData]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-4xl p-6 animate-fade-in-up flex flex-col"
                onClick={e => e.stopPropagation()}
                style={{ maxHeight: '90vh' }}
            >
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-foreground">Histórico de Logística</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-card-alt">
                        <CloseIcon />
                    </button>
                </div>
                
                <div className="mb-4">
                    <DateFilter
                        activeFilter={activeDateFilter}
                        onFilterChange={handleDateFilterChange}
                        initialDateRange={dateRange}
                    />
                </div>

                <div className="overflow-y-auto">
                    {filteredData.length > 0 ? (
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-card-alt z-10">
                                <tr className="border-b border-border">
                                    <th className="py-2 px-3 text-left text-xs font-semibold uppercase text-muted-foreground">Dia</th>
                                    <th className="py-2 px-3 text-right text-xs font-semibold uppercase text-muted-foreground">Entregues</th>
                                    <th className="py-2 px-3 text-right text-xs font-semibold uppercase text-muted-foreground">Em Trânsito</th>
                                    <th className="py-2 px-3 text-right text-xs font-semibold uppercase text-muted-foreground">Aguard. Retirada</th>
                                    <th className="py-2 px-3 text-right text-xs font-semibold uppercase text-muted-foreground">Falhas</th>
                                    <th className="py-2 px-3 text-right text-xs font-semibold uppercase text-muted-foreground">Devoluções</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredData.map(day => (
                                    <tr key={day.date.toISOString()}>
                                        <td className="py-2 px-3 font-medium text-foreground whitespace-nowrap">{day.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}</td>
                                        <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">{formatNumber(day.entregue)}</td>
                                        <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">{formatNumber(day.em_transito)}</td>
                                        <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">{formatNumber(day.aguardando_retirada)}</td>
                                        <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">{formatNumber(day.falha)}</td>
                                        <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">{formatNumber(day.devolvido)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                         <div className="text-center py-16">
                            <p className="text-muted-foreground">Nenhum dado encontrado para este período.</p>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                @keyframes fade-in-up {
                    0% {
                        opacity: 0;
                        transform: translateY(20px) scale(0.98);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default LogisticsHistoryModal;