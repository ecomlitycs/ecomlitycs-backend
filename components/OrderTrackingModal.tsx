import React, { useMemo } from 'react';
import { ShipmentDetail, LogisticsOverviewData } from '../types';
import { CloseIcon, CheckIcon, CircleDotIcon, AlertTriangleIcon, ArrowUpIcon, ArrowDownIcon } from './icons';
import { formatDuration } from '../utils/formatting';

interface OrderTrackingModalProps {
    isOpen: boolean;
    onClose: () => void;
    shipment: ShipmentDetail;
    logisticsData: LogisticsOverviewData;
}

const MSEC_IN_DAY = 1000 * 60 * 60 * 24;

const PerformanceKpi: React.FC<{ label: string; value: number | null; average: number | null }> = ({ label, value, average }) => {
    const hasValue = value !== null && isFinite(value);
    const hasAverage = average !== null && isFinite(average) && average > 0;
    
    let comparisonText = '-';
    let colorClass = 'text-muted-foreground';
    let Icon = null;

    if (hasValue && hasAverage) {
        const diff = value! - average!;
        const diffPercentage = (diff / average!) * 100;
        
        if (Math.abs(diffPercentage) < 5) {
            comparisonText = 'Na média';
            colorClass = 'text-muted-foreground';
        } else {
            const comparisonWord = diff > 0 ? 'mais lento' : 'mais rápido';
            comparisonText = `${Math.abs(Math.round(diffPercentage))}% ${comparisonWord}`;
            if (diff > 0) { // Slower is worse for duration
                colorClass = 'text-accent-red';
                Icon = <ArrowUpIcon className="w-3 h-3" />;
            } else {
                colorClass = 'text-accent-green';
                Icon = <ArrowDownIcon className="w-3 h-3" />;
            }
        }
    }

    return (
        <div className="bg-background p-3 rounded-lg text-center">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground my-1">{formatDuration(value)}</p>
            <div className={`flex items-center justify-center space-x-1 text-xs font-semibold ${colorClass}`}>
                {Icon}
                <span>{comparisonText}</span>
            </div>
        </div>
    );
};

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose, shipment, logisticsData }) => {
    const timeline = useMemo(() => {
        const events = [];
        if (shipment.creationDate) events.push({ date: shipment.creationDate, title: 'Pedido Criado', status: 'done' });
        if (shipment.shippingDate) events.push({ date: shipment.shippingDate, title: 'Pedido Enviado', status: 'done' });
        if (shipment.arrivalInBrazilDate) events.push({ date: shipment.arrivalInBrazilDate, title: 'Chegou ao Brasil', status: 'done' });
        if (shipment.customsEntryDate) events.push({ date: shipment.customsEntryDate, title: 'Entrada na Alfândega', status: 'done' });
        if (shipment.customsExitDate) events.push({ date: shipment.customsExitDate, title: 'Liberação da Alfândega', status: 'done' });
        
        if (shipment.deliveryDate) {
            events.push({ date: shipment.deliveryDate, title: 'Entregue', status: 'done' });
        } else {
            if (shipment.status === 'falha') {
                 events.push({ date: new Date().toISOString().split('T')[0], title: 'Falha na Entrega', status: 'fail' });
            } else if (shipment.status !== 'entregue' && shipment.status !== 'devolvido') {
                 events.push({ date: new Date().toISOString().split('T')[0], title: 'Em trânsito', status: 'pending' });
            }
        }
        
        return events.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [shipment]);

    const calculateDays = (start: string | null, end: string | null): number | null => {
        if (!start || !end) return null;
        return (new Date(end).getTime() - new Date(start).getTime()) / MSEC_IN_DAY;
    };
    
    const processingTime = calculateDays(shipment.creationDate, shipment.shippingDate);
    const customsTime = calculateDays(shipment.customsEntryDate, shipment.customsExitDate);
    const finalDeliveryTime = calculateDays(shipment.shippingDate, shipment.deliveryDate);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div
                className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl p-6 flex flex-col animate-fade-in-up"
                onClick={e => e.stopPropagation()}
                style={{maxHeight: '90vh'}}
            >
                <div className="flex items-start justify-between mb-4 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Detalhes do Pedido</h2>
                        <p className="text-sm text-primary font-semibold">{shipment.orderId}</p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-card-alt">
                        <CloseIcon />
                    </button>
                </div>

                <div className="overflow-y-auto">
                    {/* Customer & Product Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-background p-4 rounded-lg">
                            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Cliente</h3>
                            <p className="font-bold text-foreground">{shipment.customer.name}</p>
                            <p className="text-xs text-muted-foreground">{shipment.customer.address}</p>
                        </div>
                        <div className="bg-background p-4 rounded-lg flex items-center space-x-4">
                            <img src={shipment.product.imageUrl} alt={shipment.product.name} className="w-12 h-12 rounded-md object-cover bg-border" />
                            <div>
                                <p className="font-bold text-foreground text-sm">{shipment.product.name}</p>
                                <p className="text-xs text-muted-foreground">Quantidade: {shipment.product.quantity}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Timeline */}
                    <div className="mb-6">
                         {timeline.map((event, index) => (
                            <div key={index} className="flex relative">
                                <div className="flex flex-col items-center mr-4">
                                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white z-10 ${event.status === 'fail' ? 'bg-red-500' : 'bg-primary'} bg-card`}>
                                        {event.status === 'done' ? <CheckIcon className="w-4 h-4" /> : event.status === 'fail' ? <AlertTriangleIcon className="w-4 h-4" /> : <CircleDotIcon className="w-4 h-4" />}
                                    </div>
                                    {index < timeline.length - 1 && <div className="w-0.5 grow bg-border"></div>}
                                </div>
                                <div className="pb-8 pt-0.5">
                                    <p className="font-semibold text-foreground">{event.title}</p>
                                    <p className="text-sm text-muted-foreground">{new Date(event.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC'})}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Performance */}
                    <div>
                        <h3 className="text-base font-bold text-foreground mb-3">Performance da Entrega</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <PerformanceKpi label="Tempo de Processamento" value={processingTime} average={logisticsData.avgProcessingTime} />
                            <PerformanceKpi label="Tempo na Alfândega" value={customsTime} average={logisticsData.avgCustomsTime} />
                            <PerformanceKpi label="Tempo de Entrega Final" value={finalDeliveryTime} average={logisticsData.avgFinalDeliveryTime} />
                        </div>
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
        </div>
    );
};