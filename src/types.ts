

export interface ShopifyProduct {
  id: string;
  name: string;
  imageUrl: string;
  salePrice: number;
  cost: number | null;
}

export interface PlanningInputs {
  revenueGoal: number;
  conversionRate: number;
  avgTicket: number;
  avgProductCost: number;
  checkoutFee: number;
  paymentGatewayFee: number;
  taxRate: number;
  marketingSpendPercentage: number;
}

export interface PlanningResults {
  revenue: number;
  orders: number;
  sessions: number;
  adSpend: number;
  cps: number;
  idealCpa: number;
  contributionMargin: number;
  profitMargin: number;
  roas: number;
}

export interface PricingInputs {
  productName: string;
  baseProductCost: number;
  sitePrice: number;
  checkoutFee: number;
  iofFee: number;
  shopifyFee: number;
  gatewayFee: number;
  errorMarginFee: number;
  taxFee: number;
  marketingFee: number;
}

export interface PricingResults {
    fixedCostsPercentage: number;
    fixedCostsValue: number;
    marketingValue: number;
    totalOperationalCost: number;
    finalProfit: number;
    finalProfitPercentage: number;
    maxCpa: number;
    currentMarkup: number;
    recommendedPrice: number;
}

export interface MarkupScenario {
  markup: number;
  finalPrice: number;
  totalCost: number;
  marketingCost: number;
  maxCpa: number;
  profit: number;
  profitPercentage: number;
}

export interface DailyActuals {
  sessions: number | null;
  revenue: number | null;
  marketingSpend: number | null;
  newCustomers: number | null;
}

export interface AccumulatedResults {
    sessions: number;
    orders: number;
    revenue: number;
    conversionRate: number;
    avgTicket: number;
    marketingSpend: number;
    cps: number;
}

export interface PaymentStat {
    value: number;
    count: number;
}

export interface PaymentBreakdown {
    card: {
        approved: PaymentStat;
        in_analysis: PaymentStat;
        other: PaymentStat;
    };
    boleto: {
        approved: PaymentStat;
        pending: PaymentStat;
        compensated: PaymentStat;
    };
    pix: {
        approved: PaymentStat;
        pending: PaymentStat;
        cancelled: PaymentStat;
    };
}

export interface PaymentMethodsData {
    card: { approved: PaymentStat; pending: PaymentStat; conversion: number; };
    boleto: { approved: PaymentStat; pending: PaymentStat; conversion: number; };
    pix: { approved: PaymentStat; pending: PaymentStat; conversion: number; };
}


export interface GoalData {
  revenueGoal: number;
  achievedRevenue: number;
  progressPercentage: number;
  remainingValue: number;
}

export interface GranularGoalData {
    day: {
        goal: number;
        achieved: number;
        progress: number;
    };
    week: {
        goal: number;
        achieved: number;
        progress: number;
    };
    month: {
        goal: number;
        achieved: number;
        progress: number;
    };
}

// --- ANNUAL PLANNING (OPEX) TYPES ---
export type OpexCategory = 'aluguel' | 'internet' | 'aplicativos' | 'funcionarios' | 'outros';
export type AnnualPlanScenario = 'Base' | 'Corte de Gastos' | 'Aposta de Crescimento';

export interface OpexSubItem {
    id: string;
    name: string;
    value: number;
    notes?: string;
}

export interface AnnualPlanOpexCategoryDetail {
    subItems: OpexSubItem[];
    monthlyOverrides: (number | null)[];
    seasonalWeights: number[];
    owner: string;
}

export interface AnnualPlan {
    year: number;
    activeScenario: AnnualPlanScenario;
    status: 'rascunho' | 'revisao' | 'aprovado';
    version: number;
    effective_from: string; // "YYYY-MM"
    
    scenarios: Record<AnnualPlanScenario, {
        opex: Record<OpexCategory, AnnualPlanOpexCategoryDetail>;
        notes: string;
        planPercentages: {
            tax: number;
            checkout: number;
            gateway: number;
            platform: number;
            iof: number;
            shipping: number;
        };
        assumptions: {
            projectedRevenue: number;
            projectedOrders: number;
            runwayMonths: number;
            opexToRevenueTarget: number;
        };
    }>;
}


export interface AnnualPlanActuals {
    year: number;
    monthly: Partial<Record<OpexCategory, number[]>>; // 12 values for each category
}


// --- SHARED DASHBOARD & REPORTS TYPES ---
export interface ProductRank {
    name: string;
    profit: number;
}

export interface DailyDataPoint {
    date: string;
    value: number | null;
}

export interface DailyRevenue {
    date: string;
    revenue: number;
}
export interface DailyProfit {
    date: string;
    profit: number | null;
}

export interface DailyGoalProgress {
    date: string;
    revenue: number;
    goal: number;
}

export interface WeeklyProgress {
    week: number;
    achieved: number;
    goal: number;
}

export interface DailyProfitMetrics {
  revenue: number;
  cost: number;
  profit: number;
}

export interface ProductPerformance {
    name: string;
    revenue: number;
    cost: number;
    profit: number;
    orders: number;
    avgTicket: number;
    profitMargin: number;
}

export interface NewVsReturningStats {
    revenue: number;
    orders: number;
    avgTicket: number;
}

export interface DashboardData {
    // Core standardized metrics
    netRevenue: number; // Receita Líquida (Aprovada)
    contributionMargin: number; // Margem de Contribuição R$
    contributionMarginPercent: number; // Margem de Contribuição %
    fixedCosts: number; // Custos Fixos
    netProfit: number; // Lucro Líquido Final R$
    netProfitMargin: number; // Margem Líquida %

    // Cost breakdown
    totalCogs: number; // Custo de Produtos Vendidos
    totalMarketing: number; // Investimento em Ads
    totalFees: number; // Taxas (Gateway, Plataforma, Impostos)

    // Efficiency metrics
    sessions: number; // ADDED: Sessões totais no período
    roas: number;
    cpa: number;
    avgTicket: number;
    
    // Operational metrics
    ordersCount: number;
    pendingOrdersValue: number;
    pendingOrdersCount: number;
    
    // Changes (deltas)
    netRevenueChange: number;
    contributionMarginChange: number;
    netProfitChange: number;
    roasChange: number;
    cpaChange: number;
    avgTicketChange: number;

    // Goals
    revenueGoal: number;
    netProfitGoal: number; // New explicit goal
}

export interface ExecutiveSummaryData {
    previousPeriodGoal: number;
    previousPeriodRevenue: number;
    previousPeriodProfitMargin: number;
    suggestedNextPeriodGoal: number;
    growthRate: number;
}

export interface ArchivedReport {
  id: string; 
  month: Date;
  planningResults: PlanningResults;
  dailyData: (DailyActuals & { date: string })[];
  accumulatedActuals: AccumulatedResults;
}

export interface ProductSale {
    name: string;
    revenue: number;
    cost: number;
    orders: number;
}

export type ShipmentStatus =
  | 'entregue'
  | 'em_transito'
  | 'devolvido'
  | 'taxado'
  | 'pendente'
  | 'falha'
  | 'atrasado'
  | 'sem_atualizacao'
  | 'aguardando_retirada'
  | 'sem_rastreio';

export interface ShipmentProduct {
  name: string;
  quantity: number;
  imageUrl: string;
}

export interface ShipmentCustomer {
  name: string;
  address: string;
}

export interface ShipmentDetail {
  orderId: string;
  status: ShipmentStatus;
  origin: 'China' | 'Brasil';
  carrier: string;
  cost: number;
  creationDate: string; 
  shippingDate: string; 
  arrivalInBrazilDate: string | null; 
  customsEntryDate: string | null; 
  customsExitDate: string | null; 
  deliveryDate: string | null; 
  customsStatus: 'clear' | 'held' | 'released';
  failureReason: string | null;
  product: ShipmentProduct;
  customer: ShipmentCustomer;
}

export interface LogisticsOverviewData {
  orderStatusCounts: { [key in ShipmentStatus]?: number };
  allShipments: ShipmentDetail[];
  avgProcessingTime: number; 
  avgCustomsTime: number; 
  avgFinalDeliveryTime: number; 
}

export interface DailyLogistics {
  shipments: ShipmentDetail[];
}

export interface DailyData extends DailyActuals {
    date: string;
    products: ProductSale[];
    paymentBreakdown: PaymentBreakdown;
    returningCustomerRevenue: number;
    returningCustomerOrders: number;
    logistics: DailyLogistics;
}

// --- STRICT REPORT TYPES ---

export interface FinanceReport {
  period: string;
  goal: { metric: "lucro_liquido" | "faturamento" | "margem_contribuicao"; value: number; achieved: number; progress_pct: number };
  waterfall: {
    receita_liquida: number;
    cogs: number;
    marketing: number;
    taxas: number;
    frete_subsidiado: number;
    margem_contribuicao: number;
    custos_fixos: number;
    lucro_liquido: number;
  };
  percent_of_revenue: {
    cogs: number; marketing: number; taxas: number; frete_subsidiado: number; margem_contribuicao: number;
  };
  top_movers: {
      sku: { sku: string; delta_lucro: number }[];
      campaign: { name: string; delta_lucro: number; roas: number }[];
  };
  burn_down: {
    line_expected: {date: string, value: number}[];
    line_actual: {date: string, value: number}[];
    remaining: number;
    status: "ahead" | "on_track" | "behind";
  };
  ui: {
    title: string;
    subtitle: string;
    footer: string;
    badges: { updated: string };
  };
  flags: { partial: boolean; missing: string[] };
}

export interface PaymentsReport {
    period: string;
    approval: {
        cartao: { approved: number; pending: number; rejected: number };
        pix: { approved: number; pending: number; rejected: number };
        boleto: { approved: number; pending: number; rejected: number };
    };
    rates: {
        cartao_approval_pct: number;
        pix_approval_pct: number;
        boleto_approval_pct: number;
    };
    fees_effective: { gateway_pct: number; platform_pct: number; iof_pct: number };
    reconciliation: { orders_approved: number; payments_approved: number; delta_pct: number; alert: boolean };
    ui: { title: string; subtitle: string; notes: string[] };
    flags: { partial: boolean; missing: string[] };
}

export interface ComparisonRow {
    kpi: string;
    period: string;
    plan: number | null;
    actual: number;
    meta: number | null;
    delta: number | null;
    status: "green" | "amber" | "red" | "neutral";
}

export interface ComparisonReport {
    periods: string[];
    table: ComparisonRow[];
    ui: { title: string; subtitle: string; export: string[] };
    flags: { partial: boolean; missing: string[] };
}
