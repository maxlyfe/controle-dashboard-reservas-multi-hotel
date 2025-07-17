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
export const lastYearSalesDetailsAtom = atom<SalesDetail | null>(null);


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

const currentMonthAllDetailsAtom = atom(
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

export const salesRankAtom = atom((get) => {
    const details = get(currentHotelDetailsAtom);
    if (!details) return [];

    const channels = [
        { name: 'Recepção/Balcão', value: details.siteRecepcaoBalcao },
        { name: 'Evento', value: details.centralEvents },
        { name: 'Day Use', value: details.centralDayUse },
        { name: 'Vendas Central', value: details.centralSales },
        { name: 'Grupo', value: details.centralPackages },
        { name: 'Booking', value: details.bookingSales },
        { name: 'HotelBeds', value: details.hotelBedsSales },
        { name: 'Keytel', value: details.keytelSales },
        { name: 'Expedia', value: details.expediaSales },
        { name: 'Decolar', value: details.airbnbSales },
        { name: 'Tourmerd', value: details.tourmerdSales },
        { name: 'Planisfério', value: details.planisferioSales },
        { name: 'Itaparica', value: details.itaparicaSales },
        { name: 'Outros', value: details.otherOtaSales },
    ];

    return channels
        .filter(channel => (channel.value ?? 0) > 0)
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
});

export const growthObjectivesAtom = atom((get) => {
    const currentDetails = get(currentHotelDetailsAtom);
    const lastYearDetails = get(lastYearSalesDetailsAtom);

    if (!lastYearDetails) {
        return { status: 'no_data', message: "Informe as vendas do ano anterior para calcular este objetivo." };
    }

    const currentCentralSales = currentDetails?.centralSales ?? 0;
    const lastYearCentralSales = lastYearDetails?.centralSales ?? 0;

    if (lastYearCentralSales <= 0) {
        return { status: 'no_data', message: "Sem vendas no ano anterior para comparar." };
    }
    
    const growth = (currentCentralSales - lastYearCentralSales) / lastYearCentralSales;

    if (growth > 0.20) {
        return {
            status: 'achieved_obj3',
            prize: currentCentralSales * 0.03,
            growth,
        };
    }
    
    if (growth > 0.10) {
        return {
            status: 'achieved_obj2',
            prize: currentCentralSales * 0.02,
            growth,
        };
    }

    return { status: 'not_achieved', growth };
});


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

// FUNÇÃO CORRIGIDA PARA CONVERTER STRINGS EM NÚMEROS
export const loadSalesDetails = async (): Promise<SalesDetail[]> => {
  const { data, error } = await supabase.from('sales_details').select('*, hotel:hotel_id(id, name, location)');
  if (error) throw error;
  return (data || []).map(item => ({
    id: item.id,
    monthlyDataId: item.monthly_data_id,
    hotelId: item.hotel_id,
    siteReservations: parseFloat(item.site_reservations) || 0,
    siteRecepcaoBalcao: parseFloat(item.site_recepcao_balcao) || 0,
    centralSales: parseFloat(item.central_sales) || 0,
    centralPackages: parseFloat(item.central_packages) || 0,
    centralDayUse: parseFloat(item.central_day_use) || 0,
    centralEvents: parseFloat(item.central_events) || 0,
    bookingSales: parseFloat(item.booking_sales) || 0,
    airbnbSales: parseFloat(item.airbnb_sales) || 0,
    expediaSales: parseFloat(item.expedia_sales) || 0,
    hotelBedsSales: parseFloat(item.hotelbeds_sales) || 0,
    otherOtaSales: parseFloat(item.other_ota_sales) || 0,
    tourmerdSales: parseFloat(item.tourmerd_sales) || 0,
    keytelSales: parseFloat(item.keytel_sales) || 0,
    planisferioSales: parseFloat(item.planisferio_sales) || 0,
    itaparicaSales: parseFloat(item.itaparica_sales) || 0,
    bookingQuantity: item.booking_quantity ?? 0,
    decolaQuantity: item.decolar_quantity ?? 0,
    hotelbedsQuantity: item.hotelbeds_quantity ?? 0,
    tourmerdQuantity: item.tourmerd_quantity ?? 0,
    keytelQuantity: item.keytel_quantity ?? 0,
    planisferioQuantity: item.planisferio_quantity ?? 0,
    expedaQuantity: item.expedia_quantity ?? 0,
    itaparicaQuantity: item.itaparica_quantity ?? 0,
    otherOtaQuantity: item.other_ota_quantity ?? 0,
    centralSalesQuantity: item.central_sales_quantity ?? 0,
    centralPackagesQuantity: item.central_packages_quantity ?? 0,
    siteRecepcaoBalcaoQuantity: item.site_recepcao_balcao_quantity ?? 0,
    centralEventsQuantity: item.central_events_quantity ?? 0,
    centralDayUseQuantity: item.central_day_use_quantity ?? 0,
    hotel: item.hotel ? { id: item.hotel.id, name: item.hotel.name, location: item.hotel.location } : undefined
  }));
};

// FUNÇÃO CORRIGIDA PARA CONVERTER STRINGS EM NÚMEROS
export const loadLastYearSalesDetail = async (month: number, year: number, hotelId: string): Promise<SalesDetail | null> => {
    const { data: lastYearMonthData } = await supabase
        .from('monthly_data')
        .select('id')
        .eq('month', month)
        .eq('year', year - 1)
        .maybeSingle();

    if (!lastYearMonthData) return null;

    const { data: detail } = await supabase
        .from('sales_details')
        .select('*')
        .eq('monthly_data_id', lastYearMonthData.id)
        .eq('hotel_id', hotelId)
        .maybeSingle();

    if (!detail) return null;

    return {
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
    };
};

export const loadHotelGoals = async (): Promise<HotelGoal[]> => {
  const { data, error } = await supabase.from('hotel_goals').select('id, hotel_id, month, year, goal');
  if (error) throw error;
  return (data || []).map(item => ({ id: item.id, hotelId: item.hotel_id, month: item.month, year: item.year, goal: item.goal ?? 0 }));
};

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