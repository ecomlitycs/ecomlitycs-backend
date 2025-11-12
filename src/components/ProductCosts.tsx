import React, { useState, useEffect } from 'react';
import { ShopifyProduct } from '../types';
import { formatCurrency, formatDecimal, formatPercentage } from '../utils/formatting';
import { AlertTriangleIcon, ShopifyLogo, SpinnerIcon } from './icons';

interface ProductCostsProps {
    products: ShopifyProduct[];
    onCostChange: (productId: string, cost: number) => void;
    onViewDetails: (product: ShopifyProduct) => void;
    showToast: (message: string, type: 'success' | 'error') => void;
}

const ProductCosts: React.FC<ProductCostsProps> = ({ products, onCostChange, onViewDetails, showToast }) => {
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [tempCost, setTempCost] = useState<string>('');
    const [syncingProductId, setSyncingProductId] = useState<string | null>(null);
    const [isFullSyncing, setIsFullSyncing] = useState<boolean>(false);

    const productsWithoutCost = products.filter(p => p.cost === null || p.cost <= 0);

    const sortedProducts = [...products].sort((a, b) => {
        const aHasCost = a.cost !== null && a.cost > 0;
        const bHasCost = b.cost !== null && b.cost > 0;
        if (aHasCost === bHasCost) return 0;
        return aHasCost ? 1 : -1;
    });

    const getMarkupColor = (markup: number | null) => {
        if (markup === null || !isFinite(markup)) return 'text-muted-foreground dark:text-dark-muted-foreground';
        if (markup < 2.5) return 'text-accent-red dark:text-dark-accent-red';
        if (markup < 3.5) return 'text-accent-orange dark:text-dark-accent-orange';
        return 'text-accent-green dark:text-dark-accent-green';
    };

    const handleEditClick = (product: ShopifyProduct) => {
        setEditingProductId(product.id);
        setTempCost(product.cost !== null ? String(product.cost).replace('.', ',') : '');
    };

    const handleCancelClick = () => {
        setEditingProductId(null);
        setTempCost('');
    };

    const handleSaveClick = (productId: string) => {
        const parsedValue = parseFloat(tempCost.replace(',', '.'));
        const finalCost = isNaN(parsedValue) ? 0 : parsedValue;
        
        setSyncingProductId(productId);
        
        setTimeout(() => {
            onCostChange(productId, finalCost);
            showToast('Custo sincronizado com a Shopify!', 'success');
            setEditingProductId(null);
            setSyncingProductId(null);
        }, 1500);
    };
    
    const handleCostInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let currentVal = e.target.value;
        currentVal = currentVal.replace(/[^0-9,]/g, '');
        const parts = currentVal.split(',');
        if (parts.length > 2) {
            currentVal = parts[0] + ',' + parts.slice(1).join('');
        }
        setTempCost(currentVal);
    };
    
    const handleFullSync = () => {
        setIsFullSyncing(true);
        showToast('Sincronizando produtos com a Shopify...', 'success');
        setTimeout(() => {
            setIsFullSyncing(false);
            showToast('Produtos sincronizados com sucesso!', 'success');
        }, 2500);
    };

    return (
        <div className="bg-card dark:bg-dark-card p-6 rounded-xl border border-border dark:border-dark-border hover-zoom">
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4 border-b border-border dark:border-dark-border pb-6">
                <div>
                    <h3 className="text-lg font-bold text-foreground dark:text-dark-foreground">Gestão de Custos de Produtos</h3>
                    <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground mt-1">As alterações salvas são sincronizadas automaticamente com sua loja Shopify.</p>
                </div>
                <button
                    onClick={handleFullSync}
                    disabled={isFullSyncing || syncingProductId !== null}
                    className="flex items-center justify-center space-x-2 bg-white dark:bg-dark-card text-primary dark:text-dark-primary-soft-fg border-2 border-primary dark:border-dark-primary font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10 dark:hover:bg-dark-primary-soft/80"
                >
                    {isFullSyncing ? <SpinnerIcon className="w-5 h-5" /> : <ShopifyLogo className="w-5 h-5" />}
                    <span>{isFullSyncing ? 'Sincronizando...' : 'Sincronizar com Shopify'}</span>
                </button>
            </div>

            {productsWithoutCost.length > 0 && (
                <div className="bg-accent-orange/10 dark:bg-dark-accent-orange/20 border-l-4 border-accent-orange dark:border-dark-accent-orange text-accent-orange dark:text-dark-accent-orange p-4 rounded-r-lg mb-6 flex items-start space-x-3">
                    <AlertTriangleIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold">Atenção!</h4>
                        <p className="text-sm">
                            {productsWithoutCost.length} produto(s) estão sem custo cadastrado.
                            Isso pode afetar a precisão dos seus relatórios de lucro.
                        </p>
                    </div>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead>
                        <tr className="border-b-2 border-border dark:border-dark-border">
                            <th className="p-3 text-left text-xs font-semibold uppercase text-muted-foreground dark:text-dark-muted-foreground tracking-wider">Produto</th>
                            <th className="p-3 text-right text-xs font-semibold uppercase text-muted-foreground dark:text-dark-muted-foreground tracking-wider">Custo de Produto</th>
                            <th className="p-3 text-right text-xs font-semibold uppercase text-muted-foreground dark:text-dark-muted-foreground tracking-wider">Preço de Venda</th>
                            <th className="p-3 text-right text-xs font-semibold uppercase text-muted-foreground dark:text-dark-muted-foreground tracking-wider">% C. PRODUTO</th>
                            <th className="p-3 text-right text-xs font-semibold uppercase text-muted-foreground dark:text-dark-muted-foreground tracking-wider">Markup</th>
                            <th className="p-3 text-center text-xs font-semibold uppercase text-muted-foreground dark:text-dark-muted-foreground tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedProducts.map(product => {
                            const hasCost = product.cost !== null && product.cost > 0;
                            const markup = hasCost ? product.salePrice / product.cost! : null;
                            const costPercentage = (hasCost && product.salePrice > 0) ? (product.cost! / product.salePrice) * 100 : null;
                            const isEditing = editingProductId === product.id;
                            const isSyncing = syncingProductId === product.id;

                            return (
                                <tr key={product.id} className={`border-b border-border dark:border-dark-border last:border-b-0 ${!hasCost && !isEditing ? 'bg-accent-red/5 dark:bg-dark-accent-red/10' : ''}`}>
                                    <td className="p-3">
                                        <div className="flex items-center space-x-4">
                                            <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-md object-cover bg-border dark:bg-dark-border" />
                                            <div>
                                                <p className="font-semibold text-foreground dark:text-dark-foreground text-sm">{product.name}</p>
                                                {!hasCost && !isEditing && <p className="text-xs text-accent-red dark:text-dark-accent-red font-medium">Custo pendente</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 text-right w-48">
                                        {isEditing ? (
                                            <div className="relative">
                                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-muted-foreground dark:text-dark-muted-foreground text-sm">R$</span>
                                                <input
                                                    type="text"
                                                    value={tempCost}
                                                    onChange={handleCostInputChange}
                                                    className="w-full rounded-md border-primary bg-card dark:bg-dark-card shadow-sm pl-8 pr-2 py-1 text-right font-semibold text-foreground dark:text-dark-foreground ring-2 ring-primary outline-none text-sm"
                                                    placeholder="0,00"
                                                    autoFocus
                                                    disabled={isSyncing}
                                                />
                                            </div>
                                        ) : (
                                            <span className="font-medium text-muted-foreground dark:text-dark-muted-foreground tabular-nums">
                                                {hasCost ? formatCurrency(product.cost!) : '-'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 text-right font-medium text-muted-foreground dark:text-dark-muted-foreground tabular-nums">
                                        {formatCurrency(product.salePrice)}
                                    </td>
                                    <td className="p-3 text-right font-medium text-muted-foreground dark:text-dark-muted-foreground tabular-nums">
                                        {costPercentage !== null ? formatPercentage(costPercentage, 1) : '-'}
                                    </td>
                                    <td className={`p-3 text-right font-bold tabular-nums text-lg ${getMarkupColor(markup)}`}>
                                        {markup ? `${formatDecimal(markup)}x` : '-'}
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            {isEditing ? (
                                                <>
                                                    <button 
                                                        onClick={() => handleSaveClick(product.id)}
                                                        className="px-3 py-1 text-sm font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 flex items-center space-x-2 min-w-[120px] justify-center transition-colors disabled:opacity-70"
                                                        disabled={isSyncing}
                                                    >
                                                        {isSyncing && <SpinnerIcon className="w-4 h-4" />}
                                                        <span>{isSyncing ? 'Sincronizando...' : 'Salvar'}</span>
                                                    </button>
                                                    <button onClick={handleCancelClick} className="px-3 py-1 text-sm font-semibold rounded-md bg-card-alt dark:bg-dark-card-alt hover:bg-border dark:hover:bg-dark-border disabled:opacity-70" disabled={isSyncing}>
                                                        Cancelar
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleEditClick(product)} className="px-3 py-1 text-sm font-semibold rounded-md bg-card-alt dark:bg-dark-card-alt hover:bg-border dark:hover:bg-dark-border">Editar</button>
                                                    <button onClick={() => onViewDetails(product)} className="px-3 py-1 text-sm font-semibold rounded-md text-primary dark:text-dark-primary hover:bg-primary-soft dark:hover:bg-dark-primary-soft">Detalhes</button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductCosts;