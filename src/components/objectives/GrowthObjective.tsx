import { useAtom } from 'jotai';
import { lastYearSalesDetailsForSelectedHotelAtom, currentHotelDetailsAtom, SalesDetail, lastYearSalesDetailsForAllHotelsAtom } from '../../atoms/dashboardAtom';
import { TrendingUp, AlertTriangle, Gift } from 'lucide-react';


const calculateGrowth = (currentDetails: SalesDetail | null, lastYearDetails: SalesDetail | null) => {
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
        return { status: 'achieved_obj3', prize: currentCentralSales * 0.03, growth };
    }
    
    if (growth > 0.10) {
        return { status: 'achieved_obj2', prize: currentCentralSales * 0.02, growth };
    }

    return { status: 'not_achieved', growth };
};


const GrowthObjective = ({ details: detailsFromProps }: { details?: SalesDetail | null }) => {
  const [currentDetailsFromAtom] = useAtom(currentHotelDetailsAtom);
  const [lastYearDetailsForSelectedHotel] = useAtom(lastYearSalesDetailsForSelectedHotelAtom);
  const [lastYearDetailsForAll] = useAtom(lastYearSalesDetailsForAllHotelsAtom);

  const currentDetails = detailsFromProps !== undefined ? detailsFromProps : currentDetailsFromAtom;
  
  // Na visão de grupo, busca o dado do hotel específico na lista.
  // Na visão individual, usa o dado já carregado para o hotel selecionado.
  const lastYearDetails = detailsFromProps 
    ? lastYearDetailsForAll.find(d => d.hotelId === detailsFromProps.hotelId)
    : lastYearDetailsForSelectedHotel;

  const objectiveData = calculateGrowth(currentDetails, lastYearDetails || null);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  const renderContent = () => {
    switch (objectiveData.status) {
      case 'no_data':
        return (
          <div className="flex items-center gap-3 text-sm text-yellow-700 bg-yellow-50 p-3 rounded-md">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>{objectiveData.message}</span>
          </div>
        );
      
      case 'achieved_obj3':
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-gray-800">Objetivo 3: Crescimento (+20%)</h4>
              <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">CONCLUÍDO</span>
            </div>
            <p className="text-sm text-gray-600">
              Crescimento de <strong className="text-green-600">{formatPercentage(objectiveData.growth)}</strong> em relação ao ano anterior.
            </p>
            <div className="flex items-center gap-3 text-sm text-green-700 bg-green-50 p-3 rounded-md">
              <Gift className="h-5 w-5 flex-shrink-0" />
              <span>Prêmio: <strong className="font-mono">{formatCurrency(objectiveData.prize)}</strong> (3% do total)</span>
            </div>
          </div>
        );

      case 'achieved_obj2':
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-gray-800">Objetivo 2: Crescimento (+10%)</h4>
              <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">CONCLUÍDO</span>
            </div>
            <p className="text-sm text-gray-600">
              Crescimento de <strong className="text-green-600">{formatPercentage(objectiveData.growth)}</strong> em relação ao ano anterior.
            </p>
            <div className="flex items-center gap-3 text-sm text-green-700 bg-green-50 p-3 rounded-md">
              <Gift className="h-5 w-5 flex-shrink-0" />
              <span>Prêmio: <strong className="font-mono">{formatCurrency(objectiveData.prize)}</strong> (2% do total)</span>
            </div>
          </div>
        );
      
      case 'not_achieved':
        return (
          <div className="space-y-3">
             <div className="flex justify-between items-center">
              <h4 className="font-semibold text-gray-800">Objetivo de Crescimento</h4>
              <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800">PENDENTE</span>
            </div>
             <p className="text-sm text-gray-600">
              Crescimento atual de <strong className="text-red-600">{formatPercentage(objectiveData.growth)}</strong> em relação ao ano anterior.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900">Objetivos de Crescimento</h3>
      </div>
      {renderContent()}
    </div>
  );
};

export default GrowthObjective;