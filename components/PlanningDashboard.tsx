import React from 'react';
import { PlanningInputs, PlanningResults } from '../types';
import InputGroup from './InputGroup';
import ResultsGrid from './ResultsGrid';
import BreakdownTable from './BreakdownTable';

interface PlanningDashboardProps {
  inputs: PlanningInputs;
  results: PlanningResults;
  handleInputChange: (name: keyof PlanningInputs, value: number) => void;
}

const PlanningDashboard: React.FC<PlanningDashboardProps> = ({ inputs, results, handleInputChange }) => {
    return (
        <>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Planejamento Estratégico
                </h1>
                <p className="text-base text-muted-foreground mt-1">Defina suas metas financeiras e crie um plano de ação diário e semanal para alcançá-las.</p>
            </header>
            <div className="space-y-8">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-1">
                        <InputGroup inputs={inputs} results={results} handleInputChange={handleInputChange} />
                    </div>
                    <div className="xl:col-span-2">
                        <BreakdownTable inputs={inputs} results={results} />
                    </div>
                </div>
                
                <ResultsGrid results={results} />
            </div>
        </>
    );
}

export default PlanningDashboard;