import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportData {
  headers: string[];
  rows: any[][];
  filename: string;
  title?: string;
}

/**
 * Exporta dados para arquivo Excel (.xlsx)
 */
export const exportToExcel = (data: ExportData): void => {
  try {
    const worksheet = XLSX.utils.aoa_to_sheet([data.headers, ...data.rows]);
    
    // Ajustar largura das colunas
    const columnWidths = data.headers.map((header, i) => {
      const maxLength = Math.max(
        header.length,
        ...data.rows.map(row => String(row[i] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
    
    XLSX.writeFile(workbook, `${data.filename}.xlsx`);
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    throw new Error('Falha ao exportar dados para Excel');
  }
};

/**
 * Exporta dados para arquivo PDF
 */
export const exportToPDF = (data: ExportData): void => {
  try {
    const doc = new jsPDF();
    
    // Título
    if (data.title) {
      doc.setFontSize(16);
      doc.text(data.title, 14, 15);
    }
    
    // Tabela
    autoTable(doc, {
      head: [data.headers],
      body: data.rows,
      startY: data.title ? 25 : 15,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [37, 99, 235], // primary color
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // background color
      },
    });
    
    doc.save(`${data.filename}.pdf`);
  } catch (error) {
    console.error('Erro ao exportar para PDF:', error);
    throw new Error('Falha ao exportar dados para PDF');
  }
};

/**
 * Exporta dados para CSV
 */
export const exportToCSV = (data: ExportData): void => {
  try {
    const csvContent = [
      data.headers.join(','),
      ...data.rows.map(row => row.map(cell => {
        // Escapar células que contêm vírgula ou aspas
        const cellStr = String(cell || '');
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${data.filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Erro ao exportar para CSV:', error);
    throw new Error('Falha ao exportar dados para CSV');
  }
};
