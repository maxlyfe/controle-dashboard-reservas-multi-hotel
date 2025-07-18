import RankObjective from './RankObjective';
import GrowthObjective from './GrowthObjective';
import { SalesDetail } from '../../atoms/dashboardAtom';

interface ObjectivesDashboardProps {
  details?: SalesDetail | null; 
}

const ObjectivesDashboard = ({ details }: ObjectivesDashboardProps) => {
    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 md:p-6 space-y-6 h-full">
            <RankObjective details={details} />
            <div className="border-t border-gray-200"></div>
            <GrowthObjective details={details} />
        </div>
    );
};

export default ObjectivesDashboard;