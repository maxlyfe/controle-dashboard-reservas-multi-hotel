import { useState, useEffect, useRef } from 'react';
import { Edit, CheckCircle, XCircle } from 'lucide-react';

interface EditableMetricProps {
  title: string;
  value: number;
  formatAs?: 'currency' | 'percentage' | 'number';
  isEditable?: boolean;
  onSave?: (value: number) => void;
  icon?: React.ReactNode;
  bgColor?: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  } | null;
}

const EditableMetric = ({
  title,
  value,
  formatAs = 'currency',
  isEditable = false,
  onSave,
  icon,
  bgColor = 'bg-white',
  change
}: EditableMetricProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setInputValue(value.toLocaleString('pt-BR').replace('R$', '').trim());
  }, [value]);

  const formatValue = (val: number) => {
    switch (formatAs) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString('pt-BR');
    }
  };

  const handleSave = () => {
    const cleanValue = inputValue.replace(/\./g, '').replace(',', '.');
    const numValue = parseFloat(cleanValue);
    
    if (!isNaN(numValue) && onSave) {
      onSave(numValue);
    } else {
      setInputValue(value.toLocaleString('pt-BR'));
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setInputValue(value.toLocaleString('pt-BR'));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={`${bgColor} rounded-lg shadow-sm p-6 transition-all duration-300 hover:shadow-lg`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="mt-2">
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">R$</span>
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                      const input = e.target.value.replace(/[^\d,]/g, '');
                      setInputValue(input);
                    }}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <button
                  onClick={handleSave}
                  className="p-1.5 text-green-700 hover:bg-green-50 rounded-full transition-colors"
                >
                  <CheckCircle size={18} />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1.5 text-red-700 hover:bg-red-50 rounded-full transition-colors"
                >
                  <XCircle size={18} />
                </button>
              </div>
            ) : (
              <div className="group relative">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatValue(value)}
                  </span>
                  {isEditable && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                </div>
                {change && (
                  <div className={`mt-2 flex items-center text-sm ${
                    change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span className="font-medium">
                      {change.type === 'increase' ? '+' : '-'}{change.value}%
                    </span>
                    <span className="ml-1 text-gray-500">vs mês anterior</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {icon && (
          <div className="bg-blue-50 p-3 rounded-full">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableMetric;