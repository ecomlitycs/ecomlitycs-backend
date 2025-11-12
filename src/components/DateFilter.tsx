import React, { useState, useEffect, useRef } from 'react';
import { CalendarIcon, CaretDownIcon } from './icons';

interface DateFilterProps {
    activeFilter: string;
    onFilterChange: (preset: string, customRange?: { start: Date; end: Date }) => void;
    initialDateRange: { start: Date; end: Date };
}

// Helper to format date for input[type=date]
const toInputDateString = (date: Date): string => {
  const tempDate = new Date(date);
  // Adjust for timezone offset to display correct date in local time
  tempDate.setMinutes(tempDate.getMinutes() - tempDate.getTimezoneOffset());
  return tempDate.toISOString().slice(0, 10);
};

const DateFilter: React.FC<DateFilterProps> = ({ activeFilter, onFilterChange, initialDateRange }) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [customRange, setCustomRange] = useState({ start: initialDateRange.start, end: initialDateRange.end });
    const popoverRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const presets = [
        { id: 'today', label: 'Hoje' },
        { id: 'yesterday', label: 'Ontem' },
        { id: 'last7days', label: '7 dias' },
        { id: 'last14days', label: '14 dias' },
        { id: 'thisMonth', label: 'Este Mês' },
        { id: 'allTime', label: 'Período Total' },
    ];
    
    useEffect(() => {
        setCustomRange({ start: initialDateRange.start, end: initialDateRange.end });
    }, [initialDateRange]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsPopoverOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handlePresetClick = (preset: string) => {
        onFilterChange(preset);
        setIsPopoverOpen(false); // Close popover if it was open
    };

    const handleCustomApply = () => {
        onFilterChange('custom', customRange);
        setIsPopoverOpen(false);
    };
    
    const getCustomButtonLabel = () => {
        if (activeFilter === 'custom') {
            const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', timeZone: 'UTC' };
            return `${customRange.start.toLocaleDateString('pt-BR', options)} - ${customRange.end.toLocaleDateString('pt-BR', options)}`;
        }
        return 'Personalizado';
    };

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {presets.map(preset => (
                <button
                    key={preset.id}
                    onClick={() => handlePresetClick(preset.id)}
                    className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                        activeFilter === preset.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-card-alt text-foreground dark:bg-slate-700 dark:text-slate-100 hover:bg-border dark:hover:bg-slate-600'
                    }`}
                >
                    {preset.label}
                </button>
            ))}
            
            <div className="relative">
                <button
                    ref={buttonRef}
                    onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-colors text-sm font-semibold ${
                        activeFilter === 'custom'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card-alt text-foreground dark:bg-slate-700 dark:text-slate-100 hover:bg-border dark:hover:bg-slate-600 border-border dark:border-slate-600'
                    }`}
                >
                    <CalendarIcon className="w-4 h-4" />
                    <span>{getCustomButtonLabel()}</span>
                    <CaretDownIcon className={`w-3 h-3 transition-transform ${isPopoverOpen ? 'rotate-180' : ''}`} />
                </button>

                {isPopoverOpen && (
                    <div ref={popoverRef} className="absolute right-0 mt-2 w-72 bg-card dark:bg-slate-800 rounded-xl border border-border dark:border-slate-700 shadow-lg z-10 p-4 animate-fade-in-up">
                        <p className="text-sm font-semibold mb-2 text-foreground dark:text-slate-100">Intervalo Personalizado</p>
                        <div className="space-y-2">
                            <div>
                                <label htmlFor="start-date" className="text-xs text-muted-foreground dark:text-slate-400">Início</label>
                                <input
                                    type="date"
                                    id="start-date"
                                    value={toInputDateString(customRange.start)}
                                    onChange={e => setCustomRange(prev => ({ ...prev, start: new Date(e.target.value + 'T00:00:00') }))}
                                    className="w-full bg-background dark:bg-slate-700 border border-border dark:border-slate-600 rounded-md px-2 py-1.5 text-sm font-semibold text-foreground dark:text-slate-200"
                                />
                            </div>
                            <div>
                                <label htmlFor="end-date" className="text-xs text-muted-foreground dark:text-slate-400">Fim</label>
                                <input
                                    type="date"
                                    id="end-date"
                                    value={toInputDateString(customRange.end)}
                                    onChange={e => setCustomRange(prev => ({ ...prev, end: new Date(e.target.value + 'T00:00:00') }))}
                                    className="w-full bg-background dark:bg-slate-700 border border-border dark:border-slate-600 rounded-md px-2 py-1.5 text-sm font-semibold text-foreground dark:text-slate-200"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleCustomApply}
                            className="w-full mt-4 bg-primary text-primary-foreground font-semibold py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors"
                        >
                            Aplicar
                        </button>
                    </div>
                )}
            </div>
             <style>{`
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.2s ease-out; }
            `}</style>
        </div>
    );
};

export default DateFilter;