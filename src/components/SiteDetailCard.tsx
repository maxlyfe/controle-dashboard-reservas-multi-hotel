import { MonthlyData, Hotel, SalesDetail } from "../atoms/dashboardAtom";
import { useState } from "react";
import { Globe, Save, X } from "lucide-react";
import EditableMetricDisplay from "./EditableMetricDisplay";

interface SiteDetailCardProps {
  currentData: MonthlyData | undefined;
  detailData: SalesDetail | null;
  isAuthenticated: boolean;
  onUpdateDetail: (updatedDetail: Partial<SalesDetail> & { id: string }) => Promise<void>;
  selectedHotel: string | null;
}

const SiteDetailCard = ({ 
  currentData, 
  detailData, 
  isAuthenticated, 
  onUpdateDetail,
  selectedHotel
}: SiteDetailCardProps) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number | string>('');

  // --- Data Handling --- 
  const siteRecepcaoBalcao = detailData?.siteRecepcaoBalcao ?? 0;
  const centralEvents = detailData?.centralEvents ?? 0; // Evento (movido da Central)
  const centralDayUse = detailData?.centralDayUse ?? 0; // Day Use (movido da Central)
  
  // Quantity fields (agora existem na base de dados)
  const siteRecepcaoBalcaoQty = detailData?.siteRecepcaoBalcaoQuantity ?? 0;
  const centralEventsQty = detailData?.centralEventsQuantity ?? 0;
  const centralDayUseQty = detailData?.centralDayUseQuantity ?? 0;
  
  // Total Site Sales (recepção/balcão + evento + day use)
  const totalSiteSales = siteRecepcaoBalcao + centralEvents + centralDayUse;

  // Calculate percentage of total sales (ensure currentData and totalSales exist)

  // --- Editing Handlers --- 
  const handleStartEditing = (field: string, value: number) => {
    if (!isAuthenticated) return;
    setEditingField(field);
    setEditValue(value);
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleSave = async (field: string) => {
    if (!isAuthenticated || !detailData?.id) return;

    let valueToSave: number;
    if (typeof editValue === 'string') {
      const cleanValue = editValue.replace(/\./g, '').replace(',', '.');
      valueToSave = parseFloat(cleanValue);
    } else {
      valueToSave = editValue;
    }

    if (isNaN(valueToSave) || valueToSave < 0) {
      console.error("Invalid value entered");
      handleCancel();
      return;
    }

    const updatePayload: Partial<SalesDetail> & { id: string } = {
      id: detailData.id,
      [field]: valueToSave,
    };

    try {
      await onUpdateDetail(updatePayload);
      setEditingField(null);
      setEditValue('');
    } catch (error) {
      console.error("Failed to save update:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
    if (e.key === 'Enter') {
      handleSave(field);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // --- Render --- 
  if (!selectedHotel) {
    // Display aggregated data for the group (read-only)
    const groupSiteSales = currentData?.siteSales ?? 0;
    const groupTotalPercentage = (currentData?.totalSales ?? 0) > 0
      ? Math.round((groupSiteSales / (currentData?.totalSales ?? 1)) * 100)
      : 0;
      
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Vendas Site Próprio (Grupo)</h3>
            <div className="bg-blue-100 rounded-full p-2">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <EditableMetricDisplay
            label="Total Vendas Site"
            value={groupSiteSales}
            formatAs="currency"
            className="text-2xl md:text-3xl font-bold text-blue-600 mb-2"
          />
          <div className="text-sm text-gray-500 mb-4">
            Conta para vendas totais
          </div>
          <div className="text-sm text-gray-400 italic">Selecione um hotel para editar os detalhes.</div>
        </div>
      </div>
    );
  }

  // Display editable data for the selected hotel - NOVOS CAMPOS
  const fields = [
    { label: 'Recepção/Balcão', field: 'siteRecepcaoBalcao', qtyField: 'siteRecepcaoBalcaoQuantity', value: siteRecepcaoBalcao, qtyValue: siteRecepcaoBalcaoQty },
    { label: 'Evento', field: 'centralEvents', qtyField: 'centralEventsQuantity', value: centralEvents, qtyValue: centralEventsQty },
    { label: 'Day Use', field: 'centralDayUse', qtyField: 'centralDayUseQuantity', value: centralDayUse, qtyValue: centralDayUseQty },
  ];

  const getPercentage = (value: number) => {
    if (totalSiteSales === 0) return 0;
    return ((value || 0) / totalSiteSales) * 100;
  };

  const renderEditableField = (field: string, value: number, isQuantity = false) => {
    return editingField === field ? (
      <div className="flex items-center space-x-1 md:space-x-2">
        <div className="relative">
          {!isQuantity && <span className="absolute inset-y-0 left-0 pl-1 md:pl-2 flex items-center text-gray-500 text-xs">R$</span>}
          <input 
            type="number"
            step={isQuantity ? "1" : "0.01"}
            className={`${isQuantity ? 'w-16 md:w-20 pl-1 md:pl-2' : 'w-20 md:w-28 pl-5 md:pl-7'} pr-1 md:pr-2 py-1 text-right border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs md:text-sm`}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value === '' ? '' : (isQuantity ? parseInt(e.target.value) : parseFloat(e.target.value)))}
            onKeyDown={(e) => handleKeyDown(e, field)}
            autoFocus
          />
        </div>
        <button onClick={() => handleSave(field)} className="p-1 text-green-600 hover:text-green-800">
          <Save size={14} className="md:w-4 md:h-4" />
        </button>
        <button onClick={handleCancel} className="p-1 text-red-600 hover:text-red-800">
          <X size={14} className="md:w-4 md:h-4" />
        </button>
      </div>
    ) : (
      <div 
        onClick={() => handleStartEditing(field, value)}
        className={`${isAuthenticated ? "cursor-pointer hover:text-blue-600 font-medium" : "font-medium"} break-words text-xs md:text-sm`}
        title={isAuthenticated ? "Clique para editar" : ""}
      >
        {isQuantity ? `Q: ${value}` : `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-gray-500 text-sm font-medium">Vendas Site Próprio</h3>
          <div className="bg-blue-100 rounded-full p-2">
            <Globe className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        {/* Display Total - Non-Editable */}
        <EditableMetricDisplay 
          label="Total Vendas Site"
          value={totalSiteSales}
          formatAs="currency"
          className="text-2xl md:text-3xl font-bold text-blue-600 mb-2"
        />
        <div className="text-sm text-gray-500 mb-4">
          {/* TEXTO CORRIGIDO AQUI */}
          Conta para vendas totais
        </div>
        
        {/* Editable Fields */}
        <div className="space-y-3 md:space-y-4">
          {fields.map(({ label, field, qtyField, value, qtyValue }) => {
            const percentage = getPercentage(value);
            return (
              <div key={field}>
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs md:text-sm font-medium">{label}</div>
                  <div className="flex flex-col items-end space-y-1">
                    {renderEditableField(field, value, false)}
                    {renderEditableField(qtyField, qtyValue, true)}
                  </div>
                </div>
                {/* Progress bar */}
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SiteDetailCard;