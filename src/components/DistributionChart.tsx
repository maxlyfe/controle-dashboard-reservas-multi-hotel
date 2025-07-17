import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Legend, Tooltip } from 'recharts';
import { Hotel, SalesDetail } from '../atoms/dashboardAtom'; // Import interfaces

interface DistributionChartProps {
  salesDetails: SalesDetail[]; // Pass all details for the current month
  hotels: Hotel[]; // Pass the list of hotels
}

// Define color palettes
const HOTEL_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const CHANNEL_COLORS = ['#60a5fa', '#facc15', '#fb923c']; // Site, Central, OTAs

// Helper to calculate total sales for a single detail record
const calculateDetailTotalSales = (detail: SalesDetail): number => {
  return (
    (detail.siteRecepcaoBalcao ?? 0) + // FIXED: Include siteRecepcaoBalcao in total calculation
    (detail.centralSales ?? 0) +
    (detail.centralPackages ?? 0) +
    (detail.centralDayUse ?? 0) +
    (detail.centralEvents ?? 0) +
    (detail.bookingSales ?? 0) +
    (detail.airbnbSales ?? 0) +
    (detail.expediaSales ?? 0) +
    (detail.hotelBedsSales ?? 0) +
    (detail.otherOtaSales ?? 0) +
    (detail.tourmerdSales ?? 0) +
    (detail.keytelSales ?? 0) +
    (detail.planisferioSales ?? 0) +
    (detail.itaparicaSales ?? 0)
  );
};

// Helper to calculate channel sales for a single detail record
const calculateDetailChannelSales = (detail: SalesDetail): { site: number; central: number; ota: number } => {
  // Site inclui apenas campos que não contam para meta
  const site = (detail.siteRecepcaoBalcao ?? 0) + (detail.centralDayUse ?? 0) + (detail.centralEvents ?? 0);
  // Central inclui centralSales + centralPackages (Grupo)
  const central = (detail.centralSales ?? 0) + (detail.centralPackages ?? 0);
  const ota = (detail.bookingSales ?? 0) + (detail.airbnbSales ?? 0) + (detail.expediaSales ?? 0) + (detail.hotelBedsSales ?? 0) + (detail.otherOtaSales ?? 0) + (detail.tourmerdSales ?? 0) + (detail.keytelSales ?? 0) + (detail.planisferioSales ?? 0) + (detail.itaparicaSales ?? 0);
  return { site, central, ota };
};

// Custom Tooltip Formatter
const renderCustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const totalValue = payload[0].payload.payload.totalValue; // Access total from nested payload
    const percentage = totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(1) : 0;
    return (
      <div className="bg-white p-2 border rounded shadow text-sm">
        <p className="font-semibold">{`${data.name}`}</p>
        <p>{`Valor: R$ ${data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>
        <p>{`Percentual: ${percentage}%`}</p>
      </div>
    );
  }
  return null;
};

const DistributionChart = ({ 
  salesDetails = [], 
  hotels = []
}: DistributionChartProps) => {

  // 1. Calculate Sales per Hotel
  const salesByHotelMap = new Map<string, number>();
  salesDetails.forEach(detail => {
    const currentSales = salesByHotelMap.get(detail.hotelId) ?? 0;
    salesByHotelMap.set(detail.hotelId, currentSales + calculateDetailTotalSales(detail));
  });

  const totalSalesAllHotels = Array.from(salesByHotelMap.values()).reduce((sum, val) => sum + val, 0);

  const hotelChartData = hotels
    .map(hotel => ({
      name: hotel.name,
      value: salesByHotelMap.get(hotel.id) ?? 0,
      totalValue: totalSalesAllHotels // Add total for percentage calculation in tooltip
    }))
    .filter(data => data.value > 0); // Only include hotels with sales

  // 2. Calculate Sales per Channel
  let totalSiteSales = 0;
  let totalCentralSales = 0;
  let totalOtaSales = 0;

  salesDetails.forEach(detail => {
    const { site, central, ota } = calculateDetailChannelSales(detail);
    totalSiteSales += site;
    totalCentralSales += central;
    totalOtaSales += ota;
  });

  const totalSalesAllChannels = totalSiteSales + totalCentralSales + totalOtaSales;

  const channelChartData = [
    { name: 'Site Próprio', value: totalSiteSales, totalValue: totalSalesAllChannels },
    { name: 'Central/Direto', value: totalCentralSales, totalValue: totalSalesAllChannels },
    { name: 'OTAs', value: totalOtaSales, totalValue: totalSalesAllChannels },
  ].filter(data => data.value > 0); // Only include channels with sales

  // If no sales at all, display a message
  if (totalSalesAllHotels === 0) {
    return <div className="text-center text-gray-500 py-8">Sem dados de vendas para exibir a distribuição.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      {/* Chart by Hotel */}
      <div>
        <h4 className="text-center font-semibold text-gray-600 mb-2">Distribuição por Hotel</h4>
        <div className="w-full h-64 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={hotelChartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                // label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {hotelChartData.map((entry, index) => (
                  <Cell key={`cell-hotel-${index}`} fill={HOTEL_COLORS[index % HOTEL_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={renderCustomTooltip} />
              <Legend layout="vertical" verticalAlign="middle" align="right" iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart by Channel */}
      <div>
        <h4 className="text-center font-semibold text-gray-600 mb-2">Distribuição por Canal</h4>
        <div className="w-full h-64 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={channelChartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                // label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {channelChartData.map((entry, index) => (
                  <Cell key={`cell-channel-${index}`} fill={CHANNEL_COLORS[index % CHANNEL_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={renderCustomTooltip} />
              <Legend layout="vertical" verticalAlign="middle" align="right" iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DistributionChart;