import { useAtom } from 'jotai';
import { currentHotelDetailsAtom } from '../../atoms/dashboardAtom';
import { SalesDetail } from '../../atoms/dashboardAtom';
import { Trophy, Award, Medal } from 'lucide-react';

const calculateSalesRank = (details: SalesDetail | null) => {
    if (!details) return [];
    const channels = [
        { name: 'Recepção/Balcão', value: details.siteRecepcaoBalcao },
        { name: 'Evento', value: details.centralEvents },
        { name: 'Day Use', value: details.centralDayUse },
        { name: 'Vendas Central', value: details.centralSales },
        { name: 'Grupo', value: details.centralPackages },
        { name: 'Booking', value: details.bookingSales },
        { name: 'HotelBeds', value: details.hotelBedsSales },
        { name: 'Keytel', value: details.keytelSales },
        { name: 'Expedia', value: details.expediaSales },
        { name: 'Decolar', value: details.airbnbSales },
        { name: 'Tourmerd', value: details.tourmerdSales },
        { name: 'Planisfério', value: details.planisferioSales },
        { name: 'Itaparica', value: details.itaparicaSales },
        { name: 'Outros', value: details.otherOtaSales },
    ];

    return channels
        .filter(channel => (channel.value ?? 0) > 0)
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
};

const getRankIcon = (index: number) => {
  if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
  if (index === 1) return <Award className="w-5 h-5 text-gray-400" />;
  if (index === 2) return <Medal className="w-5 h-5 text-orange-500" />;
  return <span className="font-semibold text-gray-500 w-5 text-center">{index + 1}</span>;
};


const RankObjective = ({ details: detailsFromProps }: { details?: SalesDetail | null }) => {
  const [currentDetails] = useAtom(currentHotelDetailsAtom);
  // Usa o 'details' recebido via props. Se não receber, usa o 'details' do átomo global (para a visão individual)
  const details = detailsFromProps !== undefined ? detailsFromProps : currentDetails;
  const rank = calculateSalesRank(details);

  if (!details || rank.length === 0) {
    return (
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">Objetivo 1: Top 3 em Vendas</h4>
        <div className="text-center text-sm text-gray-500 py-4">
            Nenhum canal com vendas para exibir o ranking.
        </div>
      </div>
    );
  }

  const centralRank = rank.findIndex(item => item.name === 'Vendas Central') + 1;
  const isObjectiveMet = centralRank > 0 && centralRank <= 3;

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-gray-800">Objetivo 1: Top 3 em Vendas</h4>
        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
          isObjectiveMet
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {isObjectiveMet ? 'CONCLUÍDO' : 'PENDENTE'}
        </span>
      </div>
      
      <ol className="space-y-2">
        {rank.map((item, index) => (
          <li
            key={item.name}
            className={`flex items-center justify-between p-2 rounded-md text-sm ${
              item.name === 'Vendas Central' ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3 truncate">
              {getRankIcon(index)}
              <span className="font-medium text-gray-700 truncate" title={item.name}>{item.name}</span>
            </div>
            <span className="font-mono text-gray-800">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value ?? 0)}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default RankObjective;