import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GridCell {
  id: string;
  cell_index: number;
  amount: number;
  status: string;
  session_id: string | null;
  stripe_session_id: string | null;
}

export interface SavingsContextType {
  gridCells: GridCell[];
  filledCells: string[];
  currentAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  selectedCell: number | null;
  selectedCellAmount: number;
  selectCell: (index: number) => void;
  cellValues: number[];
  isLoading: boolean;
  isCheckingOut: boolean;
  initiateStripeCheckout: () => Promise<void>;
  resetSavings: () => Promise<void>;
}

const SavingsContext = createContext<SavingsContextType | null>(null);

export const useSavings = () => {
  const context = useContext(SavingsContext);
  if (!context) {
    throw new Error("useSavings must be used within a SavingsProvider");
  }
  return context;
};

export const SavingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gridCells, setGridCells] = useState<GridCell[]>([]);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Fetch grid cells from database
  const fetchCells = useCallback(async () => {
    const { data, error } = await supabase
      .from('grid_cells')
      .select('*')
      .order('cell_index', { ascending: true });

    if (error) {
      console.error('Error fetching cells:', error);
      return;
    }

    if (data) {
      setGridCells(data as GridCell[]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCells();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('grid_cells_realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'grid_cells' },
        (payload) => {
          const updated = payload.new as GridCell;
          setGridCells((prev) =>
            prev.map((cell) =>
              cell.cell_index === updated.cell_index ? updated : cell
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCells]);

  const selectCell = (index: number) => {
    const cell = gridCells.find((c) => c.cell_index === index);
    if (cell && cell.status === 'empty') {
      setSelectedCell(index);
    }
  };

  const selectedCellAmount = selectedCell !== null
    ? (gridCells.find((c) => c.cell_index === selectedCell)?.amount ?? 0)
    : 0;

  const initiateStripeCheckout = async () => {
    if (selectedCell === null) return;

    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { cell_index: selectedCell },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setIsCheckingOut(false);
      // Revert pending state if checkout fails
      await supabase
        .from('grid_cells')
        .update({ status: 'empty' })
        .eq('cell_index', selectedCell)
        .eq('status', 'pending');
    }
  };

  const resetSavings = async () => {
    const { error } = await supabase
      .from('grid_cells')
      .update({ status: 'empty', stripe_session_id: null })
      .neq('status', 'empty');

    if (!error) {
      setSelectedCell(null);
      fetchCells();
    }
  };

  const filledCells = gridCells
    .filter((c) => c.status === 'filled')
    .map((c) => c.cell_index.toString());

  const currentAmount = gridCells
    .filter((c) => c.status === 'filled')
    .reduce((sum, c) => sum + c.amount, 0);

  const GOAL = 10000;
  const remainingAmount = GOAL - currentAmount;
  const progressPercentage = Math.round((currentAmount / GOAL) * 100);

  const cellValues = gridCells.map((c) => c.amount);

  return (
    <SavingsContext.Provider
      value={{
        gridCells,
        filledCells,
        currentAmount,
        remainingAmount,
        progressPercentage,
        selectedCell,
        selectedCellAmount,
        selectCell,
        cellValues,
        isLoading,
        isCheckingOut,
        initiateStripeCheckout,
        resetSavings,
      }}
    >
      {children}
    </SavingsContext.Provider>
  );
};
