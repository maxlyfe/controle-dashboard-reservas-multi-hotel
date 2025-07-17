import { useState } from 'react';
import { Hotel } from '../atoms/dashboardAtom';
import { Building } from 'lucide-react';

interface HotelSelectorProps {
  hotels: Hotel[];
  selectedHotel: string | null;
  onSelectHotel: (hotelId: string | null) => void;
}

const HotelSelector = ({ hotels, selectedHotel, onSelectHotel }: HotelSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedHotelName = selectedHotel 
    ? hotels.find(h => h.id === selectedHotel)?.name 
    : 'Grupo Meridiana Hoteles';
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <Building size={18} className="text-blue-600" />
        <span className="text-sm font-medium">{selectedHotelName}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 py-1 border border-gray-200">
          <div className="max-h-60 overflow-y-auto">
            <button
              onClick={() => {
                onSelectHotel(null);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                selectedHotel === null ? 'bg-blue-50 text-blue-600 font-medium' : ''
              }`}
            >
              Grupo Meridia Hoteles
            </button>
            
            <div className="border-t border-gray-100 my-1"></div>
            
            {hotels.map(hotel => (
              <button
                key={hotel.id}
                onClick={() => {
                  onSelectHotel(hotel.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  selectedHotel === hotel.id ? 'bg-blue-50 text-blue-600 font-medium' : ''
                }`}
              >
                {hotel.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelSelector;
