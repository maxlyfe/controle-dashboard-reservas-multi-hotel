import { useAtom } from 'jotai';
import { salesRankAtom } from '../../atoms/dashboardAtom';
import { Trophy, Award, Medal } from 'lucide-react';

const RankObjective = () => {
  const [rank] = useAtom(salesRankAtom);

  if (rank.length === 0) {
    return (
      <div className="text-center text-sm text-gray-500 py-4">
        Nenhum canal com vendas para exibir o ranking.
      </div>
    );
  }

  const centralRank = rank.findIndex(item => item.name === 'Vendas Central') + 1;
  const isObjectiveMet = centralRank > 0 && centralRank <= 3;

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Award className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-orange-500" />;
    return <span className="font-semibold text-gray-500 w-5 text-center">{index + 1}</span>;
  };

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
            <div className="flex items-center space-x-3">
              {getRankIcon(index)}
              <span className="font-medium text-gray-700">{item.name}</span>
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