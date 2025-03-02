
import React from 'react';
import { motion } from 'framer-motion';
import { SavingsProvider } from '@/context/SavingsContext';
import SavingsGrid from '@/components/SavingsGrid';
import StatsDisplay from '@/components/StatsDisplay';
import { useSavings } from '@/context/SavingsContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Main controls for the savings box
const Controls = () => {
  const { makePayment, resetSavings } = useSavings();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="flex flex-wrap justify-center gap-4 my-8"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="button-glow px-6 py-3 bg-gradient-to-r from-wood-dark to-wood-border text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 ease-out"
        onClick={makePayment}
      >
        Make Payment
      </motion.button>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 ease-out"
          >
            Reset Savings
          </motion.button>
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
    </motion.div>
  );
};

// App wrapper with header and footer
const Index = () => {
  return (
    <SavingsProvider>
      <div className="min-h-screen py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-wood-dark mb-4 tracking-tight">
              Digital Savings Box
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transform your savings journey with this interactive digital box. Click on cells to select them, then make a payment to fill them in.
            </p>
          </motion.div>

          <StatsDisplay />
          <Controls />
          <SavingsGrid />

          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-16 text-center text-sm text-gray-500"
          >
            <p>Based on the traditional savings box concept.</p>
            <p className="mt-1">Each filled cell contributes to your $10,000 goal.</p>
          </motion.footer>
        </div>
      </div>
    </SavingsProvider>
  );
};

export default Index;
