import { useState } from 'react';
import { Edit, CheckCircle, XCircle } from 'lucide-react';

interface GoalProgressProps {
  goal: number;
  current: number;
}

const GoalProgress = ({ goal, current }: GoalProgressProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(goal.toString());
  
  const progress = Math.min(100, Math.round((current / goal) * 100));
  const isAchieved = current >= goal;
  const remaining = Math.max(0, goal - current); // Calculate remaining amount

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getProgressColor = () => {
    if (isAchieved) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 transition-all duration-200 hover:shadow-md h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-500">Progresso da Meta</h3>
        <span className={`text-xs md:text-sm font-medium px-2 py-1 rounded-full ${
          isAchieved ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {progress}%
        </span>
      </div>
      
      <div className="space-y-4">
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Improved responsive grid for values - always 3 columns, better spacing */}
        <div className="grid grid-cols-3 gap-2 md:gap-3 text-xs md:text-sm">
          <div className="text-center">
            <span className="text-gray-500 block mb-1">Atual</span>
            <div className="font-semibold text-gray-900 leading-tight">
              {formatCurrency(current)}
            </div>
          </div>
          <div className="text-center">
            <span className="text-gray-500 block mb-1">Meta</span>
            <div className="font-semibold text-gray-900 leading-tight">
              {formatCurrency(goal)}
            </div>
          </div>
          <div className="text-center">
            <span className="text-gray-500 block mb-1">Falta</span>
            <div className={`font-semibold leading-tight ${isAchieved ? 'text-green-600' : 'text-red-600'}`}>
              {isAchieved ? (
                <span className="text-xs">Meta atingida!</span>
              ) : (
                formatCurrency(remaining)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalProgress;