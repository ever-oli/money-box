import React, { useEffect } from 'react';
import { SavingsProvider, useSavings } from '@/context/SavingsContext';
import SavingsGrid from '@/components/SavingsGrid';
import StatsDisplay from '@/components/StatsDisplay';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/savingsUtils';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';


const Controls = () => {
  const { resetSavings, selectedCellAmount, selectedCell, isCheckingOut, initiateStripeCheckout } = useSavings();

  return (
    <div className="flex flex-wrap justify-center gap-3 my-5">
      {/* Stripe checkout button */}
      <button
        className="px-5 py-2.5 rounded-md font-medium bg-primary text-primary-foreground hover:bg-accent transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
        onClick={initiateStripeCheckout}
        disabled={selectedCell === null || isCheckingOut}
      >
        {isCheckingOut ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : selectedCell !== null ? (
          `Contribute ${formatCurrency(selectedCellAmount)}`
        ) : (
          'Select a cell to contribute'
        )}
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
    </div>
  );
};

const SuccessHandler = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cellIndex = params.get('cell');
    
    if (params.get('success') === 'true' && cellIndex) {
      // Verify payment with backend and update cell
      toast.loading('Verifying payment...');
      supabase.functions.invoke('verify-payment', {
        body: { cell_index: parseInt(cellIndex) },
      }).then(({ data, error }) => {
        toast.dismiss();
        if (error) {
          toast.error('Payment verification failed. Please refresh the page.');
          console.error('Verify error:', error);
        } else if (data?.status === 'filled' || data?.status === 'already_filled') {
          toast.success('Payment confirmed! Your cell has been filled.');
        } else {
          toast.error('Payment could not be verified. Please contact support.');
        }
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('canceled') === 'true') {
      toast.info('Payment was canceled. The cell has been released.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  return null;
};

const Index = () => {
  return (
    <SavingsProvider>
      <SuccessHandler />
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
