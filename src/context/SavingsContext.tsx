
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generateCellValues, formatCurrency, calculatePercentage, animateNumber } from '@/lib/savingsUtils';
import { toast } from '@/components/ui/use-toast';

// Constants
const TOTAL_GOAL = 10000;
const STORAGE_KEY = 'digital-savings-box';

// Types
type SavingsContextType = {
  cellValues: number[];
  filledCells: number[];
  selectedCell: number | null;
  currentAmount: number;
  remainingAmount: number;
  progressPercentage: string;
  selectCell: (index: number) => void;
  makePayment: () => void;
  resetSavings: () => void;
};

// Default context value
const defaultContextValue: SavingsContextType = {
  cellValues: [],
  filledCells: [],
  selectedCell: null,
  currentAmount: 0,
  remainingAmount: TOTAL_GOAL,
  progressPercentage: '0.0',
  selectCell: () => {},
  makePayment: () => {},
  resetSavings: () => {},
};

// Create context
const SavingsContext = createContext<SavingsContextType>(defaultContextValue);

// Provider component
export const SavingsProvider = ({ children }: { children: ReactNode }) => {
  const [cellValues, setCellValues] = useState<number[]>([]);
  const [filledCells, setFilledCells] = useState<number[]>([]);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(TOTAL_GOAL);
  const [progressPercentage, setProgressPercentage] = useState('0.0');

  // Initialize or load saved state
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    if (savedData) {
      try {
        const { cellValues, filledCells, currentAmount } = JSON.parse(savedData);
        setCellValues(cellValues);
        setFilledCells(filledCells);
        setCurrentAmount(currentAmount);
        setRemainingAmount(TOTAL_GOAL - currentAmount);
        setProgressPercentage(calculatePercentage(currentAmount, TOTAL_GOAL));
      } catch (error) {
        console.error('Failed to parse saved data:', error);
        initializeNewSavings();
      }
    } else {
      initializeNewSavings();
    }
  }, []);

  // Save state changes to localStorage
  useEffect(() => {
    if (cellValues.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        cellValues,
        filledCells,
        currentAmount
      }));
    }
  }, [cellValues, filledCells, currentAmount]);

  // Initialize new savings
  const initializeNewSavings = () => {
    const newCellValues = generateCellValues();
    setCellValues(newCellValues);
    setFilledCells([]);
    setSelectedCell(null);
    setCurrentAmount(0);
    setRemainingAmount(TOTAL_GOAL);
    setProgressPercentage('0.0');
  };

  // Select a cell
  const selectCell = (index: number) => {
    // Don't allow selecting filled cells
    if (filledCells.includes(index)) return;
    
    setSelectedCell(index);
  };

  // Make a payment
  const makePayment = () => {
    if (selectedCell === null) {
      toast({
        title: "No cell selected",
        description: "Please select a cell first!",
        variant: "destructive"
      });
      return;
    }

    if (filledCells.includes(selectedCell)) {
      toast({
        title: "Already filled",
        description: "This cell is already filled. Please select another cell.",
        variant: "destructive"
      });
      return;
    }

    // Update filled cells
    const newFilledCells = [...filledCells, selectedCell];
    setFilledCells(newFilledCells);

    // Update amounts with animation
    const newAmount = currentAmount + cellValues[selectedCell];
    
    animateNumber(
      currentAmount, 
      newAmount, 
      1000, 
      (val) => formatCurrency(Math.floor(val)), 
      (formattedVal) => setCurrentAmount(newAmount)
    );

    const newRemaining = TOTAL_GOAL - newAmount;
    
    animateNumber(
      remainingAmount, 
      newRemaining, 
      1000, 
      (val) => formatCurrency(Math.ceil(val)), 
      (formattedVal) => setRemainingAmount(newRemaining)
    );

    // Update progress percentage
    setProgressPercentage(calculatePercentage(newAmount, TOTAL_GOAL));

    // Reset selected cell
    setSelectedCell(null);

    // Show success toast
    toast({
      title: "Payment made!",
      description: `You've saved ${formatCurrency(cellValues[selectedCell])}`,
      variant: "default"
    });

    // Check if goal is reached
    if (newAmount >= TOTAL_GOAL) {
      setTimeout(() => {
        toast({
          title: "Congratulations! 🎉",
          description: "You've reached your savings goal of $10,000!",
          variant: "default",
          duration: 5000,
        });
      }, 1500);
    }
  };

  // Reset savings
  const resetSavings = () => {
    initializeNewSavings();
    toast({
      title: "Savings reset",
      description: "Your savings box has been reset to zero.",
      variant: "default"
    });
  };

  const value = {
    cellValues,
    filledCells,
    selectedCell,
    currentAmount,
    remainingAmount,
    progressPercentage,
    selectCell,
    makePayment,
    resetSavings
  };

  return (
    <SavingsContext.Provider value={value}>
      {children}
    </SavingsContext.Provider>
  );
};

// Hook for using the savings context
export const useSavings = () => {
  const context = useContext(SavingsContext);
  if (context === undefined) {
    throw new Error('useSavings must be used within a SavingsProvider');
  }
  return context;
};
