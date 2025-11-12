import { supabase, AnnualPlanDB } from '../lib/supabaseClient';
import { AnnualPlan } from '../types';

/**
 * Salva ou atualiza um plano anual no Supabase
 */
export const saveAnnualPlan = async (
  userId: string,
  plan: AnnualPlan
): Promise<AnnualPlanDB> => {
  const planData = {
    user_id: userId,
    year: plan.year,
    active_scenario: plan.activeScenario,
    status: plan.status,
    version: plan.version,
    effective_from: plan.effective_from,
    scenarios: plan.scenarios,
  };

  const { data, error } = await supabase
    .from('annual_plans')
    .upsert(planData, {
      onConflict: 'user_id,year,version',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Obtém o plano anual do usuário para um ano específico
 */
export const getAnnualPlan = async (
  userId: string,
  year: number
): Promise<AnnualPlan | null> => {
  const { data, error } = await supabase
    .from('annual_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('year', year)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Não encontrado
    throw error;
  }

  return {
    year: data.year,
    activeScenario: data.active_scenario,
    status: data.status,
    version: data.version,
    effective_from: data.effective_from,
    scenarios: data.scenarios,
  };
};

/**
 * Lista todos os planos anuais do usuário
 */
export const listAnnualPlans = async (userId: string): Promise<AnnualPlanDB[]> => {
  const { data, error } = await supabase
    .from('annual_plans')
    .select('*')
    .eq('user_id', userId)
    .order('year', { ascending: false })
    .order('version', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Cria uma nova versão do plano anual
 */
export const createNewVersion = async (
  userId: string,
  plan: AnnualPlan
): Promise<AnnualPlanDB> => {
  // Buscar a versão mais recente
  const { data: latestPlan } = await supabase
    .from('annual_plans')
    .select('version')
    .eq('user_id', userId)
    .eq('year', plan.year)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  const newVersion = (latestPlan?.version || 0) + 1;

  return saveAnnualPlan(userId, {
    ...plan,
    version: newVersion,
  });
};

/**
 * Aprova um plano anual
 */
export const approveAnnualPlan = async (
  userId: string,
  planId: string
): Promise<void> => {
  const { error } = await supabase
    .from('annual_plans')
    .update({ status: 'aprovado' })
    .eq('id', planId)
    .eq('user_id', userId);

  if (error) throw error;
};

/**
 * Deleta um plano anual
 */
export const deleteAnnualPlan = async (
  userId: string,
  planId: string
): Promise<void> => {
  const { error } = await supabase
    .from('annual_plans')
    .delete()
    .eq('id', planId)
    .eq('user_id', userId);

  if (error) throw error;
};
