import React, { useState } from 'react';
import { ShipmentDetail, ShipmentStatus, LogisticsOverviewData } from '../types';
import { CloseIcon } from './icons';
import { formatCurrency } from '../utils/formatting';
import { OrderTrackingModal } from './OrderTrackingModal';

interface ShipmentDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    shipments: ShipmentDetail[];
    logisticsData: LogisticsOverviewData;
}

const statusDisplay: Record<ShipmentStatus, { text: string; dotClass: string; }> = {
    entregue: { text: 'Entregue', dotClass: 'bg-primary' },
    em_transito: { text: 'Em Trânsito', dotClass: 'bg-blue-500' },
    devolvido: { text: 'Devolvido', dotClass: 'bg-gray-500' },
    taxado: { text: 'Taxado', dotClass: 'bg-yellow-500' },
    pendente: { text: 'Pendente', dotClass: 'bg-blue-400' },
    falha: { text: 'Falha', dotClass: 'bg-red-500' },
    atrasado: { text: 'Atrasado', dotClass: 'bg-orange-500' },
    sem_atualizacao: { text: 'Sem Atualização', dotClass: 'bg-gray-400' },
    aguardando_retirada: { text: 'Aguardando Retirada', dotClass: 'bg-indigo-500' },
    sem_rastreio: { text: 'Sem Rastreio', dotClass: 'bg-purple-500' },
};

const StatusIndicator: React.FC<{ status: ShipmentStatus }> = ({ status }) => {
    const display = statusDisplay[status] || { text: status, dotClass: 'bg-gray-400' };
    return (
        <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${display.dotClass}`}></div>
            {/* FIX: Completed the span tag which was truncated. */}
            <span className="text-sm font-medium">{display.text}</span>
        </div>
    );
};

const ShipmentDetailsModal: React.FC<ShipmentDetailsModalProps> = ({ isOpen, onClose, title, shipments, logisticsData }) => {
    const [selectedShipment, setSelectedShipment] = useState<ShipmentDetail | null>(null);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
                <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-4xl p-6 flex flex-col" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh' }}>
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <h2 className="text-xl font-bold text-foreground">{title}</h2>
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-card-alt">
                            <CloseIcon />
                        </button>
                    </div>

                    <div className="overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-card-alt z-10">
                                <tr className="border-b border-border">
                                    <th className="py-2 px-3 text-left font-semibold text-muted-foreground">Produto</th>
                                    <th className="py-2 px-3 text-left font-semibold text-muted-foreground">Pedido</th>
                                    <th className="py-2 px-3 text-left font-semibold text-muted-foreground">Status</th>
                                    <th className="py-2 px-3 text-left font-semibold text-muted-foreground">Cliente</th>
                                    <th className="py-2 px-3 text-right font-semibold text-muted-foreground">Custo Frete</th>
                                    <th className="py-2 px-3 text-center font-semibold text-muted-foreground">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {shipments.map(shipment => (
                                    <tr key={shipment.orderId}>
                                        <td className="py-2 px-3">
                                            <div className="flex items-center space-x-3">
                                                <img src={shipment.product.imageUrl} alt={shipment.product.name} className="w-10 h-10 rounded-md object-cover" />
                                                <div>
                                                    <p className="font-semibold text-foreground">{shipment.product.name}</p>
                                                    <p className="text-xs text-muted-foreground">Qtd: {shipment.product.quantity}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-2 px-3 font-mono text-xs text-primary">{shipment.orderId}</td>
                                        <td className="py-2 px-3"><StatusIndicator status={shipment.status} /></td>
                                        <td className="py-2 px-3">
                                            <p className="font-medium text-foreground">{shipment.customer.name}</p>
                                            <p className="text-xs text-muted-foreground">{shipment.customer.address}</p>
                                        </td>
                                        <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">{formatCurrency(shipment.cost)}</td>
                                        <td className="py-2 px-3 text-center">
                                            <button onClick={() => setSelectedShipment(shipment)} className="text-primary font-semibold hover:underline">
                                                Rastrear
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedShipment && (
                <OrderTrackingModal
                    isOpen={!!selectedShipment}
                    onClose={() => setSelectedShipment(null)}
                    shipment={selectedShipment}
                    logisticsData={logisticsData}
                />
            )}
        </>
    );
};

export default ShipmentDetailsModal;