import React, { useState } from 'react';
import { exportToExcel, exportToPDF, exportToCSV, ExportData } from '../utils/exportUtils';

interface ExportButtonProps {
  data: ExportData;
  formats?: ('excel' | 'pdf' | 'csv')[];
  className?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  data, 
  formats = ['excel', 'pdf', 'csv'],
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    setIsExporting(true);
    try {
      switch (format) {
        case 'excel':
          exportToExcel(data);
          break;
        case 'pdf':
          exportToPDF(data);
          break;
        case 'csv':
          exportToCSV(data);
          break;
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar dados. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-dark-card-alt transition-colors"
        disabled={isExporting}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-sm font-medium">Exportar</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-md shadow-popover z-20 overflow-hidden">
            {formats.includes('excel') && (
              <button
                onClick={() => handleExport('excel')}
                disabled={isExporting}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-dark-card-alt transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                  <path d="M14 2v6h6M9.5 13.5l1.5 1.5 3-3"/>
                </svg>
                Exportar Excel (.xlsx)
              </button>
            )}
            {formats.includes('pdf') && (
              <button
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-dark-card-alt transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                </svg>
                Exportar PDF
              </button>
            )}
            {formats.includes('csv') && (
              <button
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-dark-card-alt transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                </svg>
                Exportar CSV
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;
