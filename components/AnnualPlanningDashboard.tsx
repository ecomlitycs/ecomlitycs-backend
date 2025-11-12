import React, { useState, useMemo, useEffect } from 'react';
import { AnnualPlan, OpexCategory, AnnualPlanActuals, AnnualPlanScenario } from '../types';
import { formatCurrency, formatPercentage, formatDecimal, formatNumber } from '../utils/formatting';
import { WalletIcon, DownloadIcon, CheckCircleIcon, TrendingUpIcon, InfoIcon, ClipboardListIcon, PieChartIcon, AlertTriangleIcon, TrendingDownIcon, CopyIcon, PencilIcon, LockIcon } from './icons';

interface AnnualPlanningDashboardProps {
    plan: AnnualPlan;
    onPlanChange: (newPlan: AnnualPlan) => void;
    previousYearOpex: Record<OpexCategory, number>;
    actuals: AnnualPlanActuals;
    monthlyRevenues: number[];
}

const CATEGORY_NAMES: Record<OpexCategory, string> = {
    aluguel: 'Aluguel',
    internet: 'Internet',
    aplicativos: 'Aplicativos / SaaS',
    funcionarios: 'Funcionários',
    outros: 'Outros Custos Fixos'
};
const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`bg-card p-5 rounded-xl border border-border hover-zoom ${className}`}>
        {children}
    </div>
);

const AnnualPlanningDashboard: React.FC<AnnualPlanningDashboardProps> = ({ plan, onPlanChange, previousYearOpex, actuals, monthlyRevenues }) => {
    
    const [editingCell, setEditingCell] = useState<{ category: OpexCategory, month: number } | null>(null);
    const [tempValue, setTempValue] = useState('');
    // FIX: Correctly type activeScenario and initialize from plan prop
    const [activeScenario, setActiveScenario] = useState<AnnualPlanScenario>(plan.activeScenario);

    // FIX: Add effect to update local state if prop changes
    useEffect(() => {
        setActiveScenario(plan.activeScenario);
    }, [plan.activeScenario]);
    
    // FIX: Access the correct nested opex object based on the active scenario
    const currentScenarioData = plan.scenarios[activeScenario];
    const currentOpex = currentScenarioData?.opex;

    const calculatedMonthlyValues = useMemo(() => {
        // FIX: Handle cases where currentOpex might not be defined
        if (!currentOpex) return {} as Record<OpexCategory, number[]>;

        const result: Record<OpexCategory, number[]> = {} as any;
        for (const cat in currentOpex) {
            const category = cat as OpexCategory;
            const categoryDetail = currentOpex[category];
            // FIX: Calculate annual value from sum of subItems, as 'annual' property does not exist.
            const annualValue = categoryDetail.subItems.reduce((sum, item) => sum + item.value, 0);

            result[category] = Array(12).fill(0).map((_, monthIndex) => {
                const weights = categoryDetail.seasonalWeights;
                const monthlyWeight = weights?.[monthIndex] ?? 1/12;
                return categoryDetail.monthlyOverrides[monthIndex] ?? annualValue * monthlyWeight;
            });
        }
        return result;
    }, [currentOpex]);
    
    const totalOpexAnnual = useMemo(() => {
        if (!currentOpex) return 0;
        return (Object.keys(currentOpex) as OpexCategory[]).reduce((total, cat) => {
             const monthlySum = (calculatedMonthlyValues[cat] || []).reduce((sum, val) => sum + (val || 0), 0);
             return total + monthlySum;
        }, 0);
    }, [calculatedMonthlyValues, currentOpex]);

    const previousYearTotal = (Object.values(previousYearOpex) as number[]).reduce((sum, val) => sum + val, 0);

    const handleMonthlyOverride = (category: OpexCategory, monthIndex: number, value: number) => {
        // FIX: Update plan immutably by targeting the correct nested structure.
        if (!currentOpex) return;
        const newOverrides = [...currentOpex[category].monthlyOverrides];
        newOverrides[monthIndex] = value;
        const newPlan: AnnualPlan = {
           ...plan,
           scenarios: {
               ...plan.scenarios,
               [activeScenario]: {
                   ...plan.scenarios[activeScenario],
                   opex: {
                       ...currentOpex,
                       [category]: {
                           ...currentOpex[category],
                           monthlyOverrides: newOverrides,
                       }
                   }
               }
           }
        };
        onPlanChange(newPlan);
        setEditingCell(null);
   }
    
    const handleWeightChange = (category: OpexCategory, monthIndex: number, value: number) => {
        // FIX: Update plan immutably by targeting the correct nested structure.
        if (!currentOpex) return;
        const newWeights = [...currentOpex[category].seasonalWeights];
        newWeights[monthIndex] = value / 100;
        
        const newPlan: AnnualPlan = {
            ...plan,
            scenarios: {
                ...plan.scenarios,
                [activeScenario]: {
                    ...plan.scenarios[activeScenario],
                    opex: {
                        ...currentOpex,
                        [category]: {
                            ...currentOpex[category],
                            seasonalWeights: newWeights,
                        }
                    }
                }
            }
        };
        onPlanChange(newPlan);
    }

    // FIX: Access assumptions from the current scenario
    const currentAssumptions = plan.scenarios[activeScenario].assumptions;
    const opexToRevenue = currentAssumptions.projectedRevenue > 0 ? (totalOpexAnnual / currentAssumptions.projectedRevenue) * 100 : 0;
    
    const topCategory = useMemo(() => {
        if (!currentOpex) return null;
        let max = 0;
        let topCat: OpexCategory | null = null;
        for (const cat in calculatedMonthlyValues) {
            const category = cat as OpexCategory;
            const sum = calculatedMonthlyValues[category].reduce((s, v) => s + v, 0);
            if (sum > max) {
                max = sum;
                topCat = category;
            }
        }
        return topCat ? { name: CATEGORY_NAMES[topCat], value: max, percent: (max / totalOpexAnnual) * 100 } : null;
    }, [calculatedMonthlyValues, totalOpexAnnual, currentOpex]);


    return (
        <div className="animate-fade-in space-y-8">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Planejamento Anual (OPEX)</h1>
                <p className="text-base text-muted-foreground mt-1">Orce suas despesas operacionais, crie cenários e compare com o ano anterior.</p>
            </header>

            {/* Controls */}
            <div className="bg-card/50 dark:bg-slate-800/50 p-4 rounded-xl border border-border flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-muted-foreground">Cenário:</span>
                    {(['Base', 'Corte de Gastos', 'Aposta de Crescimento'] as AnnualPlanScenario[]).map(sc => (
                        <button key={sc} onClick={() => setActiveScenario(sc)} className={`px-3 py-1 text-sm font-semibold rounded-lg ${activeScenario === sc ? 'bg-primary text-primary-foreground' : 'bg-card-alt text-foreground hover:bg-border'}`}>
                            {sc}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-card-alt text-foreground hover:bg-border flex items-center gap-2" disabled={plan.status === 'aprovado'}><PencilIcon className="w-4 h-4" /> Salvar</button>
                    <button className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"><CheckCircleIcon className="w-4 h-4" /> Aprovar</button>
                    <button className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-border bg-card-alt text-foreground hover:bg-border flex items-center gap-2"><CopyIcon className="w-4 h-4" /> Duplicar</button>
                </div>
            </div>

            {/* KPIs & Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <Card>
                    <p className="text-sm font-medium text-muted-foreground">OPEX / Receita</p>
                    <p className={`text-3xl font-bold mt-1 ${opexToRevenue > currentAssumptions.opexToRevenueTarget ? 'text-accent-red' : 'text-accent-green'}`}>{formatPercentage(opexToRevenue)}</p>
                    <p className="text-xs text-muted-foreground">Meta: {formatPercentage(currentAssumptions.opexToRevenueTarget)}</p>
                </Card>
                 <Card>
                    <p className="text-sm font-medium text-muted-foreground">OPEX por Pedido</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{formatCurrency(totalOpexAnnual / currentAssumptions.projectedOrders)}</p>
                     <p className="text-xs text-muted-foreground">{formatNumber(currentAssumptions.projectedOrders)} pedidos orçados</p>
                </Card>
                 <Card>
                    <p className="text-sm font-medium text-muted-foreground">Δ vs. Ano Anterior</p>
                    <p className={`text-3xl font-bold mt-1 ${totalOpexAnnual > previousYearTotal ? 'text-accent-red' : 'text-accent-green'}`}>
                        {formatCurrency(totalOpexAnnual - previousYearTotal)}
                    </p>
                    <p className="text-xs text-muted-foreground">Total anterior: {formatCurrency(previousYearTotal)}</p>
                </Card>
                 <Card>
                    <p className="text-sm font-medium text-muted-foreground">Top Categoria</p>
                    {topCategory && <>
                        <p className="text-3xl font-bold text-foreground mt-1 truncate" title={topCategory.name}>{topCategory.name}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(topCategory.value)} ({formatPercentage(topCategory.percent)})</p>
                    </>}
                </Card>
            </div>

            {/* Main Grid */}
            <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">Grade de Orçamento ({plan.year})</h3>
                <div className="overflow-x-auto">
                    {currentOpex && <table className="w-full min-w-[1200px] text-sm">
                        {/* Table Head */}
                        <thead>
                            <tr className="border-b-2 border-border">
                                <th className="p-3 text-left font-semibold text-muted-foreground uppercase">Categoria</th>
                                <th className="p-3 text-right font-semibold text-muted-foreground uppercase w-32">Orçado</th>
                                <th className="p-3 text-right font-semibold text-muted-foreground uppercase w-32">Realizado</th>
                                <th className="p-3 text-right font-semibold text-muted-foreground uppercase w-32">Delta</th>
                                {MONTH_NAMES.map(m => <th key={m} className="p-3 text-right font-semibold text-muted-foreground uppercase w-28">{m}</th>)}
                                <th className="p-3 text-left font-semibold text-muted-foreground uppercase w-32">Responsável</th>
                            </tr>
                        </thead>
                        {/* Table Body */}
                        <tbody>
                            {(Object.keys(currentOpex) as OpexCategory[]).map(cat => {
                                const totalBudget = (calculatedMonthlyValues[cat] || []).reduce((s,v)=>s+v, 0);
                                const totalActual = actuals.monthly[cat]?.reduce((s,v)=>s+v, 0) || 0;
                                const delta = totalBudget - totalActual;
                                return (
                                <tr key={cat} className="border-b border-border last:border-b-0 hover:bg-card-alt/50">
                                    <td className="p-3 font-semibold text-foreground">{CATEGORY_NAMES[cat]}</td>
                                    <td className="p-1 text-right font-bold text-primary tabular-nums">{formatCurrency(totalBudget)}</td>
                                    <td className="p-1 text-right font-medium text-muted-foreground tabular-nums">{formatCurrency(totalActual)}</td>
                                    <td className={`p-1 text-right font-medium tabular-nums ${delta >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>{formatCurrency(delta)}</td>

                                    {(calculatedMonthlyValues[cat] || []).map((val, i) => (
                                        <td key={i} className="p-1 text-right" onClick={() => { if(plan.status !== 'aprovado') { setEditingCell({category: cat, month: i}); setTempValue(val > 0 ? String(val).replace('.',',') : '')}}}>
                                                {editingCell?.category === cat && editingCell?.month === i ? (
                                                <input 
                                                    type="text" 
                                                    value={tempValue}
                                                    onChange={e => setTempValue(e.target.value.replace(/[^0-9,]/g, ''))}
                                                    onBlur={() => handleMonthlyOverride(cat, i, parseFloat(tempValue.replace(',','.')) || 0)}
                                                    onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                                    autoFocus
                                                    className="w-full bg-background border border-primary ring-2 ring-primary text-right font-semibold p-2 rounded-md outline-none"
                                                />
                                                ) : (
                                                <div className={`w-full text-right p-2 rounded-md ${plan.status !== 'aprovado' ? 'hover:bg-primary-soft cursor-pointer' : ''} tabular-nums`}>
                                                    {formatCurrency(val)}
                                                </div>
                                                )}
                                        </td>
                                    ))}
                                    {/* FIX: Access owner from the correct nested object */}
                                    <td className="p-3 text-muted-foreground">{currentOpex[cat].owner || '-'}</td>
                                </tr>
                            )})}
                        </tbody>
                    </table>}
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                     <Card>
                         <h3 className="text-lg font-bold text-foreground p-6 border-b border-border">Δ OPEX vs. Ano Anterior</h3>
                         <div className="p-6 h-80">
                             <div className="text-sm text-muted-foreground text-center flex items-center justify-center h-full bg-background rounded-lg border-2 border-dashed">
                                 Gráfico de Cascata (Waterfall) aqui.
                             </div>
                         </div>
                     </Card>
                </div>
                <div className="lg:col-span-2 space-y-8">
                     <Card>
                         <h3 className="text-lg font-bold text-foreground p-6 border-b border-border">Orçado vs. Realizado (Mensal)</h3>
                         <div className="p-6 h-80">
                              <div className="text-sm text-muted-foreground text-center flex items-center justify-center h-full bg-background rounded-lg border-2 border-dashed">
                                 Gráfico de Barras aqui.
                             </div>
                         </div>
                     </Card>
                </div>
                <div className="lg:col-span-2">
                     <Card>
                         <h3 className="text-lg font-bold text-foreground p-6 border-b border-border">Composição do OPEX</h3>
                          <div className="p-6 h-80">
                              <div className="text-sm text-muted-foreground text-center flex items-center justify-center h-full bg-background rounded-lg border-2 border-dashed">
                                 Gráfico de Pizza aqui.
                             </div>
                         </div>
                     </Card>
                </div>
                 <div className="lg:col-span-3">
                      <Card>
                        <h3 className="text-lg font-bold text-foreground p-6 border-b border-border">Pesos Sazonais por Categoria</h3>
                        <div className="p-6">
                            <p className="text-sm text-muted-foreground">Ajuste a distribuição do orçamento anual para cada categoria. A soma deve ser 100%.</p>
                             <div className="text-center mt-8 py-8 text-muted-foreground text-sm bg-background rounded-lg border-2 border-dashed">
                                <ClipboardListIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                Modal para edição granular de pesos sazonais aqui.
                            </div>
                        </div>
                    </Card>
                 </div>
            </div>
        </div>
    );
};

export default AnnualPlanningDashboard;
