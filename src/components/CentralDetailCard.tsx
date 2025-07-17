import { MonthlyData, Hotel, SalesDetail } from "../atoms/dashboardAtom";
import { useState } from "react";
import { Building2, Save, X } from "lucide-react";
import EditableMetricDisplay from "./EditableMetricDisplay";

interface CentralDetailCardProps {
  currentData: MonthlyData | undefined;
  detailData: SalesDetail | null;
  isAuthenticated: boolean;
  onUpdateDetail: (updatedDetail: Partial<SalesDetail> & { id: string }) => Promise<void>;
  selectedHotel: string | null;
  hotels: Hotel[];
}

const CentralDetailCard = ({ 
  currentData, 
  detailData, 
  isAuthenticated, 
  onUpdateDetail,
  selectedHotel,
  hotels
}: CentralDetailCardProps) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number | string>("");

  // --- Data Handling --- 
  const centralSales = detailData?.centralSales ?? 0;
  const centralPackages = detailData?.centralPackages ?? 0; // Grupo
  
  // Quantity fields (agora existem na base de dados)
  const centralSalesQty = detailData?.centralSalesQuantity ?? 0;
  const centralPackagesQty = detailData?.centralPackagesQuantity ?? 0;

  // Total Central Sales para meta (centralSales + centralPackages)
  const totalCentralSales = centralSales + centralPackages;

  // Calculate percentage of total sales
  const totalPercentage = (currentData?.totalSales ?? 0) > 0;

  // --- Editing Handlers --- 
  const handleStartEditing = (field: string, value: number) => {
    if (!isAuthenticated) return;
    setEditingField(field);
    setEditValue(value);
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue("");
  };

  const handleSave = async (field: string) => {
    if (!isAuthenticated || !detailData?.id) return;

    let valueToSave: number;
    if (typeof editValue === "string") {
      const cleanValue = editValue.replace(/\./g, "").replace(",", ".");
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
      setEditValue("");
    } catch (error) {
      console.error("Failed to save update:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
    if (e.key === "Enter") {
      handleSave(field);
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const renderEditableField = (field: string, value: number, isQuantity = false) => {
    return editingField === field ? (
      <div className="flex items-center space-x-1 md:space-x-2">
        <div className="relative">
          {!isQuantity && <span className="absolute inset-y-0 left-0 pl-1 md:pl-2 flex items-center text-gray-500 text-xs">R$</span>}
          <input 
            type="number"
            step={isQuantity ? "1" : "0.01"}
            className={`${isQuantity ? 'w-16 md:w-20 pl-1 md:pl-2' : 'w-20 md:w-28 pl-5 md:pl-7'} pr-1 md:pr-2 py-1 text-right border rounded focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs md:text-sm`}
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
        className={`${isAuthenticated ? "cursor-pointer hover:text-purple-600 font-medium" : "font-medium"} break-words text-xs md:text-sm`}
        title={isAuthenticated ? "Clique para editar" : ""}
      >
        {isQuantity ? `Q: ${value}` : `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      </div>
    );
  };

  // --- Render Logic --- 

  // Group View (Read-Only Aggregated)
  if (!selectedHotel) {
    const groupCentralSales = currentData?.centralSales ?? 0;
    const groupTotalPercentage = (currentData?.totalSales ?? 0) > 0
      ? Math.round((groupCentralSales / (currentData?.totalSales ?? 1)) * 100)
      : 0;

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Vendas Diretas Central (Grupo)</h3>
            <div className="bg-purple-100 rounded-full p-2">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <EditableMetricDisplay
            label="Total Vendas Central"
            value={groupCentralSales}
            formatAs="currency"
            className="text-2xl md:text-3xl font-bold text-purple-600 mb-2"
          />
          <div className="text-sm text-gray-500 mb-4">
            Conta para vendas totais
          </div>
          <div className="text-sm text-gray-400 italic">Selecione um hotel para editar os detalhes.</div>
        </div>
      </div>
    );
  }

  // Selected Hotel View (Editable) - APENAS VENDAS CENTRAL
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-gray-500 text-sm font-medium">Vendas Diretas (Central)</h3>
          <div className="bg-purple-100 rounded-full p-2">
            <Building2 className="h-5 w-5 text-purple-600" />
          </div>
        </div>
        <EditableMetricDisplay 
          label="Total Vendas Central"
          value={totalCentralSales}
          formatAs="currency"
          className="text-2xl md:text-3xl font-bold text-purple-600 mb-2"
        />

        <div className="text-sm text-gray-500 mb-4">
            Conta para vendas totais
          </div>
        
        <div className="space-y-3 md:space-y-4">
          <div key="centralSales">
            <div className="flex justify-between items-center mb-1">
              <div className="text-xs md:text-sm font-medium">Vendas Central</div>
              <div className="flex flex-col items-end space-y-1">
                {renderEditableField('centralSales', centralSales, false)}
                {renderEditableField('centralSalesQuantity', centralSalesQty, true)}
              </div>
            </div>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-300" 
                style={{ width: `${totalCentralSales > 0 ? (centralSales / totalCentralSales) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          
          <div key="centralPackages">
            <div className="flex justify-between items-center mb-1">
              <div className="text-xs md:text-sm font-medium">Grupo</div>
              <div className="flex flex-col items-end space-y-1">
                {renderEditableField('centralPackages', centralPackages, false)}
                {renderEditableField('centralPackagesQuantity', centralPackagesQty, true)}
              </div>
            </div>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-300" 
                style={{ width: `${totalCentralSales > 0 ? (centralPackages / totalCentralSales) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentralDetailCard;