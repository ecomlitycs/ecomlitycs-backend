import React, { useState, useMemo } from 'react';
import { PricingInputs, PricingResults, MarkupScenario, ShopifyProduct, DailyData } from '../types';
import { formatCurrency, formatPercentage, formatDecimal } from '../utils/formatting';
import FormattedValue from './FormattedValue';
import { DollarSignIcon, PiggyBankIcon, PercentageIcon, TargetIcon, CheckIcon } from './icons';
import ProductCosts from './ProductCosts';

// --- Props Interface ---
interface PricingCalculatorProps {
    inputs: PricingInputs;
    results: PricingResults;
    handleInputChange: (name: keyof PricingInputs, value: number | string) => void;
    shopifyProducts: ShopifyProduct[];
    onProductCostChange: (productId: string, cost: number) => void;
    onViewProductDetails: (product: ShopifyProduct) => void;
    dailyData: DailyData[];
    showToast: (message: string, type: 'success' | 'error') => void;
}

// --- Re-usable UI Components ---
const PanelCard: React.FC<{ title: string, children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={`bg-card dark:bg-dark-card p-6 rounded-xl border border-border dark:border-dark-border hover-zoom ${className}`}>
        <h3 className="text-lg font-bold text-foreground dark:text-dark-foreground mb-4">{title}</h3>
        {children}
    </div>
);

const NumericInput: React.FC<{
    label: string;
    name: keyof PricingInputs;
    value: number;
    onChange: (name: keyof PricingInputs, value: number) => void;
    isMainInput?: boolean;
}> = ({ label, name, value, onChange, isMainInput = false }) => {
    const [inputValue, setInputValue] = useState(String(value).replace('.', ','));
    const [isFocused, setIsFocused] = useState(false);

    React.useEffect(() => {
        if (!isFocused) {
            setInputValue(String(value).replace('.', ','));
        }
    }, [value, isFocused]);

    const handleFocus = () => {
        setIsFocused(true);
        setInputValue(value === 0 ? '' : String(value).replace('.', ','));
    };

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
        const parsedValue = parseFloat(inputValue.replace(',', '.'));
        const finalValue = isNaN(parsedValue) ? 0 : parsedValue;
        onChange(name, finalValue);
    };

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-muted-foreground dark:text-dark-muted-foreground mb-1.5">{label}</label>
            <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground dark:text-dark-muted-foreground">R$</span>
                <input
                    type="text"
                    id={name}
                    name={name}
                    value={inputValue}
                    onFocus={handleFocus}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full rounded-lg border border-border dark:border-dark-border bg-background dark:bg-dark-background px-3 py-2 text-right font-semibold text-foreground dark:text-dark-foreground transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary pl-10 ${isMainInput ? 'text-lg' : 'text-base'}`}
                    placeholder="0,00"
                />
            </div>
        </div>
    );
};

const FeeInput: React.FC<{
    label: string;
    name: keyof PricingInputs;
    value: number;
    onChange: (name: keyof PricingInputs, value: number) => void;
    calculatedValue: number;
}> = ({ label, name, value, onChange, calculatedValue }) => {
    return (
        <div className="flex items-center justify-between py-2 border-b border-border dark:border-dark-border last:border-b-0">
            <span className="text-muted-foreground dark:text-dark-muted-foreground text-sm">{label}</span>
            <div className="flex items-center space-x-3 w-3/5">
                <div className="relative w-1/2">
                    <input
                        type="number"
                        id={name}
                        name={name}
                        value={value}
                        onChange={(e) => onChange(name, parseFloat(e.target.value) || 0)}
                        className="w-full rounded-md border-border dark:border-dark-border bg-background dark:bg-dark-background shadow-sm pr-7 pl-2 py-1 text-right font-semibold text-foreground dark:text-dark-foreground transition duration-150 ease-in-out focus:bg-card dark:focus:bg-dark-card focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-primary dark:focus:border-dark-primary text-sm"
                        placeholder="0"
                        step="0.01"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-muted-foreground dark:text-dark-muted-foreground text-sm">%</span>
                </div>
                <div className="w-1/2 h-8 flex items-center justify-end px-2 bg-background dark:bg-dark-background rounded-md">
                    <span className="text-foreground dark:text-dark-foreground font-medium text-sm tabular-nums">{formatCurrency(calculatedValue)}</span>
                </div>
            </div>
        </div>
    );
};

const ResultMetric: React.FC<{ icon: React.ReactNode; label: string; value: string; isHighlighted?: boolean }> = ({ icon, label, value, isHighlighted }) => (
    <div className={`flex items-center space-x-3 p-3 rounded-lg border-l-4 ${isHighlighted ? 'bg-primary-soft dark:bg-dark-primary-soft border-primary dark:border-dark-primary' : 'bg-background dark:bg-dark-background border-border dark:border-dark-border'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center p-1.5 ${isHighlighted ? 'bg-primary/20 text-primary dark:text-dark-primary' : 'bg-border dark:bg-dark-border text-muted-foreground dark:text-dark-muted-foreground'}`}>
            <div className="w-5 h-5">{icon}</div>
        </div>
        <div>
            <p className="text-sm font-medium text-muted-foreground dark:text-dark-muted-foreground">{label}</p>
            <FormattedValue
                value={value}
                integerClassName={`font-bold tabular-nums tracking-tight ${isHighlighted ? 'text-primary dark:text-dark-primary text-xl' : 'text-foreground dark:text-dark-foreground text-lg'}`}
                fractionClassName={`font-semibold tabular-nums ${isHighlighted ? 'text-primary/80 dark:text-dark-primary/80' : 'text-muted-foreground dark:text-dark-muted-foreground'}`}
                symbolClassName={`font-semibold ${isHighlighted ? 'text-primary/80 dark:text-dark-primary/80' : 'text-muted-foreground dark:text-dark-muted-foreground'}`}
            />
        </div>
    </div>
);


// --- Main Calculator Component ---
const PricingCalculator: React.FC<PricingCalculatorProps> = ({ inputs, results, handleInputChange, shopifyProducts, onProductCostChange, onViewProductDetails, showToast }) => {
    const [activeTab, setActiveTab] = useState<'calculator' | 'costs'>('calculator');

    const markupTableData = useMemo<MarkupScenario[]>(() => {
        const markupLevels = [1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4];
        const { baseProductCost, marketingFee } = inputs;
        const fixedCostsPercentage = results.fixedCostsPercentage;
        
        if (baseProductCost === 0) return [];
        
        return markupLevels.map(markup => {
            const finalPrice = baseProductCost * markup;
            const fixedCostsValue = finalPrice * (fixedCostsPercentage / 100);
            const marketingCost = finalPrice * (marketingFee / 100);
            const totalCost = baseProductCost + fixedCostsValue + marketingCost;
            const profit = finalPrice - totalCost;
            const profitPercentage = finalPrice > 0 ? (profit / finalPrice) * 100 : 0;
            const maxCpa = profit;

            return { markup, finalPrice, totalCost, marketingCost, maxCpa, profit, profitPercentage };
        });

    }, [inputs.baseProductCost, inputs.marketingFee, results.fixedCostsPercentage]);
    
    const TabButton: React.FC<{ tabId: 'calculator' | 'costs'; title: string; }> = ({ tabId, title }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                activeTab === tabId
                    ? 'border-primary dark:border-dark-primary text-primary dark:text-dark-primary'
                    : 'border-transparent text-muted-foreground dark:text-dark-muted-foreground hover:text-foreground dark:hover:text-dark-foreground'
            }`}
        >
            {title}
        </button>
    );

    const applyRecommendedPrice = () => {
        handleInputChange('sitePrice', results.recommendedPrice);
        showToast(`Preço recomendado de ${formatCurrency(results.recommendedPrice)} aplicado!`, 'success');
    };

    return (
        <>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground tracking-tight">
                    Precificação Inteligente
                </h1>
                <p className="text-base text-muted-foreground dark:text-dark-muted-foreground mt-1">
                    {activeTab === 'calculator'
                     ? 'Simule preços de venda e encontre a margem ideal para maximizar seu lucro.'
                     : 'Gerencie os custos dos seus produtos para garantir a precisão nos cálculos de rentabilidade.'}
                </p>
            </header>
            
            <nav className="flex border-b border-border dark:border-dark-border mb-6">
                <TabButton tabId="calculator" title="Calculadora de Preço" />
                <TabButton tabId="costs" title="Custos de Produto" />
            </nav>
            
            {activeTab === 'calculator' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left Panel - Inputs & Results */}
                    <div className="space-y-6">
                        <PanelCard title="Simulação de Produto">
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={inputs.productName}
                                    onChange={(e) => handleInputChange('productName', e.target.value)}
                                    className="w-full text-lg font-bold bg-background dark:bg-dark-background p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:bg-card dark:focus:bg-dark-card border border-transparent focus:border-primary dark:focus:border-dark-primary text-foreground dark:text-dark-foreground"
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <NumericInput label="Custo do Produto (CMV)" name="baseProductCost" value={inputs.baseProductCost} onChange={handleInputChange} />
                                    <div className="flex items-end space-x-2">
                                        <div className="flex-grow">
                                            <NumericInput label="Preço de Venda (Site)" name="sitePrice" value={inputs.sitePrice} onChange={handleInputChange} isMainInput />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                     <div className="bg-background dark:bg-dark-background p-3 rounded-lg text-center flex flex-col justify-center">
                                        <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground font-medium">Markup Atual</p>
                                        <p className={`text-xl font-bold ${results.currentMarkup < 2.5 ? 'text-accent-red dark:text-dark-accent-red' : (results.currentMarkup >= 3 ? 'text-accent-green dark:text-dark-accent-green' : 'text-accent-orange dark:text-dark-accent-orange')}`}>{formatDecimal(results.currentMarkup)}x</p>
                                    </div>
                                    <button 
                                        onClick={applyRecommendedPrice}
                                        className="bg-primary-soft dark:bg-dark-primary-soft p-3 rounded-lg text-center relative group cursor-pointer hover:bg-primary-soft/80 dark:hover:bg-dark-primary-soft/80 transition-colors flex flex-col items-center justify-center"
                                    >
                                        <p className="text-sm text-primary-soft-fg dark:text-dark-primary-soft-fg font-medium">Aplicar Recomendado (3x)</p>
                                        <p className="text-xl font-bold text-primary dark:text-dark-primary">{formatCurrency(results.recommendedPrice)}</p>
                                    </button>
                                </div>
                            </div>
                        </PanelCard>
                        
                        <PanelCard title="Custos Variáveis de Venda (%)">
                             <div>
                                <FeeInput label="Checkout" name="checkoutFee" value={inputs.checkoutFee} onChange={handleInputChange} calculatedValue={inputs.sitePrice * (inputs.checkoutFee / 100)} />
                                <FeeInput label="Gateway Pagamento" name="gatewayFee" value={inputs.gatewayFee} onChange={handleInputChange} calculatedValue={inputs.sitePrice * (inputs.gatewayFee / 100)} />
                                <FeeInput label="Imposto (Nota Fiscal)" name="taxFee" value={inputs.taxFee} onChange={handleInputChange} calculatedValue={inputs.sitePrice * (inputs.taxFee / 100)} />
                                <FeeInput label="Verba de Marketing" name="marketingFee" value={inputs.marketingFee} onChange={handleInputChange} calculatedValue={results.marketingValue} />
                                <FeeInput label="Outras Taxas (IOF/Erro)" name="errorMarginFee" value={inputs.errorMarginFee + inputs.iofFee + inputs.shopifyFee} onChange={(n, v) => handleInputChange('errorMarginFee', v - inputs.iofFee - inputs.shopifyFee)} calculatedValue={inputs.sitePrice * ((inputs.errorMarginFee + inputs.iofFee + inputs.shopifyFee) / 100)} />
                             </div>
                             <div className="!mt-4 flex justify-between items-center bg-background dark:bg-dark-background p-3 rounded-lg">
                                <span className="font-semibold text-foreground dark:text-dark-foreground">Total Custos Variáveis</span>
                                <span className="font-bold text-lg text-foreground dark:text-dark-foreground">{formatCurrency(results.fixedCostsValue + results.marketingValue)}</span>
                             </div>
                        </PanelCard>

                        <PanelCard title="Resultado da Simulação">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <ResultMetric icon={<PiggyBankIcon />} label="Lucro Líquido por Venda" value={formatCurrency(results.finalProfit)} isHighlighted />
                                <ResultMetric icon={<TargetIcon />} label="CPA Máximo (Breakeven)" value={formatCurrency(results.maxCpa)} />
                                <ResultMetric icon={<PercentageIcon />} label="Margem de Lucro Líquida" value={formatPercentage(results.finalProfitPercentage)} />
                                <ResultMetric icon={<DollarSignIcon />} label="Custo Total por Venda" value={formatCurrency(results.totalOperationalCost)} />
                            </div>
                        </PanelCard>
                    </div>

                    {/* Right Panel - Markup Table */}
                    <div className="bg-card dark:bg-dark-card p-6 rounded-xl border border-border dark:border-dark-border hover-zoom flex flex-col h-full">
                        <h2 className="text-xl font-bold text-foreground dark:text-dark-foreground mb-6">Cenários de Rentabilidade</h2>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-border dark:border-dark-border">
                                        <th className="p-3 text-left text-xs font-semibold uppercase text-muted-foreground dark:text-dark-muted-foreground tracking-wider bg-card-alt dark:bg-dark-card-alt sticky top-0">Markup</th>
                                        <th className="p-3 text-right text-xs font-semibold uppercase text-muted-foreground dark:text-dark-muted-foreground tracking-wider bg-card-alt dark:bg-dark-card-alt sticky top-0">Preço Venda</th>
                                        <th className="p-3 text-right text-xs font-semibold uppercase text-muted-foreground dark:text-dark-muted-foreground tracking-wider bg-card-alt dark:bg-dark-card-alt sticky top-0">CPA Máx.</th>
                                        <th className="p-3 text-right text-xs font-semibold uppercase text-muted-foreground dark:text-dark-muted-foreground tracking-wider bg-card-alt dark:bg-dark-card-alt sticky top-0">Lucro Líquido</th>
                                        <th className="p-3 text-right text-xs font-semibold uppercase text-muted-foreground dark:text-dark-muted-foreground tracking-wider bg-card-alt dark:bg-dark-card-alt sticky top-0">Margem %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {markupTableData.map((row) => {
                                        const isHighlighted = Math.abs(row.finalPrice - inputs.sitePrice) < 1.00; // Tolerance for rounding
                                        return (
                                            <tr key={row.markup} className={`text-right border-b border-border dark:border-dark-border last:border-b-0 transition-colors ${isHighlighted ? 'bg-primary-soft dark:bg-dark-primary-soft' : 'hover:bg-card-alt dark:hover:bg-dark-card-alt'}`}>
                                                <td className={`p-3 text-left font-semibold ${isHighlighted ? 'text-primary-soft-fg dark:text-dark-primary-soft-fg' : 'text-foreground dark:text-dark-foreground'}`}>{formatDecimal(row.markup)}x</td>
                                                <td className={`p-3 font-semibold tabular-nums ${isHighlighted ? 'text-foreground dark:text-dark-foreground' : 'text-foreground dark:text-dark-foreground'}`}>{formatCurrency(row.finalPrice)}</td>
                                                <td className="p-3 tabular-nums text-muted-foreground dark:text-dark-muted-foreground font-medium">{formatCurrency(row.maxCpa)}</td>
                                                <td className={`p-3 font-bold tabular-nums ${row.profit < 0 ? 'text-accent-red dark:text-dark-accent-red' : 'text-accent-green dark:text-dark-accent-green'}`}>{formatCurrency(row.profit)}</td>
                                                <td className={`p-3 font-semibold tabular-nums ${row.profitPercentage < 10 ? 'text-accent-red dark:text-dark-accent-red' : (row.profitPercentage > 20 ? 'text-accent-green dark:text-dark-accent-green' : 'text-accent-orange dark:text-dark-accent-orange')}`}>{formatPercentage(row.profitPercentage)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'costs' && (
                 <ProductCosts
                    products={shopifyProducts}
                    onCostChange={onProductCostChange}
                    onViewDetails={onViewProductDetails}
                    showToast={showToast}
                />
            )}

        </>
    );
};

export default PricingCalculator;