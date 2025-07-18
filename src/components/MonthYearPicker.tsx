import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAtom } from 'jotai';
import { selectedDateAtom } from '../atoms/dashboardAtom';

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const MonthYearPicker = () => {
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom);
  const [isOpen, setIsOpen] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];
  
  const handlePrevMonth = () => {
    setSelectedDate(prev => {
      if (prev.month === 1) {
        return { month: 12, year: prev.year - 1 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => {
      if (prev.month === 12) {
        return { month: 1, year: prev.year + 1 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };

  const handleSelectMonth = (month: number) => {
    setSelectedDate(prev => ({ ...prev, month }));
    setIsOpen(false);
  };

  const handleSelectYear = (year: number) => {
    setSelectedDate(prev => ({ ...prev, year }));
    setIsOpen(false);
  };

  return (
    // Adicionada a classe 'relative' para que o z-index funcione corretamente no menu suspenso
    <div className="relative">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          className="p-1 rounded-full text-gray-600 hover:bg-gray-100"
          onClick={handlePrevMonth}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <button
          type="button"
          className="px-3 py-1.5 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          {months[selectedDate.month - 1]} {selectedDate.year}
        </button>
        
        <button
          type="button"
          className="p-1 rounded-full text-gray-600 hover:bg-gray-100"
          onClick={handleNextMonth}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      {/* CORREÇÃO: Adicionada a classe z-20 para colocar o menu na frente de outros elementos */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-20">
          <div className="py-2">
            <div className="px-4 py-2 text-sm font-medium text-gray-700">
              Selecione o mês
            </div>
            <div className="grid grid-cols-3 gap-1 p-2">
              {months.map((month, index) => (
                <button
                  key={month}
                  onClick={() => handleSelectMonth(index + 1)}
                  className={`text-sm py-1 rounded ${
                    selectedDate.month === index + 1
                      ? 'bg-primary-100 text-primary-800 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {month.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="py-2">
            <div className="px-4 py-2 text-sm font-medium text-gray-700">
              Selecione o ano
            </div>
            <div className="grid grid-cols-3 gap-1 p-2">
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => handleSelectYear(year)}
                  className={`text-sm py-1 rounded ${
                    selectedDate.year === year
                      ? 'bg-primary-100 text-primary-800 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthYearPicker;