import { useAtom } from 'jotai';
import { hotelsAtom, currentMonthAllDetailsAtom } from '../atoms/dashboardAtom';
import ObjectivesDashboard from './objectives/ObjectivesDashboard';
import { Loader2 } from 'lucide-react';

const GroupObjectivesRow = () => {
  const [hotels] = useAtom(hotelsAtom);
  const [allDetailsForMonth] = useAtom(currentMonthAllDetailsAtom);

  if (!allDetailsForMonth || allDetailsForMonth.length === 0) {
    return (
        <div className="dashboard-card text-center text-gray-500">
            <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2" />
            Carregando dados dos hotéis...
        </div>
    );
  }

  return (
    <div className="dashboard-card">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Objetivos da Central (por Hotel)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {hotels.map(hotel => {
          const hotelDetails = allDetailsForMonth.find(d => d.hotelId === hotel.id);
          
          return (
            <div key={hotel.id}>
              <h3 className="font-bold text-lg text-center mb-2 text-gray-800">{hotel.name}</h3>
              <ObjectivesDashboard details={hotelDetails || null} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupObjectivesRow;