import React, { useState, useEffect } from 'react';
import { Save, X, Edit3 } from 'lucide-react';

interface EditableFieldProps {
  label: string;
  field: string; // Field name to be updated in the parent state/DB
  value: number;
  onSave: (newValue: number) => void; // Function to call when saving
  formatAs?: 'currency' | 'number';
  isAuthenticated: boolean;
  icon?: React.ReactNode;
  className?: string; // Class for the displayed value
  inputClassName?: string; // Class for the input field container
  inputType?: 'number' | 'text'; // Input type
}

const EditableField: React.FC<EditableFieldProps> = ({ 
  label, 
  field, 
  value, 
  onSave, 
  formatAs = 'number', 
  isAuthenticated, 
  icon, 
  className,
  inputClassName,
  inputType = 'number'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState<string | number>(value);

  // Update internal state if the external value prop changes
  useEffect(() => {
    if (!isEditing) {
      setCurrentValue(value);
    }
  }, [value, isEditing]);

  const handleStartEdit = () => {
    if (!isAuthenticated) return;
    setCurrentValue(value); // Reset to original value on edit start
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // No need to reset currentValue here, useEffect handles it
  };

  const handleSave = () => {
    let valueToSave: number;
    if (typeof currentValue === 'string') {
      const cleanValue = currentValue.replace(/\./g, '').replace(',', '.');
      valueToSave = parseFloat(cleanValue);
    } else {
      valueToSave = currentValue;
    }

    if (isNaN(valueToSave) || valueToSave < 0) {
      console.error("Invalid value for save");
      // Optionally show an error to the user
      handleCancel(); // Cancel editing on invalid input
      return;
    }

    onSave(valueToSave);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (inputType === 'number') {
      setCurrentValue(e.target.value === '' ? '' : parseFloat(e.target.value));
    } else {
      // Basic handling for text, could add formatting/masking here
      setCurrentValue(e.target.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const safeValue = typeof value === 'number' ? value : 0; // Default to 0 if value is not a number
  const formattedDisplayValue = formatAs === 'currency'
    ? `R$ ${safeValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : safeValue.toLocaleString('pt-BR');

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm text-gray-500 font-medium">{label}</div>
        {icon && !isEditing && <div className="text-gray-400">{icon}</div>}
      </div>

      {isEditing ? (
        <div className={`flex items-center space-x-2 ${inputClassName || ''}`}>
          <div className="relative flex-grow">
            {formatAs === 'currency' && <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-500">R$</span>}
            <input 
              type={inputType}
              step={inputType === 'number' ? "0.01" : undefined}
              className={`w-full ${formatAs === 'currency' ? 'pl-7' : 'pl-2'} pr-2 py-1 text-right border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
              value={currentValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoFocus
              onBlur={handleSave} // Save on blur as well
            />
          </div>
          {/* <button onClick={handleSave} className="p-1 text-green-600 hover:text-green-800" title="Salvar">
            <Save size={18} />
          </button>
          <button onClick={handleCancel} className="p-1 text-red-600 hover:text-red-800" title="Cancelar">
            <X size={18} />
          </button> */} 
        </div>
      ) : (
        <div 
          className={`flex items-center justify-between ${isAuthenticated ? 'cursor-pointer group' : ''}`}
          onClick={handleStartEdit}
          title={isAuthenticated ? "Clique para editar" : label}
        >
          <div className={className || "text-2xl font-semibold"}>{formattedDisplayValue}</div>
          {isAuthenticated && (
            <Edit3 size={16} className="text-gray-400 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"/>
          )}
        </div>
      )}
    </div>
  );
};

export default EditableField;

