import React, { useState, useEffect } from 'react';
import { AnnualPlan, OpexCategory, AnnualPlanOpexCategoryDetail, OpexSubItem } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatting';
import { CloseIcon, UsersIcon, PlusCircleIcon, Trash2Icon } from './icons';

interface CategoryDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: OpexCategory;
    categoryDetail: AnnualPlanOpexCategoryDetail;
    planStatus: 'rascunho' | 'revisao' | 'aprovado';
    onUpdate: (category: OpexCategory, newDetail: AnnualPlanOpexCategoryDetail) => void;
}

const CATEGORY_NAMES: Record<OpexCategory, string> = {
    aluguel: 'Aluguel',
    internet: 'Internet',
    aplicativos: 'Aplicativos / SaaS',
    funcionarios: 'Funcionários',
    outros: 'Outros Custos Fixos'
};
const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({ isOpen, onClose, category, categoryDetail, planStatus, onUpdate }) => {
    const [detail, setDetail] = useState(categoryDetail);
    const [newSubItemName, setNewSubItemName] = useState('');

    useEffect(() => {
        setDetail(categoryDetail);
    }, [categoryDetail]);

    if (!isOpen) return null;

    const handleSubItemChange = (index: number, field: 'name' | 'value' | 'notes', value: string | number) => {
        const newSubItems = [...detail.subItems];
        (newSubItems[index] as any)[field] = value;
        setDetail({ ...detail, subItems: newSubItems });
    };

    const addSubItem = () => {
        if (!newSubItemName.trim()) return;
        const newSubItem: OpexSubItem = { id: Date.now().toString(), name: newSubItemName, value: 0 };
        setDetail({ ...detail, subItems: [...detail.subItems, newSubItem] });
        setNewSubItemName('');
    };

    const removeSubItem = (index: number) => {
        const newSubItems = detail.subItems.filter((_, i) => i !== index);
        setDetail({ ...detail, subItems: newSubItems });
    };

    const handleWeightChange = (monthIndex: number, value: string) => {
        const newWeights = [...detail.seasonalWeights];
        newWeights[monthIndex] = (parseFloat(value) || 0) / 100;
        setDetail({ ...detail, seasonalWeights: newWeights });
    };

    const totalAnnual = detail.subItems.reduce((sum, item) => sum + item.value, 0);
    const totalWeights = detail.seasonalWeights.reduce((sum, w) => sum + w, 0);

    const isReadOnly = planStatus === 'aprovado';

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-card dark:bg-slate-800 rounded-2xl border border-border dark:border-slate-700 shadow-2xl w-full max-w-4xl p-6 flex flex-col animate-fade-in-up"
                onClick={e => e.stopPropagation()}
                style={{ maxHeight: '90vh' }}
            >
                <div className="flex items-center justify-between mb-6 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-foreground dark:text-slate-100">Detalhes da Categoria: {CATEGORY_NAMES[category]}</h2>
                        <p className="text-sm text-muted-foreground dark:text-slate-400">Adicione sub-itens, ajuste a sazonalidade e defina um responsável.</p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-slate-100 p-1 rounded-full hover:bg-card-alt dark:hover:bg-slate-700">
                        <CloseIcon />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto pr-2">
                    {/* Left: Sub-items & Owner */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-foreground dark:text-slate-100">Detalhamento de Custos</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                            {detail.subItems.map((item, index) => (
                                <div key={item.id} className="flex items-center gap-2 p-2 bg-background dark:bg-slate-700 rounded-lg">
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={e => handleSubItemChange(index, 'name', e.target.value)}
                                        className="flex-grow bg-transparent font-medium p-1 rounded-md focus:outline-none focus:bg-card dark:focus:bg-slate-600 text-foreground dark:text-slate-100"
                                        readOnly={isReadOnly}
                                    />
                                    <div className="relative">
                                         <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-muted-foreground dark:text-slate-400 text-sm">R$</span>
                                        <input
                                            type="number"
                                            value={item.value}
                                            onChange={e => handleSubItemChange(index, 'value', parseFloat(e.target.value) || 0)}
                                            className="w-28 bg-transparent font-semibold p-1 pl-7 text-right rounded-md focus:outline-none focus:bg-card dark:focus:bg-slate-600 text-foreground dark:text-slate-100"
                                            readOnly={isReadOnly}
                                        />
                                    </div>
                                    {!isReadOnly && <button onClick={() => removeSubItem(index)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 p-1"><Trash2Icon className="w-4 h-4" /></button>}
                                </div>
                            ))}
                        </div>
                        {!isReadOnly && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newSubItemName}
                                    onChange={e => setNewSubItemName(e.target.value)}
                                    placeholder="Nome do novo item"
                                    className="flex-grow bg-background dark:bg-slate-700 border border-border dark:border-slate-600 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground dark:text-slate-100"
                                />
                                <button onClick={addSubItem} className="p-2 bg-primary text-primary-foreground rounded-lg"><PlusCircleIcon className="w-5 h-5"/></button>
                            </div>
                        )}
                        <div className="flex justify-between items-center bg-card-alt dark:bg-slate-700 p-3 rounded-lg mt-2">
                            <span className="font-bold text-foreground dark:text-slate-100">Total Anual</span>
                            <span className="font-bold text-lg text-foreground dark:text-slate-100">{formatCurrency(totalAnnual)}</span>
                        </div>

                         <div className="flex items-center gap-2 pt-4">
                             <UsersIcon className="w-5 h-5 text-muted-foreground dark:text-slate-400"/>
                            <h3 className="font-semibold text-foreground dark:text-slate-100">Responsável</h3>
                         </div>
                        <input
                            type="text"
                            value={detail.owner}
                            onChange={e => setDetail({ ...detail, owner: e.target.value })}
                            className="w-full bg-background dark:bg-slate-700 border border-border dark:border-slate-600 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground dark:text-slate-100"
                            placeholder="Ex: Financeiro, TI"
                            readOnly={isReadOnly}
                        />
                    </div>

                    {/* Right: Seasonal Weights */}
                    <div>
                        <h3 className="font-semibold text-foreground dark:text-slate-100">Pesos Sazonais (%)</h3>
                        <p className="text-xs text-muted-foreground dark:text-slate-400 mb-2">Distribua o total anual pelos meses.</p>
                        <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                            {MONTH_NAMES.map((month, index) => (
                                <div key={month} className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-foreground dark:text-slate-300">{month}</label>
                                    <div className="relative w-20">
                                        <input
                                            type="number"
                                            value={parseFloat((detail.seasonalWeights[index] * 100).toFixed(2))}
                                            onChange={e => handleWeightChange(index, e.target.value)}
                                            className="w-full bg-background dark:bg-slate-700 p-1 pr-5 text-right rounded-md border border-border dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary text-foreground dark:text-slate-100"
                                            step="0.01"
                                            readOnly={isReadOnly}
                                        />
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5 text-muted-foreground dark:text-slate-400 text-sm">%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                         <div className={`flex justify-between items-center p-3 rounded-lg mt-4 font-bold ${Math.abs(totalWeights - 1) > 0.001 ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'}`}>
                            <span>Total Sazonalidade</span>
                            <span>{formatPercentage(totalWeights * 100)}</span>
                        </div>
                    </div>
                </div>

                {!isReadOnly && (
                    <div className="mt-6 pt-4 border-t border-border dark:border-slate-700 flex justify-end">
                        <button
                            onClick={() => { onUpdate(category, detail); onClose(); }}
                            className="bg-primary text-primary-foreground font-semibold py-2 px-6 rounded-lg hover:bg-primary/90"
                            disabled={Math.abs(totalWeights - 1) > 0.001}
                        >
                            Salvar Alterações
                        </button>
                    </div>
                )}
                 <style>{`
                    @keyframes fade-in-up {
                        0% { opacity: 0; transform: translateY(20px) scale(0.98); }
                        100% { opacity: 1; transform: translateY(0) scale(1); }
                    }
                    .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
                `}</style>
            </div>
        </div>
    );
};

export default CategoryDetailModal;