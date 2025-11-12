
import React, { useState, useMemo } from 'react';
import { DailyData } from '../types';
import { formatNumber, formatDate } from '../utils/formatting';
import { CheckCircleIcon, HourglassIcon, AlertTriangleIcon, TruckIcon, RepeatIcon } from './icons';
import LogisticsHistoryModal from './LogisticsHistoryModal';

const KpiCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-background p-4 rounded-lg border border-border flex-1">
        <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-primary-soft text-primary">{icon}</div>
            <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
        </div>
    </div>
);

const DailyLogisticsTracking: React.FC<{ dailyData: DailyData[] }> = ({ dailyData }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            const [year, month, day] = e.target.value.split('-').map(Number);
            const utcDate = new Date(Date.UTC(year, month - 1, day));
            setSelectedDate(utcDate);
        }
    };

    const selectedDayData = useMemo(() => {
        const dateStr = formatDate(selectedDate);
        const dataForDay = dailyData.find(d => d.date === dateStr);

        const counts = {
            entregue: 0,
            em_transito: 0,
            aguardando_retirada: 0,
            falha: 0,
            devolvido: 0,
        };

        if (dataForDay) {
            dataForDay.logistics.shipments.forEach(s => {
                const status = s.status as keyof typeof counts;
                if (status in counts) {
                    counts[status]++;
                }
            });
        }
        return counts;

    }, [selectedDate, dailyData]);

    return (
        <>
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover-zoom">
                <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                    <h3 className="text-lg font-semibold text-foreground">Acompanhamento Diário de Logística</h3>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input
                                type="date"
                                id="logistics-date"
                                value={formatDate(selectedDate)}
                                onChange={handleDateChange}
                                className="bg-background border border-border rounded-lg px-3 py-2 font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <button
                            onClick={() => setIsHistoryModalOpen(true)}
                            className="bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg transition-colors hover:bg-primary/90"
                        >
                            Consultar Histórico Completo
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <KpiCard title="Entregues" value={formatNumber(selectedDayData.entregue)} icon={<CheckCircleIcon className="w-5 h-5"/>} />
                    <KpiCard title="Em Trânsito" value={formatNumber(selectedDayData.em_transito)} icon={<TruckIcon className="w-5 h-5"/>} />
                    <KpiCard title="Aguard. Retirada" value={formatNumber(selectedDayData.aguardando_retirada)} icon={<HourglassIcon className="w-5 h-5"/>} />
                    <KpiCard title="Falhas" value={formatNumber(selectedDayData.falha)} icon={<AlertTriangleIcon className="w-5 h-5"/>} />
                    <KpiCard title="Devoluções" value={formatNumber(selectedDayData.devolvido)} icon={<RepeatIcon className="w-5 h-5"/>} />
                </div>
            </div>

            <LogisticsHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                dailyData={dailyData}
            />
        </>
    );
};

export default DailyLogisticsTracking;
