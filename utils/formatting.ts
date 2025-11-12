export const formatCurrency = (value: number): string => {
  if (isNaN(value) || !isFinite(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatPercentage = (value: number, precision: number = 2, showSign: boolean = false): string => {
    if (isNaN(value) || !isFinite(value)) return `0,${'0'.repeat(precision)}%`;
    const options: Intl.NumberFormatOptions = {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
    };
    if (showSign && value !== 0) {
        options.signDisplay = 'exceptZero';
    }
    const formattedValue = new Intl.NumberFormat('pt-BR', options).format(value);
    return `${formattedValue}%`;
};

export const formatNumber = (value: number): string => {
    if (isNaN(value) || !isFinite(value)) return '0';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
};

export const formatDecimal = (value: number): string => {
    if (isNaN(value) || !isFinite(value)) return '0,00';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
};

export const formatDuration = (days: number | null): string => {
  if (days === null || isNaN(days) || !isFinite(days)) return '-';
  if (days < 1 && days > 0) return '< 1 dia';
  const roundedDays = Math.round(days);
  return `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(roundedDays)} dias`;
};


// --- Date Helpers ---
export const formatDate = (date: Date): string => {
    // Timezone-safe date formatting
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const subDays = (date: Date, days: number): Date => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - days);
    return newDate;
};

export const getDateRangeForPreset = (preset: string, customRange?: { start: Date, end: Date }): { start: Date, end: Date } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today
    switch (preset) {
        case 'today':
            return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) };
        case 'yesterday':
            const yesterday = subDays(today, 1);
            return { start: yesterday, end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1) };
        case 'last7days':
            return { start: subDays(today, 6), end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) };
        case 'last14days':
             return { start: subDays(today, 13), end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) };
        case 'last60days':
            return { start: subDays(today, 59), end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) };
        case 'last90days':
            return { start: subDays(today, 89), end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) };
        case 'allTime':
             return { start: subDays(today, 59), end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) }; // Based on 60 days of data
        case 'thisMonth':
            return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59) };
        case 'custom':
             if (customRange) {
                return {
                    start: new Date(customRange.start.getFullYear(), customRange.start.getMonth(), customRange.start.getDate()),
                    end: new Date(customRange.end.getFullYear(), customRange.end.getMonth(), customRange.end.getDate(), 23, 59, 59)
                };
            }
            return { start: today, end: today };
        default:
            return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59) };
    }
};