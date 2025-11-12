import React from 'react';

interface DefaultTaxes {
    paymentGatewayFee: number;
    taxRate: number;
    checkoutFee: number;
}

interface SettingsProps {
    defaultTaxes: DefaultTaxes;
    handleDefaultTaxesChange: (name: keyof DefaultTaxes, value: number) => void;
}

const FeeInput: React.FC<{
  label: string;
  name: keyof DefaultTaxes;
  value: number;
  onChange: (name: keyof DefaultTaxes, value: number) => void;
}> = ({ label, name, value, onChange }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
      <label htmlFor={name} className="font-medium text-foreground">{label}</label>
      <div className="relative w-1/3">
        <input
          type="number"
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(name, parseFloat(e.target.value) || 0)}
          className="w-full rounded-md border-border bg-background shadow-sm pr-8 pl-3 py-2 text-right font-semibold text-foreground transition duration-150 ease-in-out focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="0"
          step="0.01"
        />
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">%</span>
      </div>
    </div>
  );
};


const Settings: React.FC<SettingsProps> = ({ defaultTaxes, handleDefaultTaxesChange }) => {
    
    return (
        <>
            <header className="mb-8">
                <h1 className="text-3xl dark:text-2xl font-bold text-foreground tracking-tight">
                    Configurações
                </h1>
                <p className="text-base text-muted-foreground mt-1">
                    Gerencie suas taxas padrão e preferências do sistema.
                </p>
            </header>

            <div className="space-y-8">
                <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">Configuração de Taxas Padrão</h2>
                    <div className="bg-card p-6 rounded-xl border border-border max-w-2xl hover-zoom">
                        <FeeInput 
                            label="Taxa de Pagamento (Gateway)"
                            name="paymentGatewayFee"
                            value={defaultTaxes.paymentGatewayFee}
                            onChange={handleDefaultTaxesChange}
                        />
                         <FeeInput 
                            label="Imposto"
                            name="taxRate"
                            value={defaultTaxes.taxRate}
                            onChange={handleDefaultTaxesChange}
                        />
                         <FeeInput 
                            label="Taxa de Checkout"
                            name="checkoutFee"
                            value={defaultTaxes.checkoutFee}
                            onChange={handleDefaultTaxesChange}
                        />
                    </div>
                </section>
            </div>
        </>
    );
};

export default Settings;
