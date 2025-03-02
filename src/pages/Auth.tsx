
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Check if the user is already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    
    checkSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setRedirecting(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Error logging in with Google');
    } finally {
      setLoading(false);
    }
  };

  // If user is already logged in, redirect to home page
  if (session || redirecting) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa] px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#654321] mb-2">Digital Savings Box</h1>
          <p className="text-gray-600">Sign in to track your savings journey</p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-4 border border-gray-300 rounded-md shadow-sm flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M19.8 10.2c0-.63-.06-1.25-.16-1.85H10v3.5h5.52a4.71 4.71 0 01-2.04 3.1v2.58h3.3c1.93-1.78 3.02-4.4 3.02-7.33z" fill="#4285F4" />
              <path d="M10 20c2.76 0 5.07-.91 6.77-2.47l-3.3-2.58c-.91.61-2.06.98-3.47.98-2.67 0-4.93-1.8-5.74-4.23H.9v2.66A10 10 0 0010 20z" fill="#34A853" />
              <path d="M4.26 11.7c-.2-.6-.32-1.24-.32-1.9 0-.66.12-1.3.32-1.9V5.24H.9A10 10 0 000 10c0 1.67.41 3.24 1.14 4.66l3.12-2.96z" fill="#FBBC05" />
              <path d="M10 3.88c1.5 0 2.85.52 3.91 1.53l2.93-2.93C15.05.9 12.73 0 10 0 6.08 0 2.66 2.23 1.14 5.34l3.12 2.96C5.07 5.68 7.33 3.88 10 3.88z" fill="#EA4335" />
            </svg>
            <span>{loading ? 'Loading...' : 'Sign in with Google'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
