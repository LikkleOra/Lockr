"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { getActiveBlocks, BlockType } from '@/lib/blocks';
import AddBlockForm from '@/components/AddBlockForm';
import BlockCard from '@/components/BlockCard';
import BlockEnforcer from '@/components/BlockEnforcer';

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<BlockType[]>([]);
  const [lastSync, setLastSync] = useState(new Date()); // Track last sync time
  const router = useRouter();

  const fetchBlocks = useCallback(async (userId: string) => {
    try {
      const activeBlocks = await getActiveBlocks(userId);
      setBlocks(activeBlocks);
      setLastSync(new Date()); // Update last sync time on successful fetch
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  }, []);

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      const { data: { session } } = await getSession();
      setSession(session);

      if (!session) {
        router.push('/login');
        return;
      }

      await fetchBlocks(session.user.id);
      setLoading(false);
    };

    initializeDashboard();

    // Set up polling for real-time sync
    const pollingInterval = setInterval(() => {
      if (session?.user?.id) {
        fetchBlocks(session.user.id);
      }
    }, 15000); // Poll every 15 seconds

    return () => clearInterval(pollingInterval); // Cleanup interval on unmount
  }, [router, fetchBlocks, session?.user?.id]); // Add session.user.id to dependencies

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {session ? (
        <div>
          <p className="mb-4">Welcome, {session.user.email}!</p>
          <Button onClick={() => supabase.auth.signOut()} className="mb-8">
            Sign Out
          </Button>

          <h2 className="text-2xl font-semibold mb-4">Your Active Blocks</h2>
          {blocks.length === 0 ? (
            <p>No blocks added yet. Add one below!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {blocks.map((block) => (
                <BlockCard key={block.id} block={block} lastSyncTime={lastSync} />
              ))}
            </div>
          )}

          <h2 className="text-2xl font-semibold mt-8 mb-4">Add New Block</h2>
          <AddBlockForm onBlockAdded={() => session?.user?.id && fetchBlocks(session.user.id)} />

          <h2 className="text-2xl font-semibold mt-8 mb-4">Simulate Blocked Content</h2>
          <div className="border p-4 rounded-lg bg-gray-50">
            <p className="mb-2">This section simulates content that might be blocked.</p>
            <BlockEnforcer target="test.com">
              <div className="bg-blue-100 p-4 rounded-md">
                <p>This content is visible if "test.com" is NOT blocked or has been overridden.</p>
                <p>Try adding "test.com" to your blocks and refresh this page!</p>
              </div>
            </BlockEnforcer>
          </div>
        </div>
      ) : (
        <p>Please log in to view your dashboard.</p>
      )}
    </div>
  );
}
