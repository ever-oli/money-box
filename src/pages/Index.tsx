
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SavingsProvider } from '@/context/SavingsContext';
import SavingsGrid from '@/components/SavingsGrid';
import StatsDisplay from '@/components/StatsDisplay';
import { useSavings } from '@/context/SavingsContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';
import MoneroWalletModal from '@/components/MoneroWalletModal';

// Main controls for the savings box
const Controls = () => {
  const { makePayment, resetSavings, selectedCellAmount, selectedCell } = useSavings();
  const { signOut, user } = useAuth();
  const [isMoneroModalOpen, setIsMoneroModalOpen] = useState(false);

  // Check if a cell is selected and open modal when appropriate
  useEffect(() => {
    if (selectedCell !== null && selectedCellAmount > 0) {
      setIsMoneroModalOpen(true);
    }
  }, [selectedCell, selectedCellAmount]);

  const handleMakePayment = () => {
    if (selectedCell !== null && selectedCellAmount > 0) {
      setIsMoneroModalOpen(true);
    } else {
      makePayment();
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 my-8">
      <button
        className="bg-wood-dark text-white px-6 py-3 rounded-md font-medium hover:bg-wood-border transition-all duration-300 ease-out"
        onClick={handleMakePayment}
      >
        Make Payment with Monero
      </button>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            className="px-6 py-3 bg-gray-500 text-white rounded-md font-medium hover:bg-gray-600 transition-all duration-300 ease-out"
          >
            Reset Savings
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="border-wood-dark/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all your progress and start a new savings box.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-wood-border text-wood-dark hover:bg-wood-light/20">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetSavings} className="bg-wood-dark text-white hover:bg-wood-border">Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <MoneroWalletModal 
        isOpen={isMoneroModalOpen} 
        onClose={() => setIsMoneroModalOpen(false)} 
        amount={selectedCellAmount}
      />
    </div>
  );
};

// App wrapper with header and footer
const Index = () => {
  const { signOut, user } = useAuth();

  return (
    <SavingsProvider>
      <div className="min-h-screen py-8 px-4 sm:px-6 bg-[#f5f6fa]">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-[#654321]">
              Digital Savings Box
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button 
                onClick={signOut}
                className="text-[#654321] border border-green-500 rounded-md px-4 py-2 flex items-center gap-2 hover:bg-green-50 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>

          <StatsDisplay />
          <Controls />
          <SavingsGrid />

          <footer className="mt-8 text-center text-sm text-gray-500">
            <p>Based on the traditional savings box concept.</p>
          </footer>
        </div>
      </div>
    </SavingsProvider>
  );
};

export default Index;
