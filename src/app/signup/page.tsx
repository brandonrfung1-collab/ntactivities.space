import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';
import { getCurrentUser } from '@/lib/supabase/server';
import type { SearchParams } from '@/lib/filters';

export const metadata: Metadata = {
  title: 'Create an account',
  description: 'Create a free ntactivity account to save Newton favorites and write reviews.',
  robots: { index: false, follow: false },
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const requested = Array.isArray(sp.next) ? sp.next[0] : sp.next;
  const next = requested?.startsWith('/') ? requested : '/';

  const user = await getCurrentUser();
  if (user) redirect(next);

  return (
    <div className="container flex justify-center py-14">
      <div className="w-full max-w-sm">
        <header className="mb-7 text-center">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Join your neighbors</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Save the places you love and help others find them.
          </p>
        </header>
        <AuthForm mode="signup" next={next} />
      </div>
    </div>
  );
}
