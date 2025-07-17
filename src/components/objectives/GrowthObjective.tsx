import { useAtom } from 'jotai';
import { growthObjectivesAtom } from '../../atoms/dashboardAtom';
import { TrendingUp, AlertTriangle, Gift } from 'lucide-react';

const GrowthObjective = () => {
  const [objectiveData] = useAtom(growthObjectivesAtom);

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