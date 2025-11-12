import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MetaLogo, GoogleAdsLogo, ShopifyLogo, SpinnerIcon } from './icons';
import {
  isGoogleAdsConnected,
  disconnectGoogleAds,
  syncGoogleAdsMetrics,
  initiateGoogleAdsAuth,
} from '../services/googleAdsService';
import {
  isShopifyConnected,
  disconnectShopify,
  syncShopifyProducts,
  initiateShopifyAuth,
} from '../services/shopifyService';

type IntegrationStatus = 'connected' | 'disconnected' | 'connecting';

interface IntegrationState {
  meta: IntegrationStatus;
  google: IntegrationStatus;
  shopify: IntegrationStatus;
}

interface IntegrationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: IntegrationStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync?: () => void;
  lastSync?: string;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  icon,
  title,
  description,
  status,
  onConnect,
  onDisconnect,
  onSync,
  lastSync,
}) => {
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

      {isConnected && lastSync && (
        <div className="mt-3 text-xs text-muted-foreground">
          Última sincronização: {new Date(lastSync).toLocaleString('pt-BR')}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-border flex justify-between items-center gap-2">
        <div className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${getStatusClass()}`}>
          {getStatusText()}
        </div>
        <div className="flex gap-2">
          {isConnected && onSync && (
            <button
              onClick={onSync}
              className="flex items-center justify-center space-x-1 px-3 py-2 rounded-lg font-semibold text-sm transition-colors bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Sincronizar</span>
            </button>
          )}
          <button
            onClick={isConnected ? onDisconnect : onConnect}
            disabled={isConnecting}
            className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-70 disabled:cursor-wait min-w-[120px] ${
              isConnected
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {isConnecting && <SpinnerIcon />}
            <span>{isConnecting ? 'Conectando...' : isConnected ? 'Desconectar' : 'Conectar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const IntegrationsFunctional: React.FC = () => {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<IntegrationState>({
    meta: 'disconnected',
    google: 'disconnected',
    shopify: 'disconnected',
  });
  const [loading, setLoading] = useState(true);
  const [shopifyUrl, setShopifyUrl] = useState('');
  const [showShopifyModal, setShowShopifyModal] = useState(false);

  useEffect(() => {
    if (user) {
      checkIntegrations();
    }
  }, [user]);

  const checkIntegrations = async () => {
    if (!user) return;

    try {
      const [googleConnected, shopifyConnected] = await Promise.all([
        isGoogleAdsConnected(user.id),
        isShopifyConnected(user.id),
      ]);

      setIntegrations({
        meta: 'disconnected', // Meta Ads ainda não implementado
        google: googleConnected ? 'connected' : 'disconnected',
        shopify: shopifyConnected ? 'connected' : 'disconnected',
      });
    } catch (error) {
      console.error('Error checking integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAdsConnect = () => {
    setIntegrations((prev) => ({ ...prev, google: 'connecting' }));
    initiateGoogleAdsAuth();
  };

  const handleGoogleAdsDisconnect = async () => {
    if (!user) return;
    try {
      await disconnectGoogleAds(user.id);
      setIntegrations((prev) => ({ ...prev, google: 'disconnected' }));
    } catch (error) {
      console.error('Error disconnecting Google Ads:', error);
    }
  };

  const handleGoogleAdsSync = async () => {
    if (!user) return;
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      await syncGoogleAdsMetrics(user.id, startDate, endDate);
      alert('Métricas do Google Ads sincronizadas com sucesso!');
    } catch (error) {
      console.error('Error syncing Google Ads:', error);
      alert('Erro ao sincronizar métricas do Google Ads');
    }
  };

  const handleShopifyConnect = () => {
    setShowShopifyModal(true);
  };

  const handleShopifySubmit = () => {
    if (!shopifyUrl) {
      alert('Por favor, insira a URL da sua loja Shopify');
      return;
    }
    setIntegrations((prev) => ({ ...prev, shopify: 'connecting' }));
    setShowShopifyModal(false);
    initiateShopifyAuth(shopifyUrl);
  };

  const handleShopifyDisconnect = async () => {
    if (!user) return;
    try {
      await disconnectShopify(user.id);
      setIntegrations((prev) => ({ ...prev, shopify: 'disconnected' }));
    } catch (error) {
      console.error('Error disconnecting Shopify:', error);
    }
  };

  const handleShopifySync = async () => {
    if (!user) return;
    try {
      await syncShopifyProducts(user.id);
      alert('Produtos do Shopify sincronizados com sucesso!');
    } catch (error) {
      console.error('Error syncing Shopify:', error);
      alert('Erro ao sincronizar produtos do Shopify');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <SpinnerIcon />
      </div>
    );
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Integrações</h1>
        <p className="text-base text-muted-foreground mt-1">
          Conecte suas plataformas de vendas e marketing para automatizar a coleta de dados.
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
              onConnect={() => alert('Integração com Meta Ads em desenvolvimento')}
              onDisconnect={() => {}}
            />
            <IntegrationCard
              icon={<GoogleAdsLogo />}
              title="Google Ads"
              description="Importe dados de gastos e performance de suas campanhas."
              status={integrations.google}
              onConnect={handleGoogleAdsConnect}
              onDisconnect={handleGoogleAdsDisconnect}
              onSync={handleGoogleAdsSync}
            />
            <IntegrationCard
              icon={<ShopifyLogo />}
              title="Shopify"
              description="Importe dados de vendas, produtos e pedidos da sua loja."
              status={integrations.shopify}
              onConnect={handleShopifyConnect}
              onDisconnect={handleShopifyDisconnect}
              onSync={handleShopifySync}
            />
          </div>
        </section>

        {/* Informações de Ajuda */}
        <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
            Como conectar suas integrações
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>
                <strong>Google Ads:</strong> Clique em "Conectar" e faça login com sua conta Google que tem acesso ao Google Ads.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>
                <strong>Shopify:</strong> Insira a URL da sua loja (ex: minhaloja.myshopify.com) e autorize o acesso.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
              <span>
                Após conectar, use o botão "Sincronizar" para importar os dados mais recentes.
              </span>
            </li>
          </ul>
        </section>
      </div>

      {/* Modal Shopify */}
      {showShopifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-foreground mb-4">Conectar Shopify</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Insira a URL da sua loja Shopify (ex: minhaloja.myshopify.com)
            </p>
            <input
              type="text"
              value={shopifyUrl}
              onChange={(e) => setShopifyUrl(e.target.value)}
              placeholder="minhaloja.myshopify.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-card-alt text-gray-900 dark:text-white mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowShopifyModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleShopifySubmit}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Conectar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IntegrationsFunctional;
