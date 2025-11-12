import React from 'react';

interface FormattedValueProps {
  value: string;
  integerClassName?: string;
  fractionClassName?: string;
  symbolClassName?: string;
  isPercentage?: boolean;
}

const FormattedValue: React.FC<FormattedValueProps> = ({ value, integerClassName, fractionClassName, symbolClassName }) => {
  if (value === null || typeof value === 'undefined' || value.trim() === '' || value.trim() === '-') {
    return <span className={integerClassName}>-</span>;
  }

  const isPercentage = value.includes('%');
  const isCurrency = value.includes('R$');

  let symbol = '';
  let numberPart = value;

  if (isCurrency) {
    symbol = 'R$';
    numberPart = value.replace('R$', '').trim();
  } else if (isPercentage) {
    symbol = '%';
    numberPart = value.replace('%', '').trim();
  }
  
  const [integer, fraction] = numberPart.split(',');

  // For numbers without fractions, like integers from formatNumber
  if (typeof fraction === 'undefined') {
    return (
        <span className="inline-flex items-baseline">
            {isCurrency && <span className={symbolClassName}>{symbol}</span>}
            <span className={integerClassName}>{integer}</span>
            {isPercentage && <span className={symbolClassName}>{symbol}</span>}
        </span>
    );
  }


  return (
    <span className="inline-flex items-baseline">
      {isCurrency && <span className={symbolClassName}>{symbol}</span>}
      <span className={integerClassName}>{integer}</span>
      {fraction && <span className={fractionClassName}>,{fraction}</span>}
      {isPercentage && <span className={symbolClassName}>{symbol}</span>}
    </span>
  );
};

export default FormattedValue;