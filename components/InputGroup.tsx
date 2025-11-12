import React, { useState, useEffect } from 'react';
import { PlanningInputs, PlanningResults } from '../types';
import { formatCurrency, formatPercentage } from '../utils/formatting';
import FormattedValue from './FormattedValue';

interface InputGroupProps {
  inputs: PlanningInputs;
  results: PlanningResults;
  handleInputChange: (name: keyof PlanningInputs, value: number) => void;
}

const InputField: React.FC<{
  label: string;
  name: keyof PlanningInputs;
  value: number;
  onChange: (name: keyof PlanningInputs, value: number) => void;
  isPercentage?: boolean;
}> = ({ label, name, value, onChange, isPercentage }) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      if (value === 0) {
        setInputValue('');
      } else {
        const formatted = isPercentage
          ? formatPercentage(value).replace('%', '').trim()
          : formatCurrency(value).replace('R$', '').trim();
        setInputValue(formatted);
      }
    }
  }, [value, isFocused, isPercentage]);

  const handleFocus = () => {
    setIsFocused(true);
    const rawValue = String(value).replace('.', ',');
    setInputValue(value === 0 ? '' : rawValue);
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

  const prefix = !isPercentage ? 'R$' : null;
  const suffix = isPercentage ? '%' : null;

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-muted-foreground mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            {prefix}
          </span>
        )}
        <input
          type="text"
          id={name}
          name={name}
          value={inputValue}
          onFocus={handleFocus}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full rounded-lg border border-border bg-card-alt px-3 py-2 text-right font-semibold text-foreground transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
            prefix ? 'pl-10' : ''
          } ${suffix ? 'pr-8' : ''}`}
          placeholder="0,00"
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};


const InputGroup: React.FC<InputGroupProps> = ({ inputs, results, handleInputChange }) => {
  return (
    <div className="bg-card p-6 rounded-xl border border-border hover-zoom h-full flex flex-col">
      <h2 className="text-xl font-bold text-foreground mb-6">Definição de Metas</h2>
      <div className="space-y-5 flex-1">
        <InputField label="Faturamento Alvo (Mês)" name="revenueGoal" value={inputs.revenueGoal} onChange={handleInputChange} />
        
        <div className="pt-4 border-t border-border">
             <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Investimento em Crescimento</h3>
             <div className="space-y-4">
                <InputField label="% Marketing sobre Receita" name="marketingSpendPercentage" value={inputs.marketingSpendPercentage} onChange={handleInputChange} isPercentage />
             </div>
        </div>

         <div className="pt-4 border-t border-border">
             <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Premissas do Funil</h3>
             <div className="grid grid-cols-2 gap-4">
                <InputField label="Taxa Conversão Alvo" name="conversionRate" value={inputs.conversionRate} onChange={handleInputChange} isPercentage />
                <InputField label="Ticket Médio Alvo" name="avgTicket" value={inputs.avgTicket} onChange={handleInputChange} />
             </div>
        </div>

         <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Estrutura de Custos</h3>
            <div className="grid grid-cols-2 gap-4">
                <InputField label="CMV Médio Estimado" name="avgProductCost" value={inputs.avgProductCost} onChange={handleInputChange} isPercentage />
                <InputField label="Imposto Médio" name="taxRate" value={inputs.taxRate} onChange={handleInputChange} isPercentage />
                <InputField label="Taxa Checkout" name="checkoutFee" value={inputs.checkoutFee} onChange={handleInputChange} isPercentage />
                <InputField label="Taxa Gateway" name="paymentGatewayFee" value={inputs.paymentGatewayFee} onChange={handleInputChange} isPercentage />
            </div>
        </div>
        
        <div className="mt-auto pt-6 border-t border-border flex justify-between items-center">
            <h3 className="font-semibold text-foreground text-base">Margem Contribuição Prevista</h3>
            <div className="text-right">
                <FormattedValue 
                    value={formatCurrency(results.contributionMargin)}
                    integerClassName="text-2xl font-bold text-accent-green tabular-nums"
                    fractionClassName="text-lg font-semibold text-accent-green/80 tabular-nums"
                    symbolClassName="text-lg font-semibold text-accent-green mr-1"
                />
                <p className="text-sm text-muted-foreground font-medium mt-0.5">{formatPercentage(results.profitMargin)} da receita</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default InputGroup;