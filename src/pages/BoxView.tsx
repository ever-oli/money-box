import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/savingsUtils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface SavingsBox {
  id: string;
  title: string;
  description: string | null;
  goal_amount: number;
  slug: string;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  owner_id: string;
}

interface GridCell {
  id: string;
  cell_index: number;
  amount: number;
  status: string;
  box_id: string | null;
}

const BoxView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [box, setBox] = useState<SavingsBox | null>(null);
  const [cells, setCells] = useState<GridCell[]>([]);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const gridRef = React.useRef<HTMLDivElement>(null);

  const fetchBox = useCallback(async () => {
    const { data: boxData, error } = await supabase
      .from('savings_boxes')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !boxData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setBox(boxData as SavingsBox);

    const { data: cellsData } = await supabase
      .from('grid_cells')
      .select('*')
      .eq('box_id', boxData.id)
      .order('cell_index', { ascending: true });

    if (cellsData) setCells(cellsData as GridCell[]);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    fetchBox();
  }, [fetchBox]);

  // Realtime updates
  useEffect(() => {
    if (!box) return;
    const channel = supabase
      .channel(`box_${box.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'grid_cells', filter: `box_id=eq.${box.id}` }, (payload) => {
        const updated = payload.new as GridCell;
        setCells(prev => prev.map(c => c.cell_index === updated.cell_index ? updated : c));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [box]);

  // Handle success/cancel URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cellIndex = params.get('cell');
    if (params.get('success') === 'true' && cellIndex) {
      toast.loading('Verifying payment...');
      supabase.functions.invoke('verify-payment', {
        body: { cell_index: parseInt(cellIndex), box_id: box?.id },
      }).then(({ data, error }) => {
        toast.dismiss();
        if (error) {
          toast.error('Payment verification failed.');
        } else if (data?.status === 'filled' || data?.status === 'already_filled') {
          toast.success('Payment confirmed! Your cell has been filled.');
        } else {
          toast.error('Payment could not be verified.');
        }
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('canceled') === 'true') {
      toast.info('Payment was canceled.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [box]);

  // Grid resize
  useEffect(() => {
    const update = () => {
      if (gridRef.current) {
        gridRef.current.style.setProperty('--grid-cols', `${window.innerWidth < 640 ? 8 : 16}`);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const initiateCheckout = async () => {
    if (selectedCell === null || !box) return;
    if (!box.stripe_onboarding_complete) {
      toast.error('This savings box is not yet set up for payments.');
      return;
    }
    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { cell_index: selectedCell, box_id: box.id },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast.error('Checkout failed: ' + err.message);
      setIsCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-primary">Box Not Found</h1>
          <p className="text-muted-foreground">This savings box doesn't exist.</p>
          <Link to="/" className="text-primary hover:underline">← Back to home</Link>
        </div>
      </div>
    );
  }

  const filledAmount = cells.filter(c => c.status === 'filled').reduce((s, c) => s + c.amount, 0);
  const remaining = (box?.goal_amount ?? 10000) - filledAmount;
  const progress = Math.round((filledAmount / (box?.goal_amount ?? 10000)) * 100);
  const selectedAmount = selectedCell !== null ? (cells.find(c => c.cell_index === selectedCell)?.amount ?? 0) : 0;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 bg-background">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-primary text-center mb-2">{box?.title}</h1>
        {box?.description && <p className="text-center text-muted-foreground mb-6">{box.description}</p>}

        {/* Stats */}
        <div className="bg-primary text-primary-foreground rounded-xl p-8 shadow-lg mb-5">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-secondary">{formatCurrency(filledAmount)}</div>
              <div className="text-sm mt-1">Total Saved</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary">{formatCurrency(remaining)}</div>
              <div className="text-sm mt-1">Remaining</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary">{progress}%</div>
              <div className="text-sm mt-1">Progress</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-3 my-5">
          <button
            className="px-5 py-2.5 rounded-md font-medium bg-primary text-primary-foreground hover:bg-accent transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
            onClick={initiateCheckout}
            disabled={selectedCell === null || isCheckingOut || !box?.stripe_onboarding_complete}
          >
            {isCheckingOut ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
            ) : !box?.stripe_onboarding_complete ? (
              'Payments not yet enabled'
            ) : selectedCell !== null ? (
              `Contribute ${formatCurrency(selectedAmount)}`
            ) : (
              'Select a cell to contribute'
            )}
          </button>
        </div>

        {/* Grid */}
        <div ref={gridRef} className="w-full max-w-3xl mx-auto rounded-xl relative overflow-hidden">
          <div className="bg-wood-dark rounded-xl p-5 shadow-2xl overflow-hidden border-4 border-wood-border relative">
            <div className="savings-grid py-4 px-2">
              {cells.map((cell) => {
                const isSelected = selectedCell === cell.cell_index;
                const isFilled = cell.status === 'filled';
                const isPending = cell.status === 'pending';
                const className = `cell ${isSelected ? 'selected' : ''} ${isFilled ? 'filled' : ''} ${isPending ? 'pending' : ''}`;
                return (
                  <div
                    key={cell.cell_index}
                    className={className}
                    onClick={isFilled || isPending ? undefined : () => setSelectedCell(cell.cell_index)}
                  >
                    {isFilled ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isPending ? (
                      <span className="text-xs">⏳</span>
                    ) : (
                      <span>${cell.amount}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-muted-foreground space-y-1">
          <p><Link to="/" className="underline hover:text-primary">← Back to home</Link></p>
        </footer>
      </div>
    </div>
  );
};

export default BoxView;
