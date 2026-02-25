import React, { useState } from 'react';
import { SavingsProvider } from '@/context/SavingsContext';
import SavingsGrid from '@/components/SavingsGrid';
import StatsDisplay from '@/components/StatsDisplay';
import { useSavings } from '@/context/SavingsContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import MoneroWalletModal from '@/components/MoneroWalletModal';

const Controls = () => {
  const { makePayment, resetSavings, selectedCellAmount, selectedCell } = useSavings();
  const [isMoneroModalOpen, setIsMoneroModalOpen] = useState(false);

  const handleMakePayment = () => {
    if (selectedCell !== null && selectedCellAmount > 0) {
      setIsMoneroModalOpen(true);
    } else {
      makePayment();
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-3 my-5">
      <button
        className="px-5 py-2.5 rounded-md font-medium bg-primary text-primary-foreground hover:bg-accent transition-all duration-300"
        onClick={handleMakePayment}
      >
        Contribute with Monero
      </button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className="px-5 py-2.5 rounded-md font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-all duration-300">
            Reset Savings
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all your progress and start a new savings box.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetSavings} className="bg-primary text-primary-foreground hover:bg-accent">
              Reset
            </AlertDialogAction>
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

const Index = () => {
  return (
    <SavingsProvider>
      <div className="min-h-screen py-8 px-4 sm:px-6 bg-background">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-primary text-center mb-6">
            Digital Savings Box
          </h1>

          <StatsDisplay />
          <Controls />
          <SavingsGrid />

          <footer className="mt-8 text-center text-sm text-muted-foreground">
            <p>Based on the traditional savings box concept.</p>
          </footer>
        </div>
      </div>
    </SavingsProvider>
  );
};

export default Index;
