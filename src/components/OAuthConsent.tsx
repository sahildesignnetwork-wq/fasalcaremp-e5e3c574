import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Minimal typed wrapper around the beta supabase.auth.oauth namespace.
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export default function OAuthConsent() {
  const params = new URLSearchParams(window.location.search);
  const authorizationId = params.get("authorization_id") ?? "";

  const [sessionReady, setSessionReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Login form state
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setHasSession(!!data.session);
      setSessionReady(true);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setHasSession(!!session);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!sessionReady || !hasSession) return;
    if (!authorizationId) {
      setError("Missing authorization_id");
      return;
    }
    (async () => {
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (error) return setError(error.message ?? "Could not load authorization request.");
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
  }, [sessionReady, hasSession, authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      return setError(error.message ?? "Authorization failed.");
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      return setError("No redirect returned by the authorization server.");
    }
    window.location.href = target;
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: displayName.trim() },
            emailRedirectTo: window.location.href,
          },
        });
        if (error) throw error;
        setNotice("Confirmation email sent. Please verify, then return to this page.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err?.message ?? "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!sessionReady) {
    return <Shell><p>Loading…</p></Shell>;
  }

  if (!hasSession) {
    return (
      <Shell>
        <h1 className="text-xl font-bold mb-1">Sign in to connect</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Sign in to your Fasal Care account to approve this connection.
        </p>
        <form onSubmit={handleAuth} className="space-y-3">
          {isSignup && (
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Name"
              required
            />
          )}
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {notice && <p className="text-sm text-primary">{notice}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "…" : isSignup ? "Create account" : "Sign in"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <button
              type="button"
              className="text-primary ml-1 font-medium"
              onClick={() => {
                setIsSignup(!isSignup);
                setError(null);
                setNotice(null);
              }}
            >
              {isSignup ? "Sign in" : "Sign up"}
            </button>
          </p>
        </form>
      </Shell>
    );
  }

  if (error) {
    return <Shell><p className="text-destructive">Could not load this authorization request: {error}</p></Shell>;
  }
  if (!details) {
    return <Shell><p>Loading authorization request…</p></Shell>;
  }

  const clientName = details.client?.name ?? details.client?.client_name ?? "an app";
  const redirectUri = details.client?.redirect_uri ?? details.client?.redirect_uris?.[0];
  const scopes: string[] = Array.isArray(details.scopes)
    ? details.scopes
    : typeof details.scope === "string"
      ? details.scope.split(/\s+/).filter(Boolean)
      : [];

  return (
    <Shell>
      <h1 className="text-xl font-bold mb-1">
        Connect {clientName} to Fasal Care
      </h1>
      <p className="text-sm text-muted-foreground mb-4">
        This lets {clientName} use Fasal Care as you.
      </p>
      {redirectUri && (
        <p className="text-xs text-muted-foreground mb-4 break-all">
          Redirect: <span className="font-mono">{redirectUri}</span>
        </p>
      )}
      {scopes.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium mb-1">Requested access</p>
          <ul className="text-sm text-muted-foreground list-disc pl-5">
            {scopes.map((s) => (
              <li key={s}>{scopeLabel(s)}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs text-muted-foreground mb-4">
        This does not bypass Fasal Care's permissions or backend policies.
      </p>
      {error && <p className="text-sm text-destructive mb-2">{error}</p>}
      <div className="flex gap-2">
        <Button onClick={() => decide(true)} disabled={busy} className="flex-1">
          {busy ? "…" : "Approve"}
        </Button>
        <Button onClick={() => decide(false)} disabled={busy} variant="outline" className="flex-1">
          Cancel connection
        </Button>
      </div>
    </Shell>
  );
}

function scopeLabel(scope: string): string {
  switch (scope) {
    case "openid":
      return "Verify your identity";
    case "email":
      return "Share your email address";
    case "profile":
      return "Share your basic profile";
    default:
      return `Additional permission: ${scope}`;
  }
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-lg">
        {children}
      </div>
    </main>
  );
}
