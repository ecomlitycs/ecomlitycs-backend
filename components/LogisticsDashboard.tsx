import React, { useState, useMemo } from 'react';
import { LogisticsOverviewData, ShipmentStatus, ShipmentDetail, DailyData } from '../types';
import { formatDuration, formatNumber } from '../utils/formatting';
import { TruckIcon, CheckCircleIcon, HourglassIcon, AlertTriangleIcon, RepeatIcon, BoxArrowDownIcon, NoUpdateCircleIcon, LinkBrokenIcon, AlertTriangleCircleIcon, ArrowRightCircleIcon, DollarSignCircleIcon } from './icons';
import ShipmentDetailsModal from './ShipmentDetailsModal';
import DailyLogisticsTracking from './DailyLogisticsTracking';

interface LogisticsDashboardProps {
    dailyData: DailyData[];
}

const MSEC_IN_DAY = 1000 * 60 * 60 * 24;

const calculateDays = (start: string | null, end: string | null): number | null => {
    if (!start || !end) return null;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    if (diff < 0) return null;
    return diff / MSEC_IN_DAY;
};

const KpiCard: React.FC<{ title: string; count: number; icon: React.ReactNode; onClick: () => void; }> = ({ title, count, icon, onClick }) => (
    <button onClick={onClick} className="bg-card p-5 rounded-xl border border-border hover-zoom text-left w-full">
        <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary-soft text-primary">{icon}</div>
            <div>
                <p className="text-sm font-semibold text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold text-foreground">{formatNumber(count)}</p>
            </div>
        </div>
    </button>
);

const statusIcons: Record<ShipmentStatus, React.ReactNode> = {
    entregue: <CheckCircleIcon />,
    em_transito: <TruckIcon />,
    devolvido: <RepeatIcon />,
    taxado: <DollarSignCircleIcon />,
    pendente: <HourglassIcon />,
    falha: <AlertTriangleCircleIcon />,
    atrasado: <HourglassIcon />,
    sem_atualizacao: <NoUpdateCircleIcon />,
    aguardando_retirada: <BoxArrowDownIcon />,
    sem_rastreio: <LinkBrokenIcon />,
};

const statusOrder: ShipmentStatus[] = ['em_transito', 'pendente', 'atrasado', 'aguardando_retirada', 'entregue', 'falha', 'taxado', 'devolvido', 'sem_atualizacao', 'sem_rastreio'];
const statusDisplayTexts: Record<ShipmentStatus, string> = {
    entregue: 'Entregues',
    em_transito: 'Em Trânsito',
    devolvido: 'Devolvidos',
    taxado: 'Taxados',
    pendente: 'Pendentes',
    falha: 'Falhas na Entrega',
    atrasado: 'Atrasados',
    sem_atualizacao: 'Sem Atualização',
    aguardando_retirada: 'Aguardando Retirada',
    sem_rastreio: 'Sem Rastreio',
};


const LogisticsDashboard: React.FC<LogisticsDashboardProps> = ({ dailyData }) => {
    const [modalState, setModalState] = useState<{ isOpen: boolean; title: string; shipments: ShipmentDetail[] }>({
        isOpen: false,
        title: '',
        shipments: []
    });

    const logisticsData: LogisticsOverviewData = useMemo(() => {
        const allShipments = dailyData.flatMap(d => d.logistics.shipments);
        const orderStatusCounts: { [key in ShipmentStatus]?: number } = {};
        
        const processingTimes: number[] = [];
        const customsTimes: number[] = [];
        const finalDeliveryTimes: number[] = [];

        for (const shipment of allShipments) {
            orderStatusCounts[shipment.status] = (orderStatusCounts[shipment.status] || 0) + 1;
            
            const processing = calculateDays(shipment.creationDate, shipment.shippingDate);
            if (processing !== null) processingTimes.push(processing);

            const customs = calculateDays(shipment.customsEntryDate, shipment.customsExitDate);
            if (customs !== null) customsTimes.push(customs);

            const delivery = calculateDays(shipment.shippingDate, shipment.deliveryDate);
            if (delivery !== null) finalDeliveryTimes.push(delivery);
        }
        
        const calculateAvg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

        return {
            allShipments,
            orderStatusCounts,
            avgProcessingTime: calculateAvg(processingTimes),
            avgCustomsTime: calculateAvg(customsTimes),
            avgFinalDeliveryTime: calculateAvg(finalDeliveryTimes),
        };
    }, [dailyData]);

    const handleCardClick = (status: ShipmentStatus) => {
        setModalState({
            isOpen: true,
            title: `Pedidos: ${statusDisplayTexts[status]}`,
            shipments: logisticsData.allShipments.filter(s => s.status === status),
        });
    };

    return (
        <>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                    Painel de Logística
                </h1>
                <p className="text-base text-muted-foreground mt-1">
                    Monitore o status e a performance das suas entregas.
                </p>
            </header>
            
            <div className="space-y-8">
                <div className="bg-card p-6 rounded-xl border border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Visão Geral de Entregas</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {statusOrder.map(status => (
                             <KpiCard
                                key={status}
                                title={statusDisplayTexts[status]}
                                count={logisticsData.orderStatusCounts[status] || 0}
                                icon={statusIcons[status]}
                                onClick={() => handleCardClick(status)}
                            />
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card p-5 rounded-xl border border-border flex flex-col items-center justify-center text-center">
                        <p className="text-sm font-medium text-muted-foreground">Tempo Médio de Processamento</p>
                        <p className="text-3xl font-bold text-foreground my-2">{formatDuration(logisticsData.avgProcessingTime)}</p>
                    </div>
                    <div className="bg-card p-5 rounded-xl border border-border flex flex-col items-center justify-center text-center">
                        <p className="text-sm font-medium text-muted-foreground">Tempo Médio na Alfândega</p>
                        <p className="text-3xl font-bold text-foreground my-2">{formatDuration(logisticsData.avgCustomsTime)}</p>
                    </div>
                    <div className="bg-card p-5 rounded-xl border border-border flex flex-col items-center justify-center text-center">
                        <p className="text-sm font-medium text-muted-foreground">Tempo Médio de Entrega Final</p>
                        <p className="text-3xl font-bold text-foreground my-2">{formatDuration(logisticsData.avgFinalDeliveryTime)}</p>
                    </div>
                </div>

                <DailyLogisticsTracking dailyData={dailyData} />
            </div>

            <ShipmentDetailsModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                title={modalState.title}
                shipments={modalState.shipments}
                logisticsData={logisticsData}
            />
        </>
    );
};

export default LogisticsDashboard;