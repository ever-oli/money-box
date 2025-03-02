
// Utility functions for the savings box application

/**
 * Generate cell values for the savings grid
 * @returns An array of 256 monetary values
 */
export function generateCellValues(): number[] {
  const possibleValues = [5, 10, 20, 50, 100, 200];
  const cellValues: number[] = [];
  
  for (let i = 0; i < 256; i++) {
    const value = possibleValues[Math.floor(Math.random() * possibleValues.length)];
    cellValues.push(value);
  }
  
  return cellValues;
}

/**
 * Format a number as a currency string
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Calculate total of an array of numbers
 * @param values Array of numbers
 * @returns The sum
 */
export function calculateTotal(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0);
}

/**
 * Calculate percentage
 * @param current Current value
 * @param total Total value
 * @returns Percentage string with one decimal place
 */
export function calculatePercentage(current: number, total: number): string {
  const percentage = (current / total) * 100;
  return percentage.toFixed(1);
}

/**
 * Check if arrays are equal
 * @param a First array
 * @param b Second array
 * @returns Boolean indicating if arrays are equal
 */
export function arraysEqual(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Animate a number counting up
 * @param startVal Starting value
 * @param endVal Ending value
 * @param duration Duration in milliseconds
 * @param formatter Function to format the number
 * @param callback Callback function that receives the current value
 */
export function animateNumber(
  startVal: number,
  endVal: number,
  duration: number,
  formatter: (val: number) => string,
  callback: (formattedVal: string) => void
): void {
  const startTime = performance.now();
  const diff = endVal - startVal;

  function update(currentTime: number) {
    const elapsedTime = currentTime - startTime;
    if (elapsedTime > duration) {
      callback(formatter(endVal));
      return;
    }
    
    const progress = elapsedTime / duration;
    const easedProgress = easeOutQuart(progress);
    const currentVal = startVal + diff * easedProgress;
    callback(formatter(currentVal));
    
    requestAnimationFrame(update);
  }
  
  requestAnimationFrame(update);
}

// Easing function for smooth animations
function easeOutQuart(x: number): number {
  return 1 - Math.pow(1 - x, 4);
}
