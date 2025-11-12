import React, { useState, useMemo } from 'react';
import { ShopifyProduct, DailyData } from '../types';
import { CloseIcon, DollarSignIcon, PackageIcon } from './icons';
import DateFilter from './DateFilter';
import { formatCurrency, formatNumber, formatDate, getDateRangeForPreset } from '../utils/formatting';

interface ProductDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: ShopifyProduct | null;
    dailyData: DailyData[];
}

const SalesBarChart: React.FC<{ data: { date: string; revenue: number }[] }> = ({ data }) => {
    const [tooltip, setTooltip] = useState<{ visible: boolean; content: string; date: string; x: number; y: number } | null>(null);

    if (!data || data.length === 0 || data.every(d => d.revenue <= 0)) {
        return (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground bg-background rounded-lg border border-border">
                Sem dados de vendas para exibir no gráfico.
            </div>
        );
    }

    const handleMouseMove = (e: React.MouseEvent<SVGRectElement, MouseEvent>, revenue: number, dateStr: string) => {
        setTooltip({
            visible: true,
            content: `${formatCurrency(revenue)}`,
            date: new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }),
            x: e.clientX,
            y: e.clientY,
        });
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    const chartWidth = 500;
    const chartHeight = 150;
    const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
    const barGap = 2;
    const barWidth = (chartWidth / data.length) - barGap;

    return (
        <>
            <div className="w-full h-48 relative bg-background p-4 rounded-lg border border-border">
                <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                    <g>
                        {data.map((d, i) => {
                            const barHeight = Math.max(0, (d.revenue / maxRevenue) * chartHeight);
                            const x = i * (barWidth + barGap);
                            const y = chartHeight - barHeight;

                            return (
                                <rect
                                    key={d.date}
                                    x={x}
                                    y={y}
                                    width={Math.max(0, barWidth)}
                                    height={barHeight}
                                    className="fill-primary hover:fill-primary/80 transition-colors cursor-pointer"
                                    onMouseMove={(e) => handleMouseMove(e, d.revenue, d.date)}
                                    onMouseLeave={handleMouseLeave}
                                />
                            );
                        })}
                    </g>
                </svg>
            </div>
            {tooltip && (
                <div
                    className="fixed bg-card/80 backdrop-blur-sm border border-border text-foreground text-xs rounded-md shadow-lg px-2 py-1 z-[9999] pointer-events-none whitespace-nowrap"
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


const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ isOpen, onClose, product, dailyData }) => {
    const [activeDateFilter, setActiveDateFilter] = useState('last30days');
    const [dateRange, setDateRange] = useState(getDateRangeForPreset('last30days'));

    const handleDateFilterChange = (preset: string, customRange?: { start: Date; end: Date }) => {
        setActiveDateFilter(preset);
        setDateRange(getDateRangeForPreset(preset, customRange));
    };

    const salesData = useMemo(() => {
        if (!product) return { summary: { totalRevenue: 0, totalOrders: 0 }, daily: [] };

        const startStr = formatDate(dateRange.start);
        const endStr = formatDate(dateRange.end);

        const dailySales: { date: string; revenue: number; orders: number }[] = [];
        let totalRevenue = 0;
        let totalOrders = 0;

        dailyData.forEach(day => {
            if (day.date >= startStr && day.date <= endStr) {
                const productSale = day.products.find(p => p.name === product.name);
                if (productSale) {
                    dailySales.push({
                        date: day.date,
                        revenue: productSale.revenue,
                        orders: productSale.orders
                    });
                    totalRevenue += productSale.revenue;
                    totalOrders += productSale.orders;
                }
            }
        });
        
        dailySales.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return {
            summary: { totalRevenue, totalOrders },
            daily: dailySales
        };

    }, [product, dailyData, dateRange]);

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-3xl p-6 flex flex-col"
                onClick={e => e.stopPropagation()}
                style={{ maxHeight: '90vh' }}
            >
                <div className="flex items-start justify-between mb-4 flex-shrink-0">
                    <div className="flex items-center space-x-4">
                        <img src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-lg object-cover bg-border" />
                        <div>
                            <h2 className="text-xl font-bold text-foreground">{product.name}</h2>
                            <p className="text-muted-foreground">Detalhes de Vendas</p>
                        </div>
                    </div>
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="bg-background p-4 rounded-lg flex items-center space-x-3">
                         <div className="w-9 h-9 rounded-full flex items-center justify-center bg-primary-soft text-primary"><DollarSignIcon className="w-5 h-5"/></div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Faturamento no Período</p>
                            <p className="text-2xl font-bold text-foreground">{formatCurrency(salesData.summary.totalRevenue)}</p>
                        </div>
                    </div>
                     <div className="bg-background p-4 rounded-lg flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-primary-soft text-primary"><PackageIcon className="w-5 h-5"/></div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Pedidos no Período</p>
                            <p className="text-2xl font-bold text-foreground">{formatNumber(salesData.summary.totalOrders)}</p>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="text-base font-semibold text-foreground mb-2">Faturamento Diário</h3>
                    <SalesBarChart data={salesData.daily.slice().reverse()} />
                </div>
                
                <div className="overflow-y-auto max-h-64">
                    {salesData.daily.length > 0 ? (
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-card-alt z-10">
                                <tr className="border-b border-border">
                                    <th className="py-2 px-3 text-left text-xs font-semibold uppercase text-muted-foreground">Data</th>
                                    <th className="py-2 px-3 text-right text-xs font-semibold uppercase text-muted-foreground">Pedidos</th>
                                    <th className="py-2 px-3 text-right text-xs font-semibold uppercase text-muted-foreground">Faturamento</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {salesData.daily.map(day => (
                                    <tr key={day.date}>
                                        <td className="py-2 px-3 font-medium text-foreground">{new Date(day.date + 'T00:00:00').toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'long' })}</td>
                                        <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">{formatNumber(day.orders)}</td>
                                        <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">{formatCurrency(day.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                         <div className="text-center py-16">
                            <p className="text-muted-foreground">Nenhuma venda encontrada para este produto no período selecionado.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsModal;