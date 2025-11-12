import React from 'react';
import { PlanningInputs, PlanningResults } from '../types';
import { formatCurrency, formatNumber, formatPercentage, formatDecimal } from '../utils/formatting';
import FormattedValue from './FormattedValue';

interface BreakdownTableProps {
  inputs: PlanningInputs;
  results: PlanningResults;
}

const BreakdownTable: React.FC<BreakdownTableProps> = ({ inputs, results }) => {
  const { conversionRate, avgTicket } = inputs;
  const { sessions, adSpend, orders, idealCpa, revenue, roas, contributionMargin } = results;
  
  const dailyDivisor = 30.5; // More accurate average month
  const weeklyDivisor = 4.35; // More accurate average weeks per month

  // Reordered to follow funnel logic
  const data = [
    { label: 'Sessões Previstas', month: formatNumber(sessions), week: formatNumber(sessions / weeklyDivisor), day: formatNumber(sessions / dailyDivisor) },
    { label: 'Taxa de Conversão Alvo', month: formatPercentage(conversionRate), week: formatPercentage(conversionRate), day: formatPercentage(conversionRate) },
    { label: 'Pedidos Previstos', month: formatNumber(orders), week: formatNumber(orders / weeklyDivisor), day: formatNumber(orders / dailyDivisor) },
    { label: 'Ticket Médio Alvo', month: formatCurrency(avgTicket), week: formatCurrency(avgTicket), day: formatCurrency(avgTicket) },
    { label: 'Faturamento Previsto', month: formatCurrency(revenue), week: formatCurrency(revenue / weeklyDivisor), day: formatCurrency(revenue / dailyDivisor), isHighlight: true },
    { label: 'Marketing (ROAS Alvo)', month: `${formatCurrency(adSpend)} (${formatDecimal(roas)}x)`, week: formatCurrency(adSpend / weeklyDivisor), day: formatCurrency(adSpend / dailyDivisor) },
    { label: 'Margem Contribuição', month: formatCurrency(contributionMargin), week: formatCurrency(contributionMargin / weeklyDivisor), day: formatCurrency(contributionMargin / dailyDivisor), isHighlight: false, isProfit: true },
  ];

  return (
    <div className="bg-card p-6 rounded-xl border border-border h-full hover-zoom flex flex-col">
      <h2 className="text-xl font-bold text-foreground mb-6">Funil de Metas Desdobrado</h2>
      <div className="overflow-x-auto flex-1">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-border">
              <th className="py-3 px-4 text-left text-xs font-semibold uppercase text-muted-foreground tracking-wider">Métrica do Funil</th>
              <th className="py-3 px-4 text-right text-xs font-semibold uppercase text-muted-foreground tracking-wider">Mensal</th>
              <th className="py-3 px-4 text-right text-xs font-semibold uppercase text-muted-foreground tracking-wider">Semanal (média)</th>
              <th className="py-3 px-4 text-right text-xs font-semibold uppercase text-muted-foreground tracking-wider">Diário (média)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
                <tr key={row.label} className={`border-b border-border last:border-b-0 ${row.isHighlight ? 'bg-primary-soft/30' : ''}`}>
                  <td className={`p-4 text-base ${row.isHighlight ? 'font-bold text-primary' : (row.isProfit ? 'font-bold text-accent-green' : 'font-semibold text-foreground')}`}>{row.label}</td>
                  <td className="p-4 text-right tabular-nums text-muted-foreground">
                    <span className={`font-medium text-base ${row.isHighlight ? 'text-foreground' : (row.isProfit ? 'text-accent-green' : '')}`}>{row.month}</span>
                  </td>
                  <td className="p-4 text-right tabular-nums text-muted-foreground">
                    <span className={`font-medium text-base ${row.isHighlight ? 'text-foreground' : (row.isProfit ? 'text-accent-green' : '')}`}>{row.week}</span>
                  </td>
                  <td className="p-4 text-right tabular-nums text-muted-foreground">
                    <span className={`font-medium text-base ${row.isHighlight ? 'text-foreground' : (row.isProfit ? 'text-accent-green' : '')}`}>{row.day}</span>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BreakdownTable;