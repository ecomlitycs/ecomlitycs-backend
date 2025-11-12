import { supabase } from '../lib/supabaseClient';

export interface ShopifyCredentials {
  access_token: string;
  shop_url: string;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  price: number;
  cost: number;
  inventory_quantity: number;
  sku: string;
}

export interface ShopifyOrder {
  id: string;
  order_number: string;
  created_at: string;
  total_price: number;
  line_items: Array<{
    product_id: string;
    title: string;
    quantity: number;
    price: number;
  }>;
  customer: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

/**
 * Inicia o fluxo OAuth do Shopify
 */
export const initiateShopifyAuth = (shopUrl: string) => {
  const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY;
  const redirectUri = `${window.location.origin}/auth/shopify/callback`;
  const scopes = 'read_products,read_orders,read_customers';
  
  const authUrl = `https://${shopUrl}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${redirectUri}`;
  
  window.location.href = authUrl;
};

/**
 * Salva as credenciais do Shopify no Supabase
 */
export const saveShopifyCredentials = async (
  userId: string,
  credentials: ShopifyCredentials
): Promise<void> => {
  const { error } = await supabase
    .from('integrations')
    .upsert({
      user_id: userId,
      integration_type: 'shopify',
      credentials,
      store_url: credentials.shop_url,
      is_active: true,
      last_sync: new Date().toISOString(),
    }, {
      onConflict: 'user_id,integration_type'
    });

  if (error) throw error;
};

/**
 * Obtém as credenciais do Shopify do usuário
 */
export const getShopifyCredentials = async (
  userId: string
): Promise<ShopifyCredentials | null> => {
  const { data, error } = await supabase
    .from('integrations')
    .select('credentials, store_url')
    .eq('user_id', userId)
    .eq('integration_type', 'shopify')
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return {
    ...data.credentials,
    shop_url: data.store_url,
  } as ShopifyCredentials;
};

/**
 * Verifica se o Shopify está conectado
 */
export const isShopifyConnected = async (userId: string): Promise<boolean> => {
  const credentials = await getShopifyCredentials(userId);
  return credentials !== null;
};

/**
 * Desconecta o Shopify
 */
export const disconnectShopify = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('integrations')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('integration_type', 'shopify');

  if (error) throw error;
};

/**
 * Sincroniza produtos do Shopify
 * NOTA: Esta é uma implementação simulada. Em produção, você precisaria:
 * 1. Implementar um Edge Function no Supabase para fazer as chamadas à API do Shopify
 * 2. Usar o access_token para autenticar as requisições
 * 3. Fazer as requisições à API REST ou GraphQL do Shopify
 */
export const syncShopifyProducts = async (userId: string): Promise<ShopifyProduct[]> => {
  // Simulação de dados para demonstração
  const mockProducts: ShopifyProduct[] = [
    {
      id: 'prod_001',
      title: 'Moletom com Capuz Premium',
      price: 189.90,
      cost: 75.00,
      inventory_quantity: 150,
      sku: 'MOL-001',
    },
    {
      id: 'prod_002',
      title: 'Tênis Esportivo Pro',
      price: 299.90,
      cost: 120.00,
      inventory_quantity: 80,
      sku: 'TEN-001',
    },
    {
      id: 'prod_003',
      title: 'Calça Jeans Slim Fit',
      price: 159.90,
      cost: 60.00,
      inventory_quantity: 200,
      sku: 'CAL-001',
    },
  ];

  // Salvar produtos no banco
  for (const product of mockProducts) {
    await supabase.from('shopify_products').upsert({
      user_id: userId,
      shopify_product_id: product.id,
      title: product.title,
      price: product.price,
      cost: product.cost,
      inventory_quantity: product.inventory_quantity,
      sku: product.sku,
    }, {
      onConflict: 'user_id,shopify_product_id'
    });
  }

  return mockProducts;
};

/**
 * Obtém produtos do Shopify do banco de dados
 */
export const getShopifyProducts = async (userId: string): Promise<ShopifyProduct[]> => {
  const { data, error } = await supabase
    .from('shopify_products')
    .select('*')
    .eq('user_id', userId)
    .order('title');

  if (error) throw error;
  
  return (data || []).map(p => ({
    id: p.shopify_product_id,
    title: p.title,
    price: p.price,
    cost: p.cost,
    inventory_quantity: p.inventory_quantity,
    sku: p.sku,
  }));
};

/**
 * Sincroniza pedidos do Shopify
 * NOTA: Implementação simulada
 */
export const syncShopifyOrders = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<ShopifyOrder[]> => {
  // Em produção, isso faria uma chamada à API do Shopify
  // e salvaria os pedidos no daily_actuals
  
  const mockOrders: ShopifyOrder[] = [
    {
      id: 'order_001',
      order_number: '#1001',
      created_at: '2025-11-11T10:30:00Z',
      total_price: 379.80,
      line_items: [
        {
          product_id: 'prod_001',
          title: 'Moletom com Capuz Premium',
          quantity: 2,
          price: 189.90,
        },
      ],
      customer: {
        id: 'cust_001',
        email: 'cliente@example.com',
        first_name: 'João',
        last_name: 'Silva',
      },
    },
  ];

  return mockOrders;
};
