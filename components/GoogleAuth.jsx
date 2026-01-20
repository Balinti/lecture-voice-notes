'use client';

import { useState, useEffect, useCallback } from 'react';

// Hardcoded Supabase configuration - DO NOT use environment variables
const SUPABASE_URL = 'https://api.srv936332.hstgr.cloud';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';
const APP_SLUG = 'lecture-voice-notes';

let supabaseClient = null;

// Dynamically load Supabase client via CDN
function loadSupabase() {
  return new Promise((resolve, reject) => {
    if (supabaseClient) {
      resolve(supabaseClient);
      return;
    }

    if (typeof window !== 'undefined' && window.supabase) {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      resolve(supabaseClient);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.async = true;
    script.onload = () => {
      if (window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        resolve(supabaseClient);
      } else {
        reject(new Error('Supabase failed to load'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Supabase script'));
    document.head.appendChild(script);
  });
}

// Track user login - upsert to user_tracking table
async function trackUserLogin(supabase, user) {
  if (!user?.email) return;

  try {
    const now = new Date().toISOString();

    // Check if user+app combo exists
    const { data: existing, error: fetchError } = await supabase
      .from('user_tracking')
      .select('id, login_cnt')
      .eq('email', user.email)
      .eq('app', APP_SLUG)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is expected for new users
      console.error('Error checking user tracking:', fetchError);
      return;
    }

    if (existing) {
      // Update existing record - increment login_cnt and update last_login_ts
      const { error: updateError } = await supabase
        .from('user_tracking')
        .update({
          login_cnt: (existing.login_cnt || 0) + 1,
          last_login_ts: now
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Error updating user tracking:', updateError);
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('user_tracking')
        .insert({
          email: user.email,
          app: APP_SLUG,
          login_cnt: 1,
          last_login_ts: now,
          created_at: now
        });

      if (insertError) {
        console.error('Error inserting user tracking:', insertError);
      }
    }
  } catch (err) {
    console.error('Error in trackUserLogin:', err);
  }
}

export default function GoogleAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState(null);

  const initSupabase = useCallback(async () => {
    try {
      const client = await loadSupabase();
      setSupabase(client);

      // Get initial session
      const { data: { session } } = await client.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);

      // Listen for auth state changes
      const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user || null);

        // Track login on SIGNED_IN event
        if (event === 'SIGNED_IN' && session?.user) {
          await trackUserLogin(client, session.user);
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    } catch (err) {
      console.error('Failed to initialize Supabase:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initSupabase();
  }, [initSupabase]);

  const signInWithGoogle = async () => {
    if (!supabase) {
      console.error('Supabase not initialized');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        console.error('Google sign-in error:', error);
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
    }
  };

  const signOut = async () => {
    if (!supabase) {
      console.error('Supabase not initialized');
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 hidden sm:inline">
          {user.email}
        </span>
        <button
          onClick={signOut}
          className="text-sm text-gray-600 hover:text-gray-900 transition"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition shadow-sm"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Sign in with Google
    </button>
  );
}
