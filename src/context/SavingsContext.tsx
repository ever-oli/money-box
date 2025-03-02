
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Define the shape of a grid cell
export interface GridCell {
  id: string;
  amount: number;
}

// Define the context type
export interface SavingsContextType {
  gridCells: GridCell[];
  filledCells: string[];
  currentAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  makePayment: () => void;
  resetSavings: () => void;
  selectedCellAmount: number;
  completePayment: () => void;
  // Add the missing properties needed for SavingsGrid.tsx
  cellValues: number[];
  selectedCell: number | null;
  selectCell: (index: number) => void;
}

// Create the context with a default value of null
const SavingsContext = createContext<SavingsContextType | null>(null);

// Create a custom hook to use the context
export const useSavings = () => {
  const context = useContext(SavingsContext);
  if (!context) {
    throw new Error("useSavings must be used within a SavingsProvider");
  }
  return context;
};

export const SavingsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [gridCells, setGridCells] = useState<GridCell[]>([]);
  const [filledCells, setFilledCells] = useState<string[]>([]);
  const [selectedCellAmount, setSelectedCellAmount] = useState<number>(0);
  // Add state for the selected cell index
  const [selectedCell, setSelectedCell] = useState<number | null>(null);

  useEffect(() => {
    // Load filled cells from localStorage on component mount
    const storedFilledCells = localStorage.getItem("filledCells");
    if (storedFilledCells) {
      setFilledCells(JSON.parse(storedFilledCells));
    }

    // Initialize grid cells
    const initialCells = Array.from({ length: 256 }, (_, index) => ({
      id: index.toString(),
      amount: getRandomAmount(), // Use function to get proper amounts
    }));
    setGridCells(initialCells);
  }, []);

  // Function to get random amount based on PRD requirements ($5, $10, $20, $50, $100, $200)
  const getRandomAmount = () => {
    const amounts = [5, 10, 20, 50, 100, 200];
    return amounts[Math.floor(Math.random() * amounts.length)];
  };

  // Function to select a cell by its index
  const selectCell = (index: number) => {
    if (index !== null && !filledCells.includes(index.toString())) {
      setSelectedCell(index);
      // Set the selected cell amount based on the grid cell amount
      if (gridCells.length > 0 && index < gridCells.length) {
        setSelectedCellAmount(gridCells[index].amount);
      }
    }
  };

  const makePayment = () => {
    // This function is now used as a fallback if no cell is selected
    if (selectedCell !== null) {
      return; // If a cell is already selected, don't do anything
    }
    
    if (gridCells.length === 0 || filledCells.length === 256) {
      return; // No cells available or all filled
    }
    
    // Find an unfilled cell at random
    const unfilledCells = gridCells.filter(
      (cell) => !filledCells.includes(cell.id)
    );
    
    if (unfilledCells.length === 0) return;
    
    const randomCell = unfilledCells[Math.floor(Math.random() * unfilledCells.length)];
    setSelectedCellAmount(randomCell.amount);
    
    // Also set the selected cell index
    const selectedIndex = gridCells.findIndex(cell => cell.id === randomCell.id);
    if (selectedIndex !== -1) {
      setSelectedCell(selectedIndex);
    }
  };
  
  // Complete payment function for when Monero payment is confirmed
  const completePayment = () => {
    if (selectedCell !== null && selectedCellAmount > 0) {
      const cellId = gridCells[selectedCell].id;
      
      if (!filledCells.includes(cellId)) {
        // Add cell to filled cells
        setFilledCells([...filledCells, cellId]);
        
        // Save to localStorage
        localStorage.setItem(
          "filledCells",
          JSON.stringify([...filledCells, cellId])
        );
        
        // Reset selected amount and cell
        setSelectedCellAmount(0);
        setSelectedCell(null);
      }
    }
  };

  const resetSavings = () => {
    // Clear filled cells from state
    setFilledCells([]);
    setSelectedCell(null);
    setSelectedCellAmount(0);

    // Clear filled cells from localStorage
    localStorage.removeItem("filledCells");
  };

  const currentAmount = gridCells.reduce((sum, cell) => {
    if (filledCells.includes(cell.id)) {
      return sum + cell.amount;
    }
    return sum;
  }, 0);

  const totalPossibleAmount = gridCells.reduce((sum, cell) => sum + cell.amount, 0);
  const remainingAmount = totalPossibleAmount - currentAmount;
  const progressPercentage = totalPossibleAmount === 0 ? 0 : Math.round((currentAmount / totalPossibleAmount) * 100);

  // Create cellValues array for the grid
  const cellValues = gridCells.map(cell => cell.amount);

  return (
    <SavingsContext.Provider
      value={{
        gridCells,
        filledCells,
        currentAmount,
        remainingAmount,
        progressPercentage,
        makePayment,
        resetSavings,
        selectedCellAmount,
        completePayment,
        // Add the missing properties
        cellValues,
        selectedCell,
        selectCell,
      }}
    >
      {children}
    </SavingsContext.Provider>
  );
};
