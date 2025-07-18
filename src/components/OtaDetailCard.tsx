import { MonthlyData, Hotel, SalesDetail } from "../atoms/dashboardAtom";
import { useState, useEffect } from "react";
import { Building, Save, X, Plus } from "lucide-react";
import EditableMetricDisplay from "./EditableMetricDisplay";
import AddOTAModal from "./AddOTAModal";
import { useAtom } from "jotai";
import { otasAtom, loadOTAs, createOTA } from "../atoms/otaAtom";

interface OtaDetailCardProps {
  currentData: MonthlyData | undefined;
  detailData: SalesDetail | null;
  isAuthenticated: boolean;
  onUpdateDetail: (updatedDetail: Partial<SalesDetail> & { id: string }) => Promise<void>;
  selectedHotel: string | null;
  hotels: Hotel[];
}

const OtaDetailCard = ({ 
  currentData, 
  detailData, 
  isAuthenticated, 
  onUpdateDetail,
  selectedHotel,
  hotels
}: OtaDetailCardProps) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number | string>("");
  const [showAddOTAModal, setShowAddOTAModal] = useState(false);
  const [otas, setOTAs] = useAtom(otasAtom);
  const [isLoadingOTAs, setIsLoadingOTAs] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchOTAs = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        setIsLoadingOTAs(true);
        const otaData = await loadOTAs();
        setOTAs(otaData);
      } catch (error) {
        console.warn('Failed to load OTAs:', error);
        console.warn('Using default OTAs due to database table not being available');
        setHasError(true);
        const defaultOTAs = [
          { id: 'booking', name: 'Booking', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'decolar', name: 'Decolar', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'hotelbeds', name: 'HotelBeds', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'tourmerd', name: 'Tourmerd', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'keytel', name: 'Keytel', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'planisferio', name: 'Planisfério', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'expedia', name: 'Expedia', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'itaparica', name: 'Itaparica', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 'outros', name: 'Outros', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ];
        setOTAs(defaultOTAs);
      } finally {
        setIsLoading(false);
        setIsLoadingOTAs(false);
      }
    };
    fetchOTAs();
  }, [setOTAs]);

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

  const handleAddOTA = async (name: string) => {
    try {
      if (hasError) {
        throw new Error('Funcionalidade não disponível: tabela de OTAs não encontrada no banco de dados.');
      }
      const newOTA = await createOTA(name);
      setOTAs(prev => [...prev, newOTA].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar OTA');
    }
  };

  const renderEditableField = (field: string, value: number, isQuantity = false) => {
    if (isAuthenticated && editingField === field) {
      return (
        <div className="flex items-center space-x-1 md:space-x-2">
          <div className="relative">
            {!isQuantity && <span className="absolute inset-y-0 left-0 pl-1 md:pl-2 flex items-center text-gray-500 text-xs">{isQuantity ? 'Q:' : 'R$'}</span>}
            <input 
              type="number"
              step={isQuantity ? "1" : "0.01"}
              className={`${isQuantity ? 'w-16 md:w-20 pl-1 md:pl-2' : 'w-20 md:w-28 pl-5 md:pl-7'} pr-1 md:pr-2 py-1 text-right border rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-xs md:text-sm`}
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
      );
    }
    return (
      <div 
        onClick={() => handleStartEditing(field, value)}
        className={`${isAuthenticated ? "cursor-pointer hover:text-orange-600" : ""} font-medium break-words text-xs md:text-sm`}
        title={isAuthenticated ? "Clique para editar" : ""}
      >
        {isQuantity ? `Q: ${value}` : `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      </div>
    );
  };

  // --- Render Logic --- 
  const totalOtaSales = detailData ? Object.keys(detailData)
    .filter(key => key.endsWith('Sales') && !['centralSales', 'siteRecepcaoBalcao', 'siteReservations', 'centralPackages', 'centralEvents', 'centralDayUse'].includes(key))
    .reduce((sum, key) => sum + (detailData[key] ?? 0), 0) : 0;
  
  const otaFields = [
    { label: "Booking", salesField: "bookingSales", quantityField: "bookingQuantity", value: detailData?.bookingSales ?? 0, quantity: detailData?.bookingQuantity ?? 0, color: "bg-blue-500" },
    { label: "Decolar", salesField: "airbnbSales", quantityField: "decolaQuantity", value: detailData?.airbnbSales ?? 0, quantity: detailData?.decolaQuantity ?? 0, color: "bg-pink-500" },
    { label: "HotelBeds", salesField: "hotelBedsSales", quantityField: "hotelbedsQuantity", value: detailData?.hotelBedsSales ?? 0, quantity: detailData?.hotelbedsQuantity ?? 0, color: "bg-indigo-500" },
    { label: "Tourmerd", salesField: "tourmerdSales", quantityField: "tourmerdQuantity", value: detailData?.tourmerdSales ?? 0, quantity: detailData?.tourmerdQuantity ?? 0, color: "bg-green-500" },
    { label: "Keytel", salesField: "keytelSales", quantityField: "keytelQuantity", value: detailData?.keytelSales ?? 0, quantity: detailData?.keytelQuantity ?? 0, color: "bg-yellow-500" },
    { label: "Planisfério", salesField: "planisferioSales", quantityField: "planisferioQuantity", value: detailData?.planisferioSales ?? 0, quantity: detailData?.planisferioQuantity ?? 0, color: "bg-purple-500" },
    { label: "Expedia", salesField: "expediaSales", quantityField: "expedaQuantity", value: detailData?.expediaSales ?? 0, quantity: detailData?.expedaQuantity ?? 0, color: "bg-red-500" },
    { label: "Itaparica", salesField: "itaparicaSales", quantityField: "itaparicaQuantity", value: detailData?.itaparicaSales ?? 0, quantity: detailData?.itaparicaQuantity ?? 0, color: "bg-teal-500" },
    { label: "Outros", salesField: "otherOtaSales", quantityField: "otherOtaQuantity", value: detailData?.otherOtaSales ?? 0, quantity: detailData?.otherOtaQuantity ?? 0, color: "bg-gray-400" },
  ];

  const getPercentage = (value: number) => {
    if (totalOtaSales === 0) return 0;
    return ((value || 0) / totalOtaSales) * 100;
  };

  // --- VISTA DE GRUPO ---
  if (!selectedHotel) {
    const groupOtaSales = currentData?.otaSales ?? 0;
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Vendas por OTAs (Grupo)</h3>
            <div className="bg-orange-100 rounded-full p-2">
              <Building className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <EditableMetricDisplay
            label="Total Vendas OTAs"
            value={groupOtaSales}
            formatAs="currency"
            className="text-2xl md:text-3xl font-bold text-orange-600 mb-2"
          />
          <div className="text-sm text-gray-500 mb-4">
            Conta para vendas totais
          </div>
          {isAuthenticated && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowAddOTAModal(true)}
                className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Adicionar Nova OTA
              </button>
            </div>
          )}
           <div className="text-sm text-gray-400 italic">Selecione um hotel para editar os detalhes.</div>
        </div>
        
        <AddOTAModal
          isOpen={showAddOTAModal}
          onClose={() => setShowAddOTAModal(false)}
          onAdd={handleAddOTA}
        />
      </div>
    );
  }

  // --- VISTA DE HOTEL INDIVIDUAL ---
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Vendas por OTAs</h3>
            <div className="bg-orange-100 rounded-full p-2">
              <Building className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <div className="text-center">
            <EditableMetricDisplay 
              label="Total Vendas OTAs"
              value={totalOtaSales}
              formatAs="currency"
              className="text-2xl md:text-3xl font-bold text-orange-600 mb-2"
            />
            <div className="text-sm text-gray-500">
              Conta para vendas totais
            </div>
            {isAuthenticated && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowAddOTAModal(true)}
                  className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors"
                >
                  <Plus size={16} className="mr-2" />
                  Adicionar Nova OTA
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {otaFields.map((ota, index) => {
            const percentage = getPercentage(ota.value);
            // Lógica para o último item em uma lista ímpar
            const isLastItem = index === otaFields.length - 1;
            const isOddCount = otaFields.length % 2 !== 0;
            const itemClass = (isLastItem && isOddCount) ? "md:col-span-2" : "";

            return (
              <div key={ota.salesField} className={`${itemClass} space-y-2`}>
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs md:text-sm font-medium">{ota.label}</div>
                  <div className="flex flex-col items-end space-y-1">
                    {renderEditableField(ota.salesField, ota.value, false)}
                    {renderEditableField(ota.quantityField, ota.quantity, true)}
                  </div>
                </div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${ota.color} rounded-full transition-all duration-300`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <AddOTAModal
        isOpen={showAddOTAModal}
        onClose={() => setShowAddOTAModal(false)}
        onAdd={handleAddOTA}
      />
    </div>
  );
};

export default OtaDetailCard;