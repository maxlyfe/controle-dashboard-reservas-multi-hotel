import RankObjective from './RankObjective';
import GrowthObjective from './GrowthObjective';

const ObjectivesDashboard = () => {
    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 md:p-6 space-y-6">
            <RankObjective />
            <div className="border-t border-gray-200"></div>
            <GrowthObjective />
        </div>
    );
};

export default ObjectivesDashboard;