import React from 'react';
import { MetaLogo, GoogleAdsLogo, ShopifyLogo, SpinnerIcon } from './icons';


type IntegrationStatus = 'connected' | 'disconnected' | 'connecting';

interface Integrations {
    meta: IntegrationStatus;
    google: IntegrationStatus;
    shopify: IntegrationStatus;
}

interface IntegrationsProps {
    integrations: Integrations;
    handleIntegrationToggle: (integration: keyof Integrations) => void;
}

const IntegrationCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    status: IntegrationStatus;
    onButtonClick: () => void;
}> = ({ icon, title, description, status, onButtonClick }) => {
    const isConnected = status === 'connected';
    const isConnecting = status === 'connecting';

    const getStatusText = () => {
      if (isConnecting) return 'Conectando';
      if (isConnected) return 'Conectado';
      return 'Não conectado';
    };

    const getStatusClass = () => {
      if (isConnecting) return 'bg-accent-orange/20 text-accent-orange';
      if (isConnected) return 'bg-primary-soft text-primary-soft-fg';
      return 'bg-card-alt text-muted-foreground';
    };

    return (
        <div className="bg-card p-6 rounded-xl border border-border flex flex-col hover-zoom">
            <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">{icon}</div>
                <div>
                    <h3 className="text-lg font-bold text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                </div>
            </div>
            <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                 <div className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${getStatusClass()}`}>
                    {getStatusText()}
                </div>
                <button 
                    onClick={onButtonClick}
                    disabled={isConnecting}
                    className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-70 disabled:cursor-wait min-w-[120px] ${isConnected ? 'bg-card-alt hover:bg-border text-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
                    {isConnecting && <SpinnerIcon />}
                    <span>
                      {isConnecting ? 'Conectando...' : (isConnected ? 'Gerenciar' : 'Conectar')}
                    </span>
                </button>
            </div>
        </div>
    );
};


const Integrations: React.FC<IntegrationsProps> = ({ integrations, handleIntegrationToggle }) => {
    
    return (
        <>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                    Integrações
                </h1>
                <p className="text-base text-muted-foreground mt-1">
                    Conecte suas plataformas de vendas, marketing e logística para automatizar a coleta de dados.
                </p>
            </header>

            <div className="space-y-8">
                <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">Plataformas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <IntegrationCard 
                            icon={<MetaLogo />}
                            title="Meta Ads (Facebook)"
                            description="Sincronize seus custos de marketing e dados de campanha."
                            status={integrations.meta}
                            onButtonClick={() => handleIntegrationToggle('meta')}
                        />
                        <IntegrationCard 
                            icon={<GoogleAdsLogo />}
                            title="Google Ads"
                            description="Importe dados de gastos e performance de suas campanhas."
                            status={integrations.google}
                            onButtonClick={() => handleIntegrationToggle('google')}
                        />
                        <IntegrationCard 
                            icon={<ShopifyLogo />}
                            title="Shopify"
                            description="Importe dados de vendas, produtos e pedidos da sua loja."
                            status={integrations.shopify}
                            onButtonClick={() => handleIntegrationToggle('shopify')}
                        />
                    </div>
                </section>
            </div>
        </>
    );
};

export default Integrations;