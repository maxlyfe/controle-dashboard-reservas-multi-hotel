import { atom } from 'jotai';
import { supabase } from '../lib/supabase';

// --- Interfaces ---
export interface MonthlyData {
  id?: string;
  month: number;
  year: number;
}

export interface Hotel {
  id: string;
  name: string;
  location?: string;
}

export interface HotelGoal {
  id?: string;
  hotelId: string;
  month: number;
  year: number;
  goal: number;
}

export interface SalesDetail {
  id?: string;
  monthlyDataId: string;
  hotelId: string;
  siteReservations: number;
  siteRecepcaoBalcao: number;
  centralSales: number;
  centralPackages: number; // Grupo
  centralEvents: number; // Evento
  centralDayUse: number; // Day Use
  bookingSales: number; // Booking
  airbnbSales: number; // Decolar (keeping the field name for compatibility)
  expediaSales: number; // Expedia
  hotelBedsSales: number; // HotelBeds
  otherOtaSales: number; // Outros
  tourmerdSales: number; // Tourmerd - NEW
  keytelSales: number; // Keytel - NEW
  planisferioSales: number; // Planisfério - NEW
  itaparicaSales: number; // Itaparica - NEW
  // Quantity fields for each OTA channel
  bookingQuantity: number;
  decolaQuantity: number; // Using decola instead of airbnb for clarity
  hotelbedsQuantity: number;
  tourmerdQuantity: number;
  keytelQuantity: number;
  planisferioQuantity: number;
  expedaQuantity: number;
  itaparicaQuantity: number;
  otherOtaQuantity: number;
  // Quantity fields for Central and Site channels
  centralSalesQuantity: number;
  centralPackagesQuantity: number;
  siteRecepcaoBalcaoQuantity: number;
  centralEventsQuantity: number;
  centralDayUseQuantity: number;
  hotel?: Hotel;
}

export interface SelectedDate {
  month: number;
  year: number;
}

// --- Atoms Base ---
const currentDate = new Date();
export const selectedDateAtom = atom<SelectedDate>({
  month: currentDate.getMonth() + 1,
  year: currentDate.getFullYear()
});

export const selectedHotelAtom = atom<string | null>(null);
export const hotelsAtom = atom<Hotel[]>([]);
export const dashboardDataAtom = atom<MonthlyData[]>([]);
export const salesDetailsAtom = atom<SalesDetail[]>([]);
export const hotelGoalsAtom = atom<HotelGoal[]>([]);
// CORREÇÃO: Adicionando 'export' que estava faltando
export const lastYearSalesDetailsForSelectedHotelAtom = atom<SalesDetail | null>(null);
export const lastYearSalesDetailsForAllHotelsAtom = atom<SalesDetail[]>([]);


// --- Atoms Derivados ---
export const currentMonthBaseDataAtom = atom(
  (get) => {
    const selectedDate = get(selectedDateAtom);
    const dashboardData = get(dashboardDataAtom);
    return dashboardData.find(
      (item) => item.month === selectedDate.month && item.year === selectedDate.year
    );
  }
);

export const currentMonthAllDetailsAtom = atom(
  (get) => {
    const baseData = get(currentMonthBaseDataAtom);
    const allDetails = get(salesDetailsAtom);
    if (!baseData || !baseData.id) return [];
    return allDetails.filter(detail => detail.monthlyDataId === baseData.id);
  }
);

const currentMonthAllGoalsAtom = atom(
  (get) => {
    const selectedDate = get(selectedDateAtom);
    const allGoals = get(hotelGoalsAtom);
    return allGoals.filter(goal => goal.month === selectedDate.month && goal.year === selectedDate.year);
  }
);

export const currentMonthGroupTotalsAtom = atom(
  (get) => {
    const detailsForMonth = get(currentMonthAllDetailsAtom);
    const goalsForMonth = get(currentMonthAllGoalsAtom);
    const totalGroupGoal = goalsForMonth.reduce((sum, goal) => sum + (goal.goal ?? 0), 0);
    let centralSales = 0, siteSales = 0, otaSales = 0;
    detailsForMonth.forEach(detail => {
      const currentSiteSales = (detail.siteRecepcaoBalcao ?? 0) + (detail.centralDayUse ?? 0) + (detail.centralEvents ?? 0);
      const currentCentralSales = (detail.centralSales ?? 0) + (detail.centralPackages ?? 0);
      const currentOtaSales = (detail.bookingSales ?? 0) + (detail.airbnbSales ?? 0) + (detail.expediaSales ?? 0) + (detail.hotelBedsSales ?? 0) + (detail.otherOtaSales ?? 0) + (detail.tourmerdSales ?? 0) + (detail.keytelSales ?? 0) + (detail.planisferioSales ?? 0) + (detail.itaparicaSales ?? 0);
      siteSales += currentSiteSales;
      centralSales += currentCentralSales;
      otaSales += currentOtaSales;
    });
    const totalSales = siteSales + centralSales + otaSales;
    return { goal: totalGroupGoal, totalSales, otaSales, centralSales, siteSales };
  }
);

export const currentHotelDetailsAtom = atom(
  (get): SalesDetail | null => {
    const baseData = get(currentMonthBaseDataAtom);
    const selectedHotel = get(selectedHotelAtom);
    const detailsForMonth = get(currentMonthAllDetailsAtom);
    if (!baseData || !baseData.id || !selectedHotel) return null;
    return detailsForMonth.find(d => d.hotelId === selectedHotel) || createEmptySalesDetail(baseData.id, selectedHotel);
  }
);

export const currentHotelGoalAtom = atom(
  (get): HotelGoal | null => {
    const selectedDate = get(selectedDateAtom);
    const selectedHotel = get(selectedHotelAtom);
    const goalsForMonth = get(currentMonthAllGoalsAtom);
    if (!selectedHotel) return null;
    const hotelGoal = goalsForMonth.find(g => g.hotelId === selectedHotel);
    return hotelGoal || { hotelId: selectedHotel, month: selectedDate.month, year: selectedDate.year, goal: 0 };
  }
);

// --- Helper Functions ---
const createEmptySalesDetail = (monthlyDataId: string, hotelId: string): SalesDetail => ({
  monthlyDataId, hotelId, siteReservations: 0, siteRecepcaoBalcao: 0, centralSales: 0, centralPackages: 0,
  centralDayUse: 0, centralEvents: 0, bookingSales: 0, airbnbSales: 0,
  expediaSales: 0, hotelBedsSales: 0, otherOtaSales: 0, tourmerdSales: 0, keytelSales: 0,
  planisferioSales: 0, itaparicaSales: 0,
  bookingQuantity: 0, decolaQuantity: 0, hotelbedsQuantity: 0, tourmerdQuantity: 0,
  keytelQuantity: 0, planisferioQuantity: 0, expedaQuantity: 0, itaparicaQuantity: 0, otherOtaQuantity: 0,
  centralSalesQuantity: 0, centralPackagesQuantity: 0, siteRecepcaoBalcaoQuantity: 0,
  centralEventsQuantity: 0, centralDayUseQuantity: 0,
});

const mapSalesDetailFromDb = (detail: any): SalesDetail => ({
    id: detail.id,
    monthlyDataId: detail.monthly_data_id,
    hotelId: detail.hotel_id,
    siteReservations: parseFloat(detail.site_reservations) || 0,
    siteRecepcaoBalcao: parseFloat(detail.site_recepcao_balcao) || 0,
    centralSales: parseFloat(detail.central_sales) || 0,
    centralPackages: parseFloat(detail.central_packages) || 0,
    centralDayUse: parseFloat(detail.central_day_use) || 0,
    centralEvents: parseFloat(detail.central_events) || 0,
    bookingSales: parseFloat(detail.booking_sales) || 0,
    airbnbSales: parseFloat(detail.airbnb_sales) || 0,
    expediaSales: parseFloat(detail.expedia_sales) || 0,
    hotelBedsSales: parseFloat(detail.hotelbeds_sales) || 0,
    otherOtaSales: parseFloat(detail.other_ota_sales) || 0,
    tourmerdSales: parseFloat(detail.tourmerd_sales) || 0,
    keytelSales: parseFloat(detail.keytel_sales) || 0,
    planisferioSales: parseFloat(detail.planisferio_sales) || 0,
    itaparicaSales: parseFloat(detail.itaparica_sales) || 0,
    bookingQuantity: detail.booking_quantity ?? 0,
    decolaQuantity: detail.decolar_quantity ?? 0,
    hotelbedsQuantity: detail.hotelbeds_quantity ?? 0,
    tourmerdQuantity: detail.tourmerd_quantity ?? 0,
    keytelQuantity: detail.keytel_quantity ?? 0,
    planisferioQuantity: detail.planisferio_quantity ?? 0,
    expedaQuantity: detail.expedia_quantity ?? 0,
    itaparicaQuantity: detail.itaparica_quantity ?? 0,
    otherOtaQuantity: detail.other_ota_quantity ?? 0,
    centralSalesQuantity: detail.central_sales_quantity ?? 0,
    centralPackagesQuantity: detail.central_packages_quantity ?? 0,
    siteRecepcaoBalcaoQuantity: detail.site_recepcao_balcao_quantity ?? 0,
    centralEventsQuantity: detail.central_events_quantity ?? 0,
    centralDayUseQuantity: detail.central_day_use_quantity ?? 0,
    hotel: detail.hotel ? { id: detail.hotel.id, name: detail.hotel.name, location: detail.hotel.location } : undefined
});

// --- Database Interaction Functions ---
export const loadHotels = async (): Promise<Hotel[]> => {
  const { data, error } = await supabase.from('hotels').select('id, name, location').order('name');
  if (error) throw error;
  return (data || []).map(item => ({ id: item.id, name: item.name, location: item.location }));
};

export const loadDashboardData = async (): Promise<MonthlyData[]> => {
  const { data, error } = await supabase.from('monthly_data').select('id, month, year').order('year', { ascending: false }).order('month', { ascending: false });
  if (error) throw error;
  return (data || []).map(item => ({ id: item.id, month: item.month, year: item.year }));
};

export const loadSalesDetails = async (): Promise<SalesDetail[]> => {
  const { data, error } = await supabase.from('sales_details').select('*, hotel:hotel_id(id, name, location)');
  if (error) throw error;
  return (data || []).map(mapSalesDetailFromDb);
};

export const loadLastYearSalesDetailsForAllHotels = async (month: number, year: number): Promise<SalesDetail[]> => {
    const { data: lastYearMonthData } = await supabase
        .from('monthly_data')
        .select('id')
        .eq('month', month)
        .eq('year', year - 1)
        .maybeSingle();

    if (!lastYearMonthData) return [];

    const { data: lastYearDetails } = await supabase
        .from('sales_details')
        .select('*')
        .eq('monthly_data_id', lastYearMonthData.id);

    if (!lastYearDetails) return [];
    
    return lastYearDetails.map(mapSalesDetailFromDb);
};

export const loadHotelGoals = async (): Promise<HotelGoal[]> => {
  const { data, error } = await supabase.from('hotel_goals').select('id, hotel_id, month, year, goal');
  if (error) throw error;
  return (data || []).map(item => ({ id: item.id, hotelId: item.hotel_id, month: item.month, year: item.year, goal: item.goal ?? 0 }));
};

// ... (restante do arquivo sem alterações: findOrCreateMonthData, ensureRelatedRecordsExist, updateSalesDetail, upsertHotelGoal)
export const findOrCreateMonthData = async (month: number, year: number): Promise<MonthlyData> => {
  let { data: monthData, error: findError } = await supabase
    .from('monthly_data')
    .select('id, month, year')
    .eq('month', month)
    .eq('year', year)
    .maybeSingle();

  if (findError) {
      console.error("Error finding month data:", findError);
      throw findError;
  }

  if (monthData) {
    return { id: monthData.id, month: monthData.month, year: monthData.year };
  }

  console.log(`Creating new monthly_data entry for ${month}/${year}`);
  const newMonthDataInput = { month, year };
  const { data: insertedData, error: insertError } = await supabase
    .from('monthly_data')
    .insert(newMonthDataInput)
    .select('id, month, year')
    .single();

  if (insertError) {
      console.error("Error creating month data:", insertError);
      throw insertError;
  }
  return { id: insertedData.id, month: insertedData.month, year: insertedData.year };
};

export const ensureRelatedRecordsExist = async (month: number, year: number, hotels: Hotel[]): Promise<void> => {
  const monthData = await findOrCreateMonthData(month, year);
  const monthlyDataId = monthData.id!;

  const detailsToUpsert = hotels.map(hotel => ({
    monthly_data_id: monthlyDataId,
    hotel_id: hotel.id,
    site_reservations: 0, site_recepcao_balcao: 0, central_sales: 0, central_packages: 0, central_day_use: 0,
    central_events: 0, booking_sales: 0, airbnb_sales: 0, expedia_sales: 0, hotelbeds_sales: 0, other_ota_sales: 0,
    tourmerd_sales: 0, keytel_sales: 0, planisferio_sales: 0, itaparica_sales: 0,
    booking_quantity: 0, decolar_quantity: 0, hotelbeds_quantity: 0, tourmerd_quantity: 0,
    keytel_quantity: 0, planisferio_quantity: 0, expedia_quantity: 0, itaparica_quantity: 0, other_ota_quantity: 0,
    central_sales_quantity: 0, central_packages_quantity: 0, site_recepcao_balcao_quantity: 0,
    central_events_quantity: 0, central_day_use_quantity: 0,
  }));

  const goalsToUpsert = hotels.map(hotel => ({
    hotel_id: hotel.id,
    month: month,
    year: year,
    goal: 0,
  }));

  const upsertPromises = [
    supabase.from('sales_details').upsert(detailsToUpsert, { onConflict: 'monthly_data_id, hotel_id' }),
    supabase.from('hotel_goals').upsert(goalsToUpsert, { onConflict: 'hotel_id, month, year' })
  ];

  const results = await Promise.allSettled(upsertPromises);

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const tableName = index === 0 ? 'sales_details' : 'hotel_goals';
      console.error(`Error upserting records into ${tableName}:`, result.reason);
    }
  });

  const salesDetailsResult = results[0] as PromiseSettledResult<{ error: any | null }>;
  const hotelGoalsResult = results[1] as PromiseSettledResult<{ error: any | null }>;

  if (salesDetailsResult.status === 'fulfilled' && salesDetailsResult.value.error) {
      console.error('Supabase error during sales_details upsert:', salesDetailsResult.value.error);
  }
  if (hotelGoalsResult.status === 'fulfilled' && hotelGoalsResult.value.error) {
      console.error('Supabase error during hotel_goals upsert:', hotelGoalsResult.value.error);
  }

};

export const updateSalesDetail = async (
  currentDetails: SalesDetail[],
  updatedDetail: Partial<SalesDetail> & { id: string }
): Promise<SalesDetail[]> => {
  if (!updatedDetail.id) throw new Error('Sales Detail ID missing for update.');
  const payload: Record<string, any> = {};
  const fields: (keyof Omit<SalesDetail, 'id' | 'monthlyDataId' | 'hotelId' | 'hotel'>)[] = [
    'siteReservations', 'siteRecepcaoBalcao', 'centralSales', 'centralPackages', 'centralDayUse', 'centralEvents',
    'bookingSales', 'airbnbSales', 'expediaSales', 'hotelBedsSales', 'otherOtaSales', 'tourmerdSales', 'keytelSales',
    'planisferioSales', 'itaparicaSales', 'bookingQuantity', 'decolaQuantity', 'hotelbedsQuantity',
    'tourmerdQuantity', 'keytelQuantity', 'planisferioQuantity', 'expedaQuantity', 'itaparicaQuantity', 'otherOtaQuantity',
    'centralSalesQuantity', 'centralPackagesQuantity', 'siteRecepcaoBalcaoQuantity', 'centralEventsQuantity', 'centralDayUseQuantity'
  ];
  fields.forEach(field => {
    if (field in updatedDetail) {
      const fieldMapping: Record<string, string> = {
        'siteReservations': 'site_reservations',
        'siteRecepcaoBalcao': 'site_recepcao_balcao',
        'centralSales': 'central_sales',
        'centralPackages': 'central_packages',
        'centralDayUse': 'central_day_use',
        'centralEvents': 'central_events',
        'bookingSales': 'booking_sales',
        'airbnbSales': 'airbnb_sales',
        'expediaSales': 'expedia_sales',
        'otherOtaSales': 'other_ota_sales',
        'tourmerdSales': 'tourmerd_sales',
        'keytelSales': 'keytel_sales',
        'planisferioSales': 'planisferio_sales',
        'itaparicaSales': 'itaparica_sales',
        'hotelBedsSales': 'hotelbeds_sales',
        'bookingQuantity': 'booking_quantity',
        'decolaQuantity': 'decolar_quantity',
        'hotelbedsQuantity': 'hotelbeds_quantity',
        'tourmerdQuantity': 'tourmerd_quantity',
        'keytelQuantity': 'keytel_quantity',
        'planisferioQuantity': 'planisferio_quantity',
        'expedaQuantity': 'expedia_quantity',
        'itaparicaQuantity': 'itaparica_quantity',
        'otherOtaQuantity': 'other_ota_quantity',
        'centralSalesQuantity': 'central_sales_quantity',
        'centralPackagesQuantity': 'central_packages_quantity',
        'siteRecepcaoBalcaoQuantity': 'site_recepcao_balcao_quantity',
        'centralEventsQuantity': 'central_events_quantity',
        'centralDayUseQuantity': 'central_day_use_quantity'
      };
      
      const dbColumnName = fieldMapping[field] || field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      payload[dbColumnName] = typeof updatedDetail[field] === 'number' ? updatedDetail[field] : 0;
    }
  });
  if (Object.keys(payload).length === 0) return currentDetails;
  const { error } = await supabase.from('sales_details').update(payload).eq('id', updatedDetail.id);
  if (error) throw error;
  return currentDetails.map(item => item.id === updatedDetail.id ? { ...item, ...updatedDetail } : item );
};

export const upsertHotelGoal = async (
  currentGoals: HotelGoal[],
  goalToUpsert: HotelGoal
): Promise<HotelGoal[]> => {
  const payload = { hotel_id: goalToUpsert.hotelId, month: goalToUpsert.month, year: goalToUpsert.year, goal: goalToUpsert.goal ?? 0 };
  const { data, error } = await supabase.from('hotel_goals').upsert(payload, { onConflict: 'hotel_id, month, year' }).select('id, hotel_id, month, year, goal').single();
  if (error) { console.error("Error upserting hotel goal:", error); throw error; }
  const updatedGoal = { id: data.id, hotelId: data.hotel_id, month: data.month, year: data.year, goal: data.goal ?? 0 };
  const existingIndex = currentGoals.findIndex(g => g.hotelId === updatedGoal.hotelId && g.month === updatedGoal.month && g.year === updatedGoal.year);
  if (existingIndex > -1) {
    const newGoals = [...currentGoals];
    newGoals[existingIndex] = updatedGoal;
    return newGoals;
  } else {
    return [...currentGoals, updatedGoal];
  }
};