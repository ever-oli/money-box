import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { generateCellValues } from '@/lib/savingsUtils';

const CreateBox = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState(10000);
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!slug) {
      toast.error('Slug is required');
      return;
    }

    setLoading(true);

    // Create the savings box
    const { data: box, error: boxError } = await supabase
      .from('savings_boxes')
      .insert({
        owner_id: user.id,
        title,
        description: description || null,
        goal_amount: goalAmount,
        slug,
      })
      .select()
      .single();

    if (boxError) {
      toast.error(boxError.message.includes('unique') ? 'That slug is already taken' : boxError.message);
      setLoading(false);
      return;
    }

    // Generate 256 grid cells for this box
    const cellValues = generateCellValues();
    const cells = cellValues.map((amount, index) => ({
      cell_index: index,
      amount,
      status: 'empty',
      box_id: box.id,
    }));

    const { error: cellsError } = await supabase.from('grid_cells').insert(cells);

    if (cellsError) {
      toast.error('Failed to create grid cells: ' + cellsError.message);
      // Clean up the box
      await supabase.from('savings_boxes').delete().eq('id', box.id);
      setLoading(false);
      return;
    }

    toast.success('Savings box created!');
    navigate('/dashboard');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">Create Savings Box</h1>
          <p className="text-muted-foreground mt-2">Set up a new savings box for contributions</p>
        </div>
        <form onSubmit={handleCreate} className="space-y-4 bg-card p-6 rounded-xl shadow-lg border border-border">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => handleTitleChange(e.target.value)} required placeholder="e.g. My Vacation Fund" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What are you saving for?" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal">Goal Amount ($)</Label>
            <Input id="goal" type="number" min={100} max={1000000} value={goalAmount} onChange={(e) => setGoalAmount(parseInt(e.target.value) || 10000)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>/box/</span>
              <Input id="slug" value={slug} onChange={(e) => setSlug(generateSlug(e.target.value))} required placeholder="my-vacation-fund" />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Box'}
          </Button>
        </form>
        <div className="text-center">
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary">← Back to dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default CreateBox;
