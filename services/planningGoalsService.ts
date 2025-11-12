import { supabase, PlanningGoal } from '../lib/supabaseClient';
import { PlanningInputs } from '../types';

/**
 * Salva ou atualiza metas de planejamento
 */
export const savePlanningGoals = async (
  userId: string,
  inputs: PlanningInputs
): Promise<PlanningGoal> => {
  const goalData = {
    user_id: userId,
    revenue_goal: inputs.revenueGoal,
    conversion_rate: inputs.conversionRate,
    avg_ticket: inputs.avgTicket,
    avg_product_cost: inputs.avgProductCost,
    checkout_fee: inputs.checkoutFee,
    payment_gateway_fee: inputs.paymentGatewayFee,
    tax_rate: inputs.taxRate,
    marketing_spend_percentage: inputs.marketingSpendPercentage,
  };

  // Verificar se já existe uma meta para o usuário
  const { data: existing } = await supabase
    .from('planning_goals')
    .select('id')
    .eq('user_id', userId)
    .single();

  let result;
  if (existing) {
    // Atualizar
    const { data, error } = await supabase
      .from('planning_goals')
      .update(goalData)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    result = data;
  } else {
    // Inserir
    const { data, error } = await supabase
      .from('planning_goals')
      .insert(goalData)
      .select()
      .single();
    
    if (error) throw error;
    result = data;
  }

  return result;
};

/**
 * Obtém as metas de planejamento do usuário
 */
export const getPlanningGoals = async (userId: string): Promise<PlanningInputs | null> => {
  const { data, error } = await supabase
    .from('planning_goals')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Não encontrado
    throw error;
  }

  return {
    revenueGoal: data.revenue_goal,
    conversionRate: data.conversion_rate,
    avgTicket: data.avg_ticket,
    avgProductCost: data.avg_product_cost,
    checkoutFee: data.checkout_fee,
    paymentGatewayFee: data.payment_gateway_fee,
    taxRate: data.tax_rate,
    marketingSpendPercentage: data.marketing_spend_percentage,
  };
};
