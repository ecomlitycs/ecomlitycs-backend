import { supabase } from '../lib/supabaseClient';

export interface GoogleAdsCredentials {
  access_token: string;
  refresh_token: string;
  customer_id: string;
}

export interface GoogleAdsMetric {
  date: string;
  campaign_id: string;
  campaign_name: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  conversion_value: number;
}

/**
 * Inicia o fluxo OAuth do Google Ads
 */
export const initiateGoogleAdsAuth = () => {
  const clientId = import.meta.env.VITE_GOOGLE_ADS_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/google-ads/callback`;
  
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/adwords');
  authUrl.searchParams.append('access_type', 'offline');
  authUrl.searchParams.append('prompt', 'consent');
  
  window.location.href = authUrl.toString();
};

/**
 * Salva as credenciais do Google Ads no Supabase
 */
export const saveGoogleAdsCredentials = async (
  userId: string,
  credentials: GoogleAdsCredentials
): Promise<void> => {
  const { error } = await supabase
    .from('integrations')
    .upsert({
      user_id: userId,
      integration_type: 'google_ads',
      credentials,
      is_active: true,
      last_sync: new Date().toISOString(),
    }, {
      onConflict: 'user_id,integration_type'
    });

  if (error) throw error;
};

/**
 * Obtém as credenciais do Google Ads do usuário
 */
export const getGoogleAdsCredentials = async (
  userId: string
): Promise<GoogleAdsCredentials | null> => {
  const { data, error } = await supabase
    .from('integrations')
    .select('credentials')
    .eq('user_id', userId)
    .eq('integration_type', 'google_ads')
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data.credentials as GoogleAdsCredentials;
};

/**
 * Verifica se o Google Ads está conectado
 */
export const isGoogleAdsConnected = async (userId: string): Promise<boolean> => {
  const credentials = await getGoogleAdsCredentials(userId);
  return credentials !== null;
};

/**
 * Desconecta o Google Ads
 */
export const disconnectGoogleAds = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('integrations')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('integration_type', 'google_ads');

  if (error) throw error;
};

/**
 * Sincroniza métricas do Google Ads
 * NOTA: Esta é uma implementação simulada. Em produção, você precisaria:
 * 1. Implementar um Edge Function no Supabase para fazer as chamadas à API do Google Ads
 * 2. Usar o refresh_token para obter novos access_tokens
 * 3. Fazer as requisições à API do Google Ads
 */
export const syncGoogleAdsMetrics = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<GoogleAdsMetric[]> => {
  // Simulação de dados para demonstração
  const mockMetrics: GoogleAdsMetric[] = [
    {
      date: '2025-11-10',
      campaign_id: 'camp_001',
      campaign_name: 'Campanha Black Friday',
      impressions: 15000,
      clicks: 450,
      cost: 1250.00,
      conversions: 35,
      conversion_value: 12500.00,
    },
    {
      date: '2025-11-11',
      campaign_id: 'camp_001',
      campaign_name: 'Campanha Black Friday',
      impressions: 18000,
      clicks: 520,
      cost: 1450.00,
      conversions: 42,
      conversion_value: 15200.00,
    },
  ];

  // Salvar métricas no banco
  for (const metric of mockMetrics) {
    await supabase.from('google_ads_metrics').upsert({
      user_id: userId,
      ...metric,
    }, {
      onConflict: 'user_id,date,campaign_id'
    });
  }

  return mockMetrics;
};

/**
 * Obtém métricas do Google Ads do banco de dados
 */
export const getGoogleAdsMetrics = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<GoogleAdsMetric[]> => {
  const { data, error } = await supabase
    .from('google_ads_metrics')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};
