import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/savingsUtils';

interface BoxPreview {
  id: string;
  title: string;
  description: string | null;
  goal_amount: number;
  slug: string;
  created_at: string;
}

const Index = () => {
  const { user } = useAuth();
  const [boxes, setBoxes] = useState<BoxPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoxes = async () => {
      const { data } = await supabase
        .from('savings_boxes')
        .select('id, title, description, goal_amount, slug, created_at')
        .eq('stripe_onboarding_complete', true)
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) setBoxes(data as BoxPreview[]);
      setLoading(false);
    };
    fetchBoxes();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="text-2xl font-bold text-primary">CyberMoneyBox</Link>
          <div className="flex gap-2">
            {user ? (
              <Button asChild size="sm">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-5xl font-bold text-foreground leading-tight">
            Save Money,<br />
            <span className="text-primary">One Cell at a Time</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Create your own digital savings box. Share it with friends, family, or your community. 
            Each cell filled is a step closer to your goal.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/signup">Create Your Box</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="#boxes">Browse Boxes</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="text-4xl">📦</div>
              <h3 className="font-semibold text-foreground">Create a Box</h3>
              <p className="text-sm text-muted-foreground">Sign up, name your savings goal, and connect your Stripe account.</p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl">🔗</div>
              <h3 className="font-semibold text-foreground">Share Your Link</h3>
              <p className="text-sm text-muted-foreground">Share your unique box URL. Anyone can contribute by filling a cell.</p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl">🎉</div>
              <h3 className="font-semibold text-foreground">Reach Your Goal</h3>
              <p className="text-sm text-muted-foreground">Watch your grid fill up as contributions roll in. Celebrate when you hit your target!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Boxes */}
      <section id="boxes" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">Active Savings Boxes</h2>
          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : boxes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No active boxes yet. Be the first!</p>
              <Button asChild>
                <Link to="/signup">Create a Box</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {boxes.map((box) => (
                <Link
                  key={box.id}
                  to={`/box/${box.slug}`}
                  className="bg-card rounded-xl border border-border p-6 hover:border-primary transition-colors space-y-2"
                >
                  <h3 className="text-lg font-semibold text-foreground">{box.title}</h3>
                  {box.description && <p className="text-sm text-muted-foreground line-clamp-2">{box.description}</p>}
                  <p className="text-sm text-primary font-medium">Goal: {formatCurrency(box.goal_amount)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 text-center text-sm text-muted-foreground space-y-1">
        <p>© {new Date().getFullYear()} CyberMoneyBox. Based on the traditional savings box concept.</p>
        <p><Link to="/privacy" className="underline hover:text-primary">Privacy Policy</Link></p>
      </footer>
    </div>
  );
};

export default Index;
