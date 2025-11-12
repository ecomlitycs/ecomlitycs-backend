


import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import LoadingSpinner from './components/LoadingSpinner';
import Sidebar from './components/Sidebar';
import PlanningDashboard from './components/PlanningDashboard';
import AnnualPlanningDashboard from './components/AnnualPlanningDashboard';
import PricingCalculator from './components/PricingCalculator';
import TacticalTracking from './components/TacticalTracking';
import MainDashboard from './components/MainDashboard';
import ControlPanel from './components/ControlPanel';
import IntegrationsFunctional from './components/IntegrationsFunctional';
import Settings from './components/Settings';
import Toast from './components/Toast';
import ReportsDashboard from './components/ReportsDashboard';
import ProductDetailsModal from './components/ProductDetailsModal';
import { MenuIcon, CheckCircleIcon, RefreshIcon } from './components/icons';
import ThemeToggle from './components/ThemeToggle';
import { 
    PlanningInputs, PlanningResults, PricingInputs, PricingResults, 
    DailyActuals, AccumulatedResults, PaymentBreakdown, 
    DashboardData, DailyProfit, 
    ExecutiveSummaryData, ArchivedReport, ProductSale, DailyData,
    ShopifyProduct,
    ShipmentDetail, ShipmentStatus, DailyLogistics, GranularGoalData,
    FinanceReport, PaymentsReport, ComparisonReport, ComparisonRow,
    AnnualPlan,
    OpexCategory,
    AnnualPlanActuals,
    AnnualPlanScenario,
    AnnualPlanOpexCategoryDetail
} from './types';
import { formatDate, subDays, getDateRangeForPreset, formatPercentage, formatCurrency } from './utils/formatting';
import { saveAnnualPlan, getAnnualPlan } from './services/annualPlanService';
import { savePlanningGoals, getPlanningGoals } from './services/planningGoalsService';
import CategoryDetailModal from './components/CategoryDetailModal';

type IntegrationStatus = 'connected' | 'disconnected' | 'connecting';
type ToastMessage = { message: string; type: 'success' | 'error' };

const initialAnnualPlan: AnnualPlan = {
    year: new Date().getFullYear(),
    activeScenario: 'Base',
    status: 'rascunho',
    version: 1,
    effective_from: `${new Date().getFullYear()}-01`,
    scenarios: {
        'Base': {
            opex: {
                aluguel: { subItems: [{id: '1', name: 'Escritório', value: 18000}], monthlyOverrides: Array(12).fill(null), seasonalWeights: Array(12).fill(1/12), owner: 'Financeiro' },
                internet: { subItems: [{id: '1', name: 'Link Fibra', value: 1800}], monthlyOverrides: Array(12).fill(null), seasonalWeights: Array(12).fill(1/12), owner: 'TI' },
                aplicativos: { subItems: [
                    {id: '1', name: 'Shopify Plus', value: 2400},
                    {id: '2', name: 'Klaviyo', value: 1800},
                    {id: '3', name: 'Outros', value: 1800},
                ], monthlyOverrides: Array(12).fill(null), seasonalWeights: Array(12).fill(1/12), owner: 'TI' },
                funcionarios: { subItems: [{id: '1', name: 'Salários + Encargos', value: 84000}], monthlyOverrides: Array(12).fill(null), seasonalWeights: Array(12).fill(1/12), owner: 'RH' },
                outros: { subItems: [{id: '1', name: 'Despesas Gerais', value: 3000}], monthlyOverrides: Array(12).fill(null), seasonalWeights: Array(12).fill(1/12), owner: 'Financeiro' },
            },
            notes: 'Premissas iniciais para o plano base...',
            planPercentages: { tax: 6.0, checkout: 2.5, gateway: 4.99, platform: 1.5, iof: 0.38, shipping: 5.0 },
            assumptions: { projectedRevenue: 600000, projectedOrders: 1542, runwayMonths: 12, opexToRevenueTarget: 22 },
        },
        'Corte de Gastos': { opex: {} as Record<OpexCategory, AnnualPlanOpexCategoryDetail>, notes: '', planPercentages: {} as any, assumptions: {} as any },
        'Aposta de Crescimento': { opex: {} as Record<OpexCategory, AnnualPlanOpexCategoryDetail>, notes: '', planPercentages: {} as any, assumptions: {} as any }
    }
};



const App: React.FC = () => {
  const { user } = useAuth();
  type ActiveTab = 'dashboard' | 'control_panel' | 'planning' | 'annual_planning' | 'pricing' | 'tracking' | 'reports' | 'data' | 'settings';
  const [activeTab, setActiveTab] = useState<ActiveTab>('annual_planning');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTransitioningOut, setIsTransitioningOut] = useState(false);
  const mainContentRef = useRef<HTMLElement>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Carregar dados do Supabase
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      // Carregar metas de planejamento
      const goals = await getPlanningGoals(user.id);
      if (goals) {
        setPlanningInputs(goals);
      }

      // Carregar plano anual
      const currentYear = new Date().getFullYear();
      const plan = await getAnnualPlan(user.id, currentYear);
      if (plan) {
        setAnnualPlan(plan);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Salvar metas quando mudarem
  useEffect(() => {
    if (user) {
      const timeoutId = setTimeout(() => {
        savePlanningGoals(user.id, planningInputs).catch(console.error);
      }, 1000); // Debounce de 1 segundo
      return () => clearTimeout(timeoutId);
    }
  }, [planningInputs, user]);

  // Salvar plano anual quando mudar
  useEffect(() => {
    if (user) {
      const timeoutId = setTimeout(() => {
        saveAnnualPlan(user.id, annualPlan).catch(console.error);
      }, 1000); // Debounce de 1 segundo
      return () => clearTimeout(timeoutId);
    }
  }, [annualPlan, user]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const [planningInputs, setPlanningInputs] = useState<PlanningInputs>({
    revenueGoal: 50000, conversionRate: 1.05, avgTicket: 389, avgProductCost: 35,
    checkoutFee: 1.00, paymentGatewayFee: 6.99, taxRate: 8.00, marketingSpendPercentage: 25.00,
  });

  const [annualPlan, setAnnualPlan] = useState<AnnualPlan>(initialAnnualPlan);
  const [previousYearOpex] = useState({
      aluguel: 12000,
      internet: 1200,
      aplicativos: 3600,
      funcionarios: 60000,
      outros: 5000
  });
  
  const [annualPlanActuals, setAnnualPlanActuals] = useState<AnnualPlanActuals>(() => {
    const monthly: Partial<Record<OpexCategory, number[]>> = {};
    const categories: OpexCategory[] = ['aluguel', 'internet', 'aplicativos', 'funcionarios', 'outros'];
    const currentMonth = new Date().getMonth();
    categories.forEach(cat => {
        monthly[cat] = Array(12).fill(0).map((_, i) => {
            if (i > currentMonth) return 0; // No actuals for future months
            const baseAnnual = initialAnnualPlan.scenarios.Base.opex[cat].subItems.reduce((sum, item) => sum + item.value, 0);
            const base = baseAnnual / 12;
            return base * (0.8 + Math.random() * 0.4); // Simulate some variance
        });
    });
    return {
        year: new Date().getFullYear(),
        monthly,
    };
});


  const [pricingInputs, setPricingInputs] = useState<PricingInputs>({
    productName: 'Nome do Produto', baseProductCost: 170.00, sitePrice: 425.00, checkoutFee: 2.50,
    iofFee: 0.38, shopifyFee: 0.00, gatewayFee: 5.99, errorMarginFee: 5.00, taxFee: 6.00, marketingFee: 25.00,
  });
  
  const [actuals, setActuals] = useState<DailyData[]>(() => {
    const data: DailyData[] = [];
    const productNames = ["Moletom com Capuz", "Tênis Esportivo", "Calça Jeans Slim", "Camiseta Básica", "Boné Trucker", "Óculos de Sol"];
    
    for (let i = 0; i < 90; i++) {
        const date = subDays(new Date(), i);
        const dailyRevenueGoal = Math.random() * 3000 + 1000;
        
        const products: ProductSale[] = [];
        let totalRevenue = 0;
        let totalOrders = 0;
        const numProductsSold = Math.floor(Math.random() * 3) + 1;

        for(let j=0; j < numProductsSold; j++) {
            const productName = productNames[(i + j) % productNames.length];
            const productRevenue = (dailyRevenueGoal / numProductsSold) * (0.8 + Math.random() * 0.4);
            const productCost = productRevenue * (0.30 + Math.random() * 0.15);
            const productOrders = Math.max(1, Math.round(productRevenue / (350 + (Math.random() - 0.5) * 100)));
            products.push({ name: productName, revenue: productRevenue, cost: productCost, orders: productOrders });
            totalRevenue += productRevenue;
            totalOrders += productOrders;
        }

        const newCustomers = Math.floor(totalRevenue / (Math.random() * 200 + 400)) + Math.floor(Math.random() * 3);
        const returningCustomerRatio = 0.2 + Math.random() * 0.2;
        const returningCustomerRevenue = totalRevenue * returningCustomerRatio;
        const returningCustomerOrders = Math.round(totalOrders * returningCustomerRatio);
        
        const cardPortion = 0.55 + (Math.random() - 0.5) * 0.1;
        const boletoPortion = 0.25 + (Math.random() - 0.5) * 0.1;
        const pixPortion = 1 - cardPortion - boletoPortion;

        const cardRevenue = totalRevenue * cardPortion;
        const boletoRevenue = totalRevenue * boletoPortion;
        const pixRevenue = totalRevenue * pixPortion;

        const paymentBreakdown: PaymentBreakdown = {
            card: {
                approved: { value: cardRevenue, count: Math.round(cardRevenue / 180) || 1 },
                in_analysis: { value: 0, count: 0 },
                other: { value: 0, count: 0 },
            },
            boleto: {
                approved: { value: boletoRevenue * 0.77, count: Math.max(1, Math.round(boletoRevenue * 0.77 / 150)) },
                pending: { value: boletoRevenue * 0.23, count: Math.max(1, Math.round(boletoRevenue * 0.23 / 150)) },
                compensated: { value: 0, count: 0 },
            },
            pix: {
                approved: { value: pixRevenue * 0.60, count: Math.max(1, Math.round(pixRevenue * 0.60 / 120)) },
                pending: { value: pixRevenue * 0.40, count: Math.max(1, Math.round(pixRevenue * 0.40 / 120)) },
                cancelled: { value: 0, count: 0 },
            }
        };

        const numShipments = Math.floor(Math.random() * 8) + 2;
        const shipments: ShipmentDetail[] = [];
        const statuses: ShipmentStatus[] = ['entregue', 'em_transito', 'devolvido', 'taxado', 'pendente', 'falha', 'atrasado', 'sem_atualizacao', 'aguardando_retirada', 'sem_rastreio'];
        const carriers = ['Correios', 'Jadlog', 'Sequoia', 'FedEx'];

        for (let k = 0; k < numShipments; k++) {
            const creationD = new Date(date);
            creationD.setDate(creationD.getDate() - (Math.floor(Math.random() * 3)));
            const shippingD = new Date(creationD);
            shippingD.setDate(shippingD.getDate() + (Math.floor(Math.random() * 2) + 1));
            const deliveryD = new Date(shippingD);
            deliveryD.setDate(deliveryD.getDate() + (Math.floor(Math.random() * 15) + 5));
            
            const status = statuses[Math.floor(Math.random() * statuses.length)];

            shipments.push({
                orderId: `BR${Math.floor(100000000 + Math.random() * 900000000)}`,
                status: status,
                origin: Math.random() > 0.3 ? 'Brasil' : 'China',
                carrier: carriers[Math.floor(Math.random() * carriers.length)],
                cost: Math.random() * 30 + 15,
                creationDate: formatDate(creationD),
                shippingDate: formatDate(shippingD),
                arrivalInBrazilDate: null,
                customsEntryDate: null,
                customsExitDate: null,
                deliveryDate: status === 'entregue' ? formatDate(deliveryD) : null,
                customsStatus: 'clear',
                failureReason: status === 'falha' ? 'Endereço incorreto' : null,
                product: {
                    name: productNames[(i+k) % productNames.length],
                    quantity: 1,
                    imageUrl: `https://picsum.photos/seed/${i+k}/150`
                },
                customer: {
                    name: `Cliente ${i}${k}`,
                    address: 'Rua Fictícia, 123, Cidade, Estado'
                }
            });
        }
        const dailyLogistics: DailyLogistics = { shipments };

        data.push({
            date: formatDate(date),
            sessions: Math.floor(Math.random() * 1500) + 500,
            revenue: totalRevenue,
            marketingSpend: Math.random() * 600 + 150,
            newCustomers: newCustomers,
            products: products,
            paymentBreakdown,
            returningCustomerRevenue,
            returningCustomerOrders,
            logistics: dailyLogistics,
        });
    }
    return data;
  });
  
  const [shopifyProducts, setShopifyProducts] = useState<ShopifyProduct[]>([]);

  useEffect(() => {
      if (actuals.length > 0 && shopifyProducts.length === 0) {
          const uniqueProducts = new Map<string, ShopifyProduct>();
          actuals.forEach(day => {
              day.products.forEach(prod => {
                  if (!uniqueProducts.has(prod.name)) {
                      uniqueProducts.set(prod.name, {
                          id: prod.name.toLowerCase().replace(/\s+/g, '-'),
                          name: prod.name,
                          imageUrl: `https://picsum.photos/seed/${prod.name}/150`,
                          salePrice: prod.orders > 0 ? prod.revenue / prod.orders : 0,
                          cost: prod.orders > 0 ? prod.cost / prod.orders : 0
                      });
                  }
              });
          });
          setShopifyProducts(Array.from(uniqueProducts.values()));
      }
  }, []);

  const [activeDateFilter, setActiveDateFilter] = useState('thisMonth');
  const [dateRange, setDateRange] = useState(getDateRangeForPreset('thisMonth'));
  const [integrations, setIntegrations] = useState({ meta: 'connected' as IntegrationStatus, google: 'disconnected' as IntegrationStatus, shopify: 'connected' as IntegrationStatus });
  const [defaultTaxes, setDefaultTaxes] = useState({ paymentGatewayFee: 6.99, taxRate: 8.00, checkoutFee: 1.00 });
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const [isSyncing, setIsSyncing] = useState({ shopify: false, ads: false });
  const [trackingDisplayDate, setTrackingDisplayDate] = useState(new Date());
  const [archivedReports, setArchivedReports] = useState<ArchivedReport[]>([]);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<ShopifyProduct | null>(null);
  const [isProductDetailsModalOpen, setIsProductDetailsModalOpen] = useState(false);
  
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };
  
  const handleDateFilterChange = (preset: string, customRange?: { start: Date; end: Date }) => {
      setActiveDateFilter(preset);
      setDateRange(getDateRangeForPreset(preset, customRange));
  };
  
  const handleTabChange = (tab: ActiveTab) => {
    if (tab !== activeTab) {
        setIsTransitioningOut(true);
        setTimeout(() => {
            setActiveTab(tab);
            setIsTransitioningOut(false);
            if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
        }, 150);
    }
  };

  const handlePlanningInputChange = (name: keyof PlanningInputs, value: number) => setPlanningInputs((prev) => ({ ...prev, [name]: value }));
  const handlePricingInputChange = (name: keyof PricingInputs, value: number | string) => setPricingInputs((prev) => ({ ...prev, [name]: value }));
  
  const handleActualsChange = useCallback((date: string, field: keyof DailyActuals, value: number | null) => {
      setActuals(prevActuals => {
          const index = prevActuals.findIndex(a => a.date === date);
          if (index >= 0) {
              const newActuals = [...prevActuals];
              newActuals[index] = { ...newActuals[index], [field]: value };
              return newActuals;
          }
          return prevActuals;
      });
  }, []);

  const handleProductCostChange = (productId: string, newCost: number) => {
      setShopifyProducts(prev => prev.map(p => p.id === productId ? { ...p, cost: newCost } : p));
  };
  
  const handleViewProductDetails = (product: ShopifyProduct) => {
      setSelectedProductForDetails(product);
      setIsProductDetailsModalOpen(true);
  };

  const safeDivide = (numerator: number, denominator: number): number => {
    if (denominator === 0 || isNaN(denominator) || !isFinite(denominator)) return 0;
    return numerator / denominator;
  };

    const monthlyRevenues = useMemo(() => {
        const revenues = Array(12).fill(0);
        actuals.forEach(day => {
            const date = new Date(day.date + 'T00:00:00');
            const month = date.getUTCMonth();
            const b = day.paymentBreakdown;
            const netRevenueDaily = (b.card.approved.value || 0) + (b.boleto.approved.value || 0) + (b.pix.approved.value || 0);
            revenues[month] += netRevenueDaily;
        });
        return revenues;
    }, [actuals]);
  
  const { accumulatedActuals, dashboardData, rankedProducts, paymentMethodsData, generatedReports } = useMemo(() => {
    const startStr = formatDate(dateRange.start);
    const endStr = formatDate(dateRange.end);
    const filteredActuals = actuals.filter(a => a.date >= startStr && a.date <= endStr);
    
    const duration = (dateRange.end.getTime() - dateRange.start.getTime());
    const prevEnd = subDays(dateRange.start, 1);
    const prevStart = new Date(prevEnd.getTime() - duration);
    const prevStartStr = formatDate(prevStart);
    const prevEndStr = formatDate(prevEnd);
    const prevFilteredActuals = actuals.filter(a => a.date >= prevStartStr && a.date <= prevEndStr);

    // --- CORE METRICS CALCULATION (Based on Dictionary) ---
    const calculateMetrics = (data: DailyData[]): DashboardData => {
        const baseMetrics = data.reduce((acc, day) => {
            const b = day.paymentBreakdown;
            // 1. Net Revenue (Receita Líquida) - sourced from approved payments
            const netRevenueDaily = (b.card.approved.value || 0) + (b.boleto.approved.value || 0) + (b.pix.approved.value || 0);
            
            // 2. Orders (Pedidos) - sourced from approved payments count
            const ordersCountDaily = (b.card.approved.count || 0) + (b.boleto.approved.count || 0) + (b.pix.approved.count || 0);
            
            // 3. COGS - estimated based on approved revenue ratio if daily revenue > 0
            const totalDailyRevenue = day.revenue ?? 0;
            const dayTotalCogs = day.products.reduce((sum, p) => sum + p.cost, 0);
            const cogsDaily = totalDailyRevenue > 0 ? dayTotalCogs * (netRevenueDaily / totalDailyRevenue) : 0;

            // 4. Marketing - direct input
            const marketingDaily = day.marketingSpend ?? 0;

            // 5. Fees (Taxas) - estimated based on standard rates
            const feesDaily = netRevenueDaily * ((planningInputs.checkoutFee + planningInputs.paymentGatewayFee + planningInputs.taxRate) / 100);

            acc.netRevenue += netRevenueDaily;
            acc.ordersCount += ordersCountDaily;
            acc.totalCogs += cogsDaily;
            acc.totalMarketing += marketingDaily;
            acc.totalFees += feesDaily;
            acc.sessions += day.sessions ?? 0;

            // Pending for operational view
            acc.pendingOrdersValue += (b.boleto.pending.value || 0) + (b.pix.pending.value || 0);
            acc.pendingOrdersCount += (b.boleto.pending.count || 0) + (b.pix.pending.count || 0);

            return acc;
        }, { 
            netRevenue: 0, ordersCount: 0, totalCogs: 0, totalMarketing: 0, totalFees: 0, sessions: 0,
            pendingOrdersValue: 0, pendingOrdersCount: 0
        });
        
        // 6. Contribution Margin (Margem de Contribuição) = Net Revenue - COGS - Marketing - Fees
        const contributionMargin = baseMetrics.netRevenue - baseMetrics.totalCogs - baseMetrics.totalMarketing - baseMetrics.totalFees;
        const contributionMarginPercent = safeDivide(contributionMargin, baseMetrics.netRevenue) * 100;

        // 7. Fixed Costs (Custos Fixos) - Sourced from annual plan
        const month = dateRange.start.getUTCMonth();
        const activeScenarioData = annualPlan.scenarios[annualPlan.activeScenario];
        const fixedCosts = (Object.keys(activeScenarioData.opex) as OpexCategory[]).reduce((total, catKey) => {
            const cat = activeScenarioData.opex[catKey];
            const annualValue = cat.subItems.reduce((sum, item) => sum + item.value, 0);
            const monthlyValue = cat.monthlyOverrides[month] ?? annualValue * cat.seasonalWeights[month];
            return total + monthlyValue;
        }, 0);

        // 8. Net Profit (Lucro Líquido) = Contribution Margin - Fixed Costs
        const netProfit = contributionMargin - fixedCosts;
        const netProfitMargin = safeDivide(netProfit, baseMetrics.netRevenue) * 100;

        // Efficiency KPIs
        const roas = safeDivide(baseMetrics.netRevenue, baseMetrics.totalMarketing);
        const cpa = safeDivide(baseMetrics.totalMarketing, baseMetrics.ordersCount);
        const avgTicket = safeDivide(baseMetrics.netRevenue, baseMetrics.ordersCount);
        
        return {
            ...baseMetrics,
            contributionMargin,
            contributionMarginPercent,
            fixedCosts,
            netProfit,
            netProfitMargin,
            roas,
            cpa,
            avgTicket,
            revenueGoal: planningInputs.revenueGoal,
            netProfitGoal: planningInputs.revenueGoal * 0.20, // Example: 20% net profit goal from revenue
            netRevenueChange: 0, contributionMarginChange: 0, netProfitChange: 0, roasChange: 0, cpaChange: 0, avgTicketChange: 0
        };
    };
    
    const currentMetrics = calculateMetrics(filteredActuals);
    const prevMetrics = calculateMetrics(prevFilteredActuals);

    const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };
    
    const accumulatedResult = filteredActuals.reduce((acc, day) => {
        acc.sessions += day.sessions ?? 0;
        acc.revenue += day.revenue ?? 0;
        acc.marketingSpend += day.marketingSpend ?? 0;
        acc.orders += day.products.reduce((sum, p) => sum + p.orders, 0);
        return acc;
    }, { sessions: 0, revenue: 0, marketingSpend: 0, orders: 0 });

    const accumulatedActuals: AccumulatedResults = {
        sessions: accumulatedResult.sessions,
        revenue: accumulatedResult.revenue,
        marketingSpend: accumulatedResult.marketingSpend,
        orders: accumulatedResult.orders,
        conversionRate: safeDivide(accumulatedResult.orders, accumulatedResult.sessions) * 100,
        avgTicket: safeDivide(accumulatedResult.revenue, accumulatedResult.orders),
        cps: safeDivide(accumulatedResult.marketingSpend, accumulatedResult.sessions),
    };

    const aggregatedPayments = filteredActuals.reduce((acc, day) => {
        const b = day.paymentBreakdown;
        acc.card.approved.value += b.card.approved.value; acc.card.approved.count += b.card.approved.count;
        acc.boleto.approved.value += b.boleto.approved.value; acc.boleto.approved.count += b.boleto.approved.count;
        acc.pix.approved.value += b.pix.approved.value; acc.pix.approved.count += b.pix.approved.count;
        acc.boleto.pending.value += b.boleto.pending.value; acc.boleto.pending.count += b.boleto.pending.count;
        acc.pix.pending.value += b.pix.pending.value; acc.pix.pending.count += b.pix.pending.count;
        
        // For reports
        acc.card.rejected = (acc.card.rejected || 0) + (b.card.other.count || 0); // approximation
        acc.boleto.rejected = (acc.boleto.rejected || 0); // Assuming 0 for now if not explicitly tracked in DailyData
        acc.pix.rejected = (acc.pix.rejected || 0) + (b.pix.cancelled.count || 0);

        return acc;
    }, {
        card: { approved: { value: 0, count: 0 }, pending: { value: 0, count: 0 }, conversion: 0, rejected: 0 },
        boleto: { approved: { value: 0, count: 0 }, pending: { value: 0, count: 0 }, conversion: 0, rejected: 0 },
        pix: { approved: { value: 0, count: 0 }, pending: { value: 0, count: 0 }, conversion: 0, rejected: 0 },
    });

    const cardTotalCount = aggregatedPayments.card.approved.count + aggregatedPayments.card.rejected;
    aggregatedPayments.card.conversion = safeDivide(aggregatedPayments.card.approved.count, cardTotalCount) * 100;

    const boletoTotalCount = aggregatedPayments.boleto.approved.count + aggregatedPayments.boleto.pending.count + aggregatedPayments.boleto.rejected;
    aggregatedPayments.boleto.conversion = safeDivide(aggregatedPayments.boleto.approved.count, boletoTotalCount) * 100;
    
    const pixTotalCount = aggregatedPayments.pix.approved.count + aggregatedPayments.pix.pending.count + aggregatedPayments.pix.rejected;
    aggregatedPayments.pix.conversion = safeDivide(aggregatedPayments.pix.approved.count, pixTotalCount) * 100;
    
    const productPerformance = new Map<string, { revenue: number; cost: number }>();
    filteredActuals.forEach(day => {
        day.products.forEach(product => {
            const existing = productPerformance.get(product.name) ?? { revenue: 0, cost: 0 };
            productPerformance.set(product.name, {
                revenue: existing.revenue + product.revenue,
                cost: existing.cost + product.cost,
            });
        });
    });

    const rankedProducts = Array.from(productPerformance.entries())
        .map(([name, data]) => ({ name, profit: data.revenue - data.cost }))
        .sort((a, b) => b.profit - a.profit);

    // --- GENERATE STRICT REPORTS ---
    
    // 1. Finance Report Calculations
    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);
    const daysInMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0).getDate();
    const currentDay = todayDate.getDate();
    
    // Calculate Burn-down lines properly
    let accumulatedTarget = 0;
    let accumulatedActual = 0;
    const line_expected = [];
    const line_actual = [];
    const dailyTarget = planningInputs.revenueGoal / daysInMonth;

    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(todayDate.getFullYear(), todayDate.getMonth(), i);
        const dateStr = formatDate(date);
        accumulatedTarget += dailyTarget;
        line_expected.push({ date: dateStr, value: accumulatedTarget });

        if (date <= todayDate) {
            // Find actuals for this specific day to accumulate
            const dayData = actuals.find(d => d.date === dateStr);
            if (dayData) {
                 const b = dayData.paymentBreakdown;
                 accumulatedActual += (b.card.approved.value || 0) + (b.boleto.approved.value || 0) + (b.pix.approved.value || 0);
            }
            line_actual.push({ date: dateStr, value: accumulatedActual });
        }
    }

    // Determine status based on tolerance (e.g., 5%)
    const expectedToday = dailyTarget * currentDay;
    const statusRatio = safeDivide(accumulatedActual, expectedToday);
    let burnDownStatus: "ahead" | "on_track" | "behind" = "on_track";
    if (statusRatio >= 1.05) burnDownStatus = "ahead";
    else if (statusRatio < 0.95) burnDownStatus = "behind";

    const financeReport: FinanceReport = {
        period: activeDateFilter === 'thisMonth' ? formatDate(new Date()).slice(0,7) : 'custom',
        goal: {
            metric: "faturamento", // Using Faturamento as the main goal for now based on input
            value: planningInputs.revenueGoal,
            achieved: currentMetrics.netRevenue,
            progress_pct: safeDivide(currentMetrics.netRevenue, planningInputs.revenueGoal) * 100
        },
        waterfall: {
            receita_liquida: currentMetrics.netRevenue,
            cogs: currentMetrics.totalCogs,
            marketing: currentMetrics.totalMarketing,
            taxas: currentMetrics.totalFees,
            frete_subsidiado: 0, // Not currently tracked
            margem_contribuicao: currentMetrics.contributionMargin,
            custos_fixos: currentMetrics.fixedCosts,
            lucro_liquido: currentMetrics.netProfit
        },
        percent_of_revenue: {
            cogs: safeDivide(currentMetrics.totalCogs, currentMetrics.netRevenue) * 100,
            marketing: safeDivide(currentMetrics.totalMarketing, currentMetrics.netRevenue) * 100,
            taxas: safeDivide(currentMetrics.totalFees, currentMetrics.netRevenue) * 100,
            frete_subsidiado: 0,
            margem_contribuicao: currentMetrics.contributionMarginPercent
        },
        top_movers: {
            sku: rankedProducts.slice(0, 3).map(p => ({ sku: p.name, delta_lucro: p.profit })),
            campaign: [] // Placeholder as campaign granularity is not yet available in DailyData
        },
        burn_down: {
            line_expected,
            line_actual,
            remaining: Math.max(0, planningInputs.revenueGoal - currentMetrics.netRevenue),
            status: burnDownStatus
        },
        ui: {
            title: "De Receita a Lucro — Explicado",
            subtitle: "Veja onde a margem é criada ou destruída.",
            footer: `Margem de Contribuição: ${formatPercentage(currentMetrics.contributionMarginPercent)} • Lucro Líquido: ${formatCurrency(currentMetrics.netProfit)}`,
            badges: { updated: "Dados atualizados há 37 min" }
        },
        flags: { partial: false, missing: [] }
    };

    // 2. Payments Report
    const paymentsReport: PaymentsReport = {
        period: activeDateFilter,
        approval: {
            cartao: { approved: aggregatedPayments.card.approved.count, pending: aggregatedPayments.card.pending.count, rejected: aggregatedPayments.card.rejected },
            pix: { approved: aggregatedPayments.pix.approved.count, pending: aggregatedPayments.pix.pending.count, rejected: aggregatedPayments.pix.rejected },
            boleto: { approved: aggregatedPayments.boleto.approved.count, pending: aggregatedPayments.boleto.pending.count, rejected: aggregatedPayments.boleto.rejected }
        },
        rates: {
            cartao_approval_pct: aggregatedPayments.card.conversion,
            pix_approval_pct: aggregatedPayments.pix.conversion,
            boleto_approval_pct: aggregatedPayments.boleto.conversion
        },
        fees_effective: {
            gateway_pct: planningInputs.paymentGatewayFee,
            platform_pct: planningInputs.checkoutFee, // approximating platform fee as checkout fee
            iof_pct: 0.38 // standard IOF
        },
        reconciliation: {
             orders_approved: currentMetrics.ordersCount,
             payments_approved: currentMetrics.ordersCount, // Assuming perfect sync for demo
             delta_pct: 0,
             alert: false
        },
        ui: {
            title: `Aprovação por Meio (${activeDateFilter})`,
            subtitle: "Aprovados | Pendentes | Reprovados • Fonte: gateway",
            notes: ["Dados de gateway podem estar em D+1."]
        },
        flags: { partial: false, missing: [] }
    };

    // 3. Comparison Report
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = subDays(today, 1);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = subDays(today, today.getDay()); // Sunday as start
    
    const getMetricsForRange = (start: Date, end: Date): DashboardData => {
        const s = formatDate(start); const e = formatDate(end);
        return calculateMetrics(actuals.filter(a => a.date >= s && a.date <= e));
    }

    const dataYesterday = getMetricsForRange(yesterday, yesterday);
    const dataWTD = getMetricsForRange(startOfWeek, today);
    const dataMTD = getMetricsForRange(startOfMonth, today);

    // Targets (pro-rated)
    const targetDaily = planningInputs.revenueGoal / daysInMonth;
    
    const daysWTD = Math.max(1, Math.floor((today.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const daysMTD = today.getDate();

    const targetYesterday = targetDaily;
    const targetWTD = targetDaily * daysWTD;
    const targetMTD = targetDaily * daysMTD;

    const getStatus = (actual: number, target: number): "green" | "amber" | "red" => {
        const ratio = actual / target;
        if (ratio >= 1) return "green";
        if (ratio >= 0.9) return "amber";
        return "red";
    }

    const comparisonReport: ComparisonReport = {
        periods: ["D-1 (Ontem)", "WTD (Semana)", "MTD (Mês)"],
        table: [
            { kpi: "Faturamento Aprovado", period: "D-1", plan: targetYesterday, actual: dataYesterday.netRevenue, meta: targetYesterday, delta: dataYesterday.netRevenue - targetYesterday, status: getStatus(dataYesterday.netRevenue, targetYesterday) },
            { kpi: "Faturamento Aprovado", period: "WTD", plan: targetWTD, actual: dataWTD.netRevenue, meta: targetWTD, delta: dataWTD.netRevenue - targetWTD, status: getStatus(dataWTD.netRevenue, targetWTD) },
            { kpi: "Faturamento Aprovado", period: "MTD", plan: targetMTD, actual: dataMTD.netRevenue, meta: targetMTD, delta: dataMTD.netRevenue - targetMTD, status: getStatus(dataMTD.netRevenue, targetMTD) },
            // Add more rows as needed based on dictionary
        ],
        ui: {
            title: "Planejado vs. Realizado",
            subtitle: "Status por período e Δ vs. meta de Faturamento.",
            export: ["csv", "pdf"]
        },
        flags: { partial: false, missing: [] }
    };
        
    return {
        accumulatedActuals,
        dashboardData: {
            ...currentMetrics,
            netRevenueChange: calculateChange(currentMetrics.netRevenue, prevMetrics.netRevenue),
            contributionMarginChange: calculateChange(currentMetrics.contributionMargin, prevMetrics.contributionMargin),
            netProfitChange: calculateChange(currentMetrics.netProfit, prevMetrics.netProfit),
            roasChange: calculateChange(currentMetrics.roas, prevMetrics.roas),
            cpaChange: calculateChange(currentMetrics.cpa, prevMetrics.cpa),
            avgTicketChange: calculateChange(currentMetrics.avgTicket, prevMetrics.avgTicket),
        },
        paymentMethodsData: aggregatedPayments,
        rankedProducts: rankedProducts.slice(0, 3),
        generatedReports: { financeReport, paymentsReport, comparisonReport }
    };
  }, [actuals, planningInputs, dateRange, annualPlan]);

    const granularGoalData = useMemo<GranularGoalData>(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const monthlyGoal = planningInputs.revenueGoal;
        const weeklyGoal = monthlyGoal / 4;
        
        const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const dailyGoal = safeDivide(monthlyGoal, daysInCurrentMonth);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfMonthStr = formatDate(startOfMonth);

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const startOfWeekStr = formatDate(startOfWeek);
        
        const todayStr = formatDate(today);

        const calculateApprovedRevenue = (data: DailyData[]): number => {
            return data.reduce((sum, day) => {
                const b = day.paymentBreakdown;
                const approvedDaily = (b.card.approved.value || 0) + (b.boleto.approved.value || 0) + (b.pix.approved.value || 0);
                return sum + approvedDaily;
            }, 0);
        };

        const monthlyActuals = actuals.filter(a => a.date >= startOfMonthStr && a.date <= todayStr);
        const monthlyAchieved = calculateApprovedRevenue(monthlyActuals);
        
        const weeklyActuals = actuals.filter(a => a.date >= startOfWeekStr && a.date <= todayStr);
        const weeklyAchieved = calculateApprovedRevenue(weeklyActuals);
        
        const dailyActuals = actuals.filter(a => a.date === todayStr);
        const dailyAchieved = calculateApprovedRevenue(dailyActuals);

        return {
            day: {
                goal: dailyGoal,
                achieved: dailyAchieved,
                progress: safeDivide(dailyAchieved, dailyGoal) * 100,
            },
            week: {
                goal: weeklyGoal,
                achieved: weeklyAchieved,
                progress: safeDivide(weeklyAchieved, weeklyGoal) * 100,
            },
            month: {
                goal: monthlyGoal,
                achieved: monthlyAchieved,
                progress: safeDivide(monthlyAchieved, monthlyGoal) * 100,
            }
        };
    }, [actuals, planningInputs.revenueGoal]);

    const planningResults = useMemo<PlanningResults>(() => {
        const { revenueGoal, conversionRate, avgTicket, avgProductCost, checkoutFee, paymentGatewayFee, taxRate, marketingSpendPercentage } = planningInputs;
        
        const orders = safeDivide(revenueGoal, avgTicket);
        const sessions = safeDivide(orders, (conversionRate / 100));
        const adSpend = revenueGoal * (marketingSpendPercentage / 100);
        const cps = safeDivide(adSpend, sessions);
        const roas = safeDivide(revenueGoal, adSpend);
        
        const totalProductCost = revenueGoal * (avgProductCost / 100);
        const otherFees = revenueGoal * ((checkoutFee + paymentGatewayFee + taxRate) / 100);
        const totalCosts = totalProductCost + otherFees + adSpend;
        const contributionMargin = revenueGoal - totalCosts;
        const idealCpa = safeDivide(contributionMargin, orders);
        const profitMargin = safeDivide(contributionMargin, revenueGoal) * 100;

        return { revenue: revenueGoal, orders, sessions, adSpend, cps, roas, idealCpa, contributionMargin, profitMargin };
    }, [planningInputs]);
    
    const pricingResults = useMemo<PricingResults>(() => {
        const { baseProductCost, sitePrice, checkoutFee, iofFee, shopifyFee, gatewayFee, errorMarginFee, taxFee, marketingFee } = pricingInputs;

        const fixedCostsPercentage = checkoutFee + iofFee + shopifyFee + gatewayFee + errorMarginFee + taxFee;
        const fixedCostsValue = sitePrice * (fixedCostsPercentage / 100);
        const marketingValue = sitePrice * (marketingFee / 100);
        const totalOperationalCost = baseProductCost + fixedCostsValue + marketingValue;
        const finalProfit = sitePrice - totalOperationalCost;
        const finalProfitPercentage = safeDivide(finalProfit, sitePrice) * 100;
        const maxCpa = finalProfit;
        const currentMarkup = safeDivide(sitePrice, baseProductCost);
        const recommendedPrice = baseProductCost * 3;
        
        return { fixedCostsPercentage, fixedCostsValue, marketingValue, totalOperationalCost, finalProfit, finalProfitPercentage, maxCpa, currentMarkup, recommendedPrice };
    }, [pricingInputs]);

  const headerTitleMap: Record<ActiveTab, string> = {
      dashboard: "Financeiro",
      control_panel: "Painel de Controle",
      planning: "Planejamento de Metas",
      annual_planning: "Planejamento Anual (OPEX)",
      pricing: "Precificação",
      tracking: "Acompanhamento",
      reports: "Relatórios",
      data: "Dados",
      settings: "Configurações",
  };
  
  const dailyProfitData: DailyProfit[] = useMemo(() => {
    const startStr = formatDate(dateRange.start);
    const endStr = formatDate(dateRange.end);
    const filteredActuals = actuals.filter(a => a.date >= startStr && a.date <= endStr);

    return filteredActuals.map(day => {
        const totalDailyRevenue = day.revenue ?? 0;
        const b = day.paymentBreakdown;
        const approvedDailyRevenue = (b.card.approved.value || 0) + (b.boleto.approved.value || 0) + (b.pix.approved.value || 0);
        
        const dayTotalProductCost = day.products.reduce((sum, p) => sum + p.cost, 0);
        let approvedProductCost = 0;
        if (totalDailyRevenue > 0) {
            const approvalRate = safeDivide(approvedDailyRevenue, totalDailyRevenue);
            approvedProductCost = dayTotalProductCost * approvalRate;
        }

        const gatewayAndCheckoutCost = approvedDailyRevenue * ((planningInputs.checkoutFee + planningInputs.paymentGatewayFee) / 100);
        const taxCost = approvedDailyRevenue * (planningInputs.taxRate / 100);
        const fees = gatewayAndCheckoutCost + taxCost;
        
        const totalCost = approvedProductCost + fees + (day.marketingSpend ?? 0);
        // This profit matches Contribution Margin in the new terminology
        const profit = approvedDailyRevenue - totalCost;
        return { date: day.date, profit };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [actuals, dateRange, planningInputs]);
  
  const last7DaysProfit = dailyProfitData.slice(-7);


  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <MainDashboard 
                  dashboardData={dashboardData}
                  paymentMethodsData={paymentMethodsData}
                  granularGoalData={granularGoalData}
                  activeDateFilter={activeDateFilter}
                  handleDateFilterChange={handleDateFilterChange}
                  dateRange={dateRange}
                />;
      case 'control_panel': return <ControlPanel accumulatedActuals={accumulatedActuals} dashboardData={dashboardData} rankedProducts={rankedProducts} dailyProfitData={last7DaysProfit} />;
      case 'planning': return <PlanningDashboard inputs={planningInputs} results={planningResults} handleInputChange={handlePlanningInputChange} />;
      case 'annual_planning': return <AnnualPlanningDashboard plan={annualPlan} onPlanChange={setAnnualPlan} previousYearOpex={previousYearOpex} actuals={annualPlanActuals} monthlyRevenues={monthlyRevenues} />;
      case 'pricing': return <PricingCalculator inputs={pricingInputs} results={pricingResults} handleInputChange={handlePricingInputChange} shopifyProducts={shopifyProducts} onProductCostChange={handleProductCostChange} onViewProductDetails={handleViewProductDetails} dailyData={actuals} showToast={showToast} />;
      case 'tracking': return <TacticalTracking planningInputs={planningInputs} planningResults={planningResults} actuals={actuals} accumulatedActuals={accumulatedActuals} handleActualsChange={handleActualsChange} integrations={integrations} isSyncing={isSyncing} handleSyncShopify={() => {}} handleSyncAds={() => {}} dateRange={dateRange} displayDate={trackingDisplayDate} onMonthChange={() => {}} onArchive={() => {}} archivedReportIds={[]} />;
      case 'reports': return <ReportsDashboard reports={generatedReports} dashboardData={dashboardData} activeDateFilter={activeDateFilter} handleDateFilterChange={handleDateFilterChange} dateRange={dateRange} />;
      case 'data': return <IntegrationsFunctional />;
      case 'settings': return <Settings defaultTaxes={defaultTaxes} handleDefaultTaxesChange={() => {}} />;
      default: return <div>Página não encontrada</div>;
    }
  };

  return (
    <div className="flex h-screen bg-background dark:bg-slate-900 text-muted-foreground antialiased font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        isMobileOpen={isSidebarOpen} 
        setIsMobileOpen={setIsSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex-shrink-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(true)} className="text-muted-foreground hover:text-foreground lg:hidden">
                <MenuIcon className="w-6 h-6" />
            </button>
             <h1 className="text-lg font-headings font-bold text-foreground">{headerTitleMap[activeTab]}</h1>
             <div className="flex items-center text-xs text-muted-foreground border-l border-slate-200 dark:border-slate-700 ml-4 pl-4 hidden sm:flex space-x-3">
                <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green"></span>
                    </span>
                    <span className="font-medium text-foreground">Dados atualizados há 37 min</span>
                </div>
                <button className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium">
                    <RefreshIcon className="w-3.5 h-3.5" />
                    Reprocessar
                </button>
            </div>
          </div>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </header>

        <main
          ref={mainContentRef}
          className={`flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 transition-opacity duration-150 ease-in-out ${isTransitioningOut ? 'opacity-0' : 'opacity-100'}`}>
          {renderContent()}
        </main>
      </div>
      {isProductDetailsModalOpen && (
          <ProductDetailsModal
            isOpen={isProductDetailsModalOpen}
            onClose={() => setIsProductDetailsModalOpen(false)}
            product={selectedProductForDetails}
            dailyData={actuals}
          />
      )}
      {toastMessage && (
        <Toast message={toastMessage.message} type={toastMessage.type} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Login onSuccess={() => window.location.reload()} />;
  }

  return <App />;
};

const AppWithAuth: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default AppWithAuth;