
import React from 'react';
import { formatCurrency } from '@/lib/savingsUtils';
import { useSavings } from '@/context/SavingsContext';
import { useAuth } from '@/context/AuthContext';

const StatsDisplay = () => {
  const { currentAmount, remainingAmount, progressPercentage } = useSavings();
  const { user } = useAuth();
  
  return (
    <div className="w-full">
      <div className="bg-wood-dark text-white rounded-xl p-8 shadow-lg">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-[#deb887]">{formatCurrency(currentAmount)}</div>
            <div className="text-sm mt-1">Total Saved</div>
          </div>
          
          <div>
            <div className="text-3xl font-bold text-[#deb887]">{formatCurrency(remainingAmount)}</div>
            <div className="text-sm mt-1">Remaining</div>
          </div>
          
          <div>
            <div className="text-3xl font-bold text-[#deb887]">{progressPercentage}%</div>
            <div className="text-sm mt-1">Progress</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;
