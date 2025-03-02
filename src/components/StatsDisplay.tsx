
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/savingsUtils';
import { useSavings } from '@/context/SavingsContext';

const StatsDisplay = () => {
  const { currentAmount, remainingAmount, progressPercentage } = useSavings();
  
  // Refs for statistics display elements
  const progressRef = useRef<HTMLDivElement>(null);
  
  // Update progress bar
  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${Math.min(parseFloat(progressPercentage), 100)}%`;
    }
  }, [progressPercentage]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Saved" 
          value={formatCurrency(currentAmount)} 
          icon="saved"
          color="from-emerald-500 to-teal-600"
        />
        <StatCard 
          title="Remaining" 
          value={formatCurrency(remainingAmount)} 
          icon="remaining"
          color="from-amber-500 to-orange-600"
        />
        <StatCard 
          title="Progress" 
          value={`${progressPercentage}%`} 
          icon="progress"
          color="from-blue-500 to-indigo-600"
          progressBar={
            <div className="h-2 w-full bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div 
                ref={progressRef} 
                className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(parseFloat(progressPercentage), 100)}%` }}
              />
            </div>
          }
        />
      </div>
    </motion.div>
  );
};

type StatCardProps = {
  title: string;
  value: string;
  icon: 'saved' | 'remaining' | 'progress';
  color: string;
  progressBar?: React.ReactNode;
};

const StatCard = ({ title, value, icon, color, progressBar }: StatCardProps) => {
  return (
    <motion.div 
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="stats-card bg-white rounded-xl p-6 relative overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${color}`} />
      
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg`}>
          {icon === 'saved' && (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          )}
          {icon === 'remaining' && (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12h8" />
            </svg>
          )}
          {icon === 'progress' && (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6H10a6 6 0 0 0-6 6v0a6 6 0 0 0 6 6h10" />
              <circle cx="20" cy="12" r="2" />
            </svg>
          )}
        </div>
        
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
            {value}
          </p>
        </div>
      </div>
      
      {progressBar}
    </motion.div>
  );
};

export default StatsDisplay;
