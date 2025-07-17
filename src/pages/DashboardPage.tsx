import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { 
  selectedDateAtom,
  selectedHotelAtom,
  hotelsAtom,
  salesDetailsAtom,
  hotelGoalsAtom, 
  dashboardDataAtom,
  lastYearSalesDetailsAtom,
  
  currentMonthGroupTotalsAtom, 
  currentHotelDetailsAtom, 
  currentHotelGoalAtom, 

  loadDashboardData,
  loadHotels,
  loadSalesDetails,
  loadHotelGoals, 
  loadLastYearSalesDetail,
  findOrCreateMonthData, 
  updateSalesDetail, 
  upsertHotelGoal, 
  ensureRelatedRecordsExist,
  
  SalesDetail,
  HotelGoal
} from '../atoms/dashboardAtom';
import { authAtom } from '../atoms/authAtom';

import MonthYearPicker from '../components/MonthYearPicker';
import EditableMetricDisplay from '../components/EditableMetricDisplay';
import EditableField from '../components/EditableField'; 
import DistributionChart from '../components/DistributionChart';
import GoalProgress from '../components/GoalProgress';
import HotelSelector from '../components/HotelSelector';
import SiteDetailCard from '../components/SiteDetailCard';
import CentralDetailCard from '../components/CentralDetailCard';
import OtaDetailCard from '../components/OtaDetailCard';
import ObjectivesDashboard from '../components/objectives/ObjectivesDashboard';
import { TrendingUp, BarChart4, Plus, RefreshCw, Target } from 'lucide-react';

const calculateHotelTotalSales = (details: SalesDetail | null): number => {
  if (!details) return 0;
  const siteSales = (details.siteRecepcaoBalcao ?? 0) + (details.centralDayUse ?? 0) + (details.centralEvents ?? 0);
  const centralSales = (details.centralSales ?? 0) + (details.centralPackages ?? 0);
  const otaSales = (details.bookingSales ?? 0) + (details.airbnbSales ?? 0) + (details.expediaSales ?? 0) + (details.hotelBedsSales ?? 0) + (details.otherOtaSales ?? 0) + (details.tourmerdSales ?? 0) + (details.keytelSales ?? 0) + (details.planisferioSales ?? 0) + (details.itaparicaSales ?? 0);
  return siteSales + centralSales + otaSales;
};

const DashboardPage = () => {
  // Atoms State
  const [dashboardData, setDashboardData] = useAtom(dashboardDataAtom);
  const [currentGroupTotals] = useAtom(currentMonthGroupTotalsAtom); 
  const [selectedDate] = useAtom(selectedDateAtom);
  const [selectedHotel, setSelectedHotel] = useAtom(selectedHotelAtom);
  const [hotels, setHotels] = useAtom(hotelsAtom);
  const [salesDetails, setSalesDetails] = useAtom(salesDetailsAtom);
  const [hotelGoals, setHotelGoals] = useAtom(hotelGoalsAtom); 
  const [currentDetails] = useAtom(currentHotelDetailsAtom); 
  const [currentGoal] = useAtom(currentHotelGoalAtom); 
  const [auth] = useAtom(authAtom);
  const [, setLastYearSalesDetails] = useAtom(lastYearSalesDetailsAtom);
  
  // Local State
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [isCreatingMonth, setIsCreatingMonth] = useState(false);

  // --- Data Fetching and Initialization ---
  const fetchData = async (refresh = false) => {
    if (!refresh) setIsLoading(true);
    setError(null);
    try {
      const [hotelsData, baseData, detailsData, goalsData] = await Promise.all([
        loadHotels(),
        loadDashboardData(),
        loadSalesDetails(),
        loadHotelGoals()
      ]);
      setHotels(hotelsData);
      setDashboardData(baseData);
      setSalesDetails(detailsData);
      setHotelGoals(goalsData);
    } catch (err: any) {
      console.error("Fetch Data Error:", err);
      setError(`Falha ao carregar dados: ${err.message || 'Erro desconhecido'}`);
    } finally {
      if (!refresh) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    const fetchLastYearData = async () => {
        if (selectedHotel) {
            const lastYearData = await loadLastYearSalesDetail(selectedDate.month, selectedDate.year, selectedHotel);
            setLastYearSalesDetails(lastYearData);
        } else {
            setLastYearSalesDetails(null);
        }
    };
    fetchLastYearData();
  }, [selectedHotel, selectedDate, setLastYearSalesDetails]);

  useEffect(() => {
    const initializeMonthIfNeeded = async () => {
      if (isLoading || hotels.length === 0) return;
      const baseDataExists = dashboardData.some(d => d.month === selectedDate.month && d.year === selectedDate.year);
      
      if (!baseDataExists) return;

      const detailsExist = salesDetails.some(d => d.monthlyDataId === dashboardData.find(m => m.month === selectedDate.month && m.year === selectedDate.year)?.id);
      const goalsExist = hotelGoals.some(g => g.month === selectedDate.month && g.year === selectedDate.year);

      if (!detailsExist || !goalsExist) {
          console.log(`Ensuring related records exist for ${selectedDate.month}/${selectedDate.year}`);
          setIsInitializing(true);
          try {
            await ensureRelatedRecordsExist(selectedDate.month, selectedDate.year, hotels);
            const [freshDetails, freshGoals] = await Promise.all([loadSalesDetails(), loadHotelGoals()]);
            setSalesDetails(freshDetails);
            setHotelGoals(freshGoals);
          } catch (err: any) {
            console.error("Initialize Month Error:", err);
            setError(`Falha ao inicializar mês: ${err.message || 'Erro desconhecido'}`);
          } finally {
            setIsInitializing(false);
          }
      }
    };
    initializeMonthIfNeeded();
  }, [selectedDate, dashboardData, salesDetails, hotelGoals, hotels, isLoading, setSalesDetails, setHotelGoals]);

  // --- Update Handlers ---
  const handleUpdateSalesDetail = async (updatePayload: Partial<SalesDetail> & { id: string }) => {
    if (!auth.isAuthenticated) return setError("Autenticação necessária.");
    if (!updatePayload.id) return setError("Erro interno: ID do detalhe ausente.");
    setError(null);
    try {
      const updatedDetailsArray = await updateSalesDetail(salesDetails, updatePayload);
      setSalesDetails(updatedDetailsArray); 
    } catch (err: any) {
      console.error("Update Sales Detail Error:", err);
      setError(`Falha ao atualizar detalhe de venda: ${err.message || 'Erro desconhecido'}`);
    }
  };

  const handleUpdateHotelGoal = async (newGoalValue: number) => {
    if (!auth.isAuthenticated) return setError("Autenticação necessária.");
    if (!selectedHotel) return setError("Selecione um hotel para definir a meta.");
    setError(null);
    const goalToUpsert: HotelGoal = {
      hotelId: selectedHotel,
      month: selectedDate.month,
      year: selectedDate.year,
      goal: newGoalValue,
      id: currentGoal?.id 
    };
    try {
      const updatedGoalsArray = await upsertHotelGoal(hotelGoals, goalToUpsert);
      setHotelGoals(updatedGoalsArray);
    } catch (err: any) {
      console.error("Update Hotel Goal Error:", err);
      setError(`Falha ao atualizar meta do hotel: ${err.message || 'Erro desconhecido'}`);
    }
  };

  const handleCreateNewMonth = async () => {
    setIsCreatingMonth(true);
    setError(null);
    try {
      const newMonthEntry = await findOrCreateMonthData(selectedDate.month, selectedDate.year);
      setDashboardData(prev => [...prev, newMonthEntry].sort((a, b) => b.year - a.year || b.month - a.month));
      await ensureRelatedRecordsExist(selectedDate.month, selectedDate.year, hotels);
      await fetchData(true);
    } catch (err: any) {
      console.error("Create New Month Error:", err);
      setError(`Falha ao criar dados para o novo mês: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setIsCreatingMonth(false);
    }
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    await fetchData(true);
    setIsLoading(false);
  };

  // --- Render Logic ---
  const hotelName = selectedHotel ? hotels.find(h => h.id === selectedHotel)?.name : 'Grupo Meridiana';
  const baseDataExists = dashboardData.some(d => d.month === selectedDate.month && d.year === selectedDate.year);

  const displayGoal = selectedHotel ? (currentGoal?.goal ?? 0) : currentGroupTotals.goal;
  const displayTotalSales = selectedHotel ? calculateHotelTotalSales(currentDetails) : currentGroupTotals.totalSales;
  const displaySalesForGoal = selectedHotel ? calculateHotelTotalSales(currentDetails) : currentGroupTotals.totalSales;
  const displayLabelPrefix = selectedHotel ? '' : '(Grupo)';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-700 to-cyan-500 bg-clip-text text-transparent">
              {hotelName}
            </h1>
            <p className="text-gray-600 mt-1">Dashboard de Metas e Vendas</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            <MonthYearPicker />
            <HotelSelector 
              hotels={hotels} 
              selectedHotel={selectedHotel} 
              onSelectHotel={setSelectedHotel} 
            />
            <button 
              onClick={handleRefreshData} 
              className="p-2.5 border rounded-md bg-white hover:bg-gray-50 shadow-sm transition-colors" 
              title="Atualizar dados"
              disabled={isLoading || isInitializing}
            >
              <RefreshCw size={20} className={(isLoading || isInitializing) ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Loading / Error / No Data States */}
        {isLoading && !isInitializing ? (
          <div className="flex justify-center items-center h-64">
             <div className="text-center">
               <RefreshCw size={32} className="animate-spin text-blue-600 mx-auto mb-4" />
               <p className="text-gray-600">Carregando dados...</p>
             </div>
           </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Erro!</strong>
            <span className="block sm:inline"> {error}</span>
            <button onClick={handleRefreshData} className="ml-4 text-sm font-semibold underline" disabled={isLoading || isInitializing}>
              Tentar novamente
            </button>
          </div>
        ) : !baseDataExists ? (
          <div className="bg-white rounded-lg shadow p-6 md:p-8 text-center">
            <h2 className="text-xl text-gray-700 font-semibold mb-4">Nenhum dado disponível</h2>
            <p className="text-gray-500 mb-6">
              Não há dados registrados para {selectedDate.month}/{selectedDate.year}.
            </p>
            {auth.isAuthenticated && (
              <button 
                onClick={handleCreateNewMonth}
                disabled={isCreatingMonth || isLoading || isInitializing}
                className="btn-primary inline-flex items-center justify-center"
              >
                {isCreatingMonth ? (
                  <><RefreshCw size={16} className="animate-spin mr-2" /> Criando...</>
                ) : (
                  <><Plus size={16} className="mr-2" /> Inicializar Mês</>
                )}
              </button>
            )}
          </div>
        ) : (
          <>
            {isInitializing && (
                <div className="text-center text-blue-600 mb-4">
                    <RefreshCw size={16} className="animate-spin inline mr-2" />
                    Inicializando dados do mês...
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="dashboard-card card-hover-effect">
                {selectedHotel ? (
                  <EditableField
                    label="Meta do Hotel"
                    field="hotelGoal"
                    value={displayGoal} 
                    onSave={handleUpdateHotelGoal} 
                    formatAs="currency"
                    isAuthenticated={auth.isAuthenticated}
                    icon={<Target size={24} className="text-blue-500"/>}
                    className="text-2xl lg:text-3xl font-bold text-blue-600"
                  />
                ) : (
                  <EditableMetricDisplay 
                    label={`Meta Mensal ${displayLabelPrefix}`}
                    value={displayGoal}
                    formatAs="currency"
                    icon={<BarChart4 size={24} className="text-blue-500"/>}
                    className="text-2xl lg:text-3xl font-bold text-blue-600"
                  />
                )}
              </div>
              
              <div className="dashboard-card card-hover-effect">
                <EditableMetricDisplay 
                  label={`Vendas Totais ${displayLabelPrefix}`}
                  value={displayTotalSales}
                  formatAs="currency"
                  icon={<TrendingUp size={24} className="text-green-500"/>}
                  className="text-2xl lg:text-3xl font-bold text-green-600"
                />
              </div>
              
              <div className="md:col-span-2 xl:col-span-2 dashboard-card card-hover-effect">
                <GoalProgress 
                  goal={displayGoal}
                  current={displaySalesForGoal}
                />
              </div>
            </div>

            {!selectedHotel && (
              <div className="dashboard-card mb-6 md:mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 md:mb-6">
                  Distribuição de Vendas (Grupo)
                </h2>
                <DistributionChart 
                  salesDetails={salesDetails.filter(d => d.monthlyDataId === dashboardData.find(m => m.month === selectedDate.month && m.year === selectedDate.year)?.id)} 
                  hotels={hotels}
                />
              </div>
            )}

            {/* ########## INÍCIO DA SEÇÃO DE LAYOUT CORRIGIDA (VERSÃO FINAL) | = ########## */}
            {selectedHotel && currentDetails && (
              <div className="space-y-6">
                {/* AQUI ESTÁ A CORREÇÃO: Adicionando 'lg:items-start' ao grid principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">
                  
                  {/* Coluna da Esquerda: Painel de Objetivos */}
                  <div className="lg:col-span-1">
                    <ObjectivesDashboard />
                  </div>

                  {/* Coluna da Direita: Cards de Vendas empilhados */}
                  <div className="lg:col-span-2 space-y-6">
                    <CentralDetailCard 
                      currentData={currentGroupTotals}
                      detailData={currentDetails}
                      hotels={hotels} 
                      isAuthenticated={auth.isAuthenticated}
                      onUpdateDetail={handleUpdateSalesDetail}
                      selectedHotel={selectedHotel}
                    />
                    <SiteDetailCard 
                      currentData={currentGroupTotals} 
                      detailData={currentDetails} 
                      isAuthenticated={auth.isAuthenticated}
                      onUpdateDetail={handleUpdateSalesDetail} 
                      selectedHotel={selectedHotel}
                    />
                  </div>
                </div>

                {/* Linha Inferior: Card de OTAs (largura total) */}
                <div>
                  <OtaDetailCard 
                    currentData={currentGroupTotals}
                    detailData={currentDetails}
                    hotels={hotels} 
                    isAuthenticated={auth.isAuthenticated}
                    onUpdateDetail={handleUpdateSalesDetail}
                    selectedHotel={selectedHotel}
                  />
                </div>
              </div>
            )}
            {/* ########## FIM DA SEÇÃO DE LAYOUT CORRIGIDA ########## */}

            {!selectedHotel && (
                 <div className="text-center text-gray-500 mt-8 p-4 bg-blue-50 rounded-lg">
                    Selecione um hotel acima para visualizar e editar os detalhes de vendas e a meta individual.
                 </div>
            )}
          </>
        )}
        
        <div className="text-center text-sm text-gray-400 mt-8 mb-4">
          Última atualização da página: {new Date().toLocaleString('pt-BR')}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;