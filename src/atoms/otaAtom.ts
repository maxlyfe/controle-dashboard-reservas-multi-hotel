import { atom } from 'jotai';
import { supabase } from '../lib/supabase';

export interface OTA {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OTASales {
  id: string;
  sales_detail_id: string;
  ota_id: string;
  sales_amount: number;
  quantity: number;
  ota?: OTA;
}

// Base atoms
export const otasAtom = atom<OTA[]>([]);
export const otaSalesAtom = atom<OTASales[]>([]);

// Load OTAs from database
export const loadOTAs = async (): Promise<OTA[]> => {
  try {
    const { data, error } = await supabase
      .from('otas')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      // If table doesn't exist, return default OTAs
      if (error.code === '42P01') {
        console.warn('OTAs table not found, using default OTAs');
        return getDefaultOTAs();
      }
      throw error;
    }
    return data || [];
  } catch (error) {
    console.warn('Failed to load OTAs from database, using defaults:', error);
    return getDefaultOTAs();
  }
};

// Default OTAs fallback
const getDefaultOTAs = (): OTA[] => {
  const defaultNames = [
    'Booking', 'Decolar', 'HotelBeds', 'Tourmerd', 
    'Keytel', 'Planisfério', 'Expedia', 'Itaparica', 'Outros'
  ];
  
  return defaultNames.map((name, index) => ({
    id: `default-${index}`,
    name,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
};

// Load OTA sales from database
export const loadOTASales = async (): Promise<OTASales[]> => {
  try {
    const { data, error } = await supabase
      .from('ota_sales')
      .select('*, ota:ota_id(*)');
    
    if (error) {
      // If table doesn't exist, return empty array
      if (error.code === '42P01') {
        console.warn('OTA sales table not found, returning empty array');
        return [];
      }
      throw error;
    }
    return (data || []).map(item => ({
      id: item.id,
      sales_detail_id: item.sales_detail_id,
      ota_id: item.ota_id,
      sales_amount: item.sales_amount ?? 0,
      quantity: item.quantity ?? 0,
      ota: item.ota ? {
        id: item.ota.id,
        name: item.ota.name,
        is_active: item.ota.is_active,
        created_at: item.ota.created_at,
        updated_at: item.ota.updated_at
      } : undefined
    }));
  } catch (error) {
    console.warn('Failed to load OTA sales from database:', error);
    return [];
  }
};

// Create new OTA
export const createOTA = async (name: string): Promise<OTA> => {
  try {
    const { data, error } = await supabase
      .from('otas')
      .insert({ name: name.trim() })
      .select('*')
      .single();
    
    if (error) {
      if (error.code === '42P01') {
        throw new Error('Tabela de OTAs não encontrada. Execute as migrações do banco de dados.');
      }
      throw error;
    }
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao criar OTA');
  }
};

// Update OTA sales
export const upsertOTASales = async (
  salesDetailId: string,
  otaId: string,
  salesAmount: number,
  quantity: number
): Promise<OTASales> => {
  try {
    const { data, error } = await supabase
      .from('ota_sales')
      .upsert({
        sales_detail_id: salesDetailId,
        ota_id: otaId,
        sales_amount: salesAmount,
        quantity: quantity
      }, { onConflict: 'sales_detail_id, ota_id' })
      .select('*, ota:ota_id(*)')
      .single();
    
    if (error) {
      if (error.code === '42P01') {
        throw new Error('Tabela de vendas OTA não encontrada. Execute as migrações do banco de dados.');
      }
      throw error;
    }
    return {
      id: data.id,
      sales_detail_id: data.sales_detail_id,
      ota_id: data.ota_id,
      sales_amount: data.sales_amount ?? 0,
      quantity: data.quantity ?? 0,
      ota: data.ota ? {
        id: data.ota.id,
        name: data.ota.name,
        is_active: data.ota.is_active,
        created_at: data.ota.created_at,
        updated_at: data.ota.updated_at
      } : undefined
    };
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao atualizar vendas OTA');
  }
};

// Deactivate OTA (soft delete)
export const deactivateOTA = async (otaId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('otas')
      .update({ is_active: false })
      .eq('id', otaId);
    
    if (error) {
      if (error.code === '42P01') {
        throw new Error('Tabela de OTAs não encontrada. Execute as migrações do banco de dados.');
      }
      throw error;
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao desativar OTA');
  }
};