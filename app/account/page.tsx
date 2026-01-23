import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

interface Purchase {
  id: string;
  pack_id: string;
  amount_total: number;
  currency: string;
  created_at: string;
  study_packs: {
    title: string;
  } | null;
}

interface Subscription {
  id: string;
  stripe_customer_id: string | null;
  status: string;
  current_period_end: string | null;
}

export default async function AccountPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Setup Required</h1>
          <p className="text-gray-600">Supabase is not configured.</p>
        </div>
      </div>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  // Fetch subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Fetch purchases
  const { data: purchases } = await supabase
    .from('purchases')
    .select(`
      *,
      study_packs (
        title
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const sub = subscription as Subscription | null;
  const purchaseList = (purchases || []) as Purchase[];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-semibold text-xl">CiteDeck</span>
          </Link>
          <nav className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">
              {user.email}
            </span>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm">
              Dashboard
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="text-gray-600 hover:text-gray-900 text-sm">
                Sign Out
              </button>
            </form>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Account</h1>

        {/* Profile section */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Profile</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Member since</p>
              <p className="font-medium">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Subscription section */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Subscription</h2>
          {sub ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium capitalize">{sub.status}</p>
              </div>
              {sub.current_period_end && (
                <div>
                  <p className="text-sm text-gray-500">Current period ends</p>
                  <p className="font-medium">
                    {new Date(sub.current_period_end).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600">No active subscription. Purchase exam packs individually.</p>
          )}
        </div>

        {/* Purchases section */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Purchase History</h2>
          {purchaseList.length > 0 ? (
            <div className="space-y-4">
              {purchaseList.map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">
                      {purchase.study_packs?.title || 'Exam Pack'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(purchase.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {purchase.amount_total
                        ? `${(purchase.amount_total / 100).toFixed(2)} ${(purchase.currency || 'usd').toUpperCase()}`
                        : 'N/A'}
                    </p>
                    {purchase.pack_id && (
                      <Link
                        href={`/packs/${purchase.pack_id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View pack
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No purchases yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
