import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, ExternalLink, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface SavingsBox {
  id: string;
  title: string;
  description: string | null;
  goal_amount: number;
  slug: string;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  created_at: string;
}

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [boxes, setBoxes] = useState<SavingsBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingBoxId, setConnectingBoxId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchBoxes();
  }, [user]);

  const fetchBoxes = async () => {
    const { data, error } = await supabase
      .from('savings_boxes')
      .select('*')
      .eq('owner_id', user!.id)
      .order('created_at', { ascending: false });

    if (!error && data) setBoxes(data as SavingsBox[]);
    setLoading(false);
  };

  const handleConnectStripe = async (boxId: string) => {
    setConnectingBoxId(boxId);
    try {
      const { data, error } = await supabase.functions.invoke('create-connect-account', {
        body: { box_id: boxId },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error('Failed to start Stripe Connect: ' + err.message);
    }
    setConnectingBoxId(null);
  };

  const getBoxStats = async (boxId: string) => {
    const { data } = await supabase
      .from('grid_cells')
      .select('amount, status')
      .eq('box_id', boxId);
    if (!data) return { filled: 0, total: 0 };
    const filled = data.filter(c => c.status === 'filled').reduce((s, c) => s + c.amount, 0);
    const total = data.reduce((s, c) => s + c.amount, 0);
    return { filled, total };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">My Dashboard</h1>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/create"><Plus className="w-4 h-4 mr-1" /> New Box</Link>
            </Button>
            <Button variant="ghost" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-1" /> Sign Out
            </Button>
          </div>
        </div>

        {boxes.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-2">No savings boxes yet</h2>
            <p className="text-muted-foreground mb-4">Create your first savings box to start collecting contributions.</p>
            <Button asChild>
              <Link to="/create"><Plus className="w-4 h-4 mr-1" /> Create Savings Box</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {boxes.map((box) => (
              <div key={box.id} className="bg-card rounded-xl border border-border p-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{box.title}</h2>
                    {box.description && <p className="text-muted-foreground text-sm mt-1">{box.description}</p>}
                  </div>
                  <Link to={`/box/${box.slug}`} className="text-primary hover:underline text-sm flex items-center gap-1">
                    View <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">Goal: ${box.goal_amount.toLocaleString()}</span>
                  <span className="text-muted-foreground">Slug: /{box.slug}</span>
                </div>
                <div className="flex items-center gap-3">
                  {box.stripe_onboarding_complete ? (
                    <span className="text-sm text-green-600 font-medium">✓ Stripe Connected</span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnectStripe(box.id)}
                      disabled={connectingBoxId === box.id}
                    >
                      {connectingBoxId === box.id ? (
                        <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Connecting...</>
                      ) : (
                        'Connect Stripe Account'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Back to home</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
