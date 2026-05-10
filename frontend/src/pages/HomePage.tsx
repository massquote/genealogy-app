import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface HealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
}

async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>('/health');
  return data;
}

export function HomePage() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Welcome to FamilyKnot</h1>
        <p className="mt-2 text-slate-600">
          Build your family tree, invite relatives, and watch your branches connect.
        </p>
      </header>

      <Card>
        <CardTitle>API connection status</CardTitle>
        <CardDescription>
          The frontend is calling <code className="rounded bg-slate-100 px-1">GET /api/v1/health</code> on the Laravel backend.
        </CardDescription>

        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 font-mono text-sm">
          {isLoading && <span className="text-slate-500">Pinging API…</span>}
          {isError && <span className="text-red-600">Could not reach the API.</span>}
          {data && (
            <pre className="whitespace-pre-wrap break-words text-slate-800">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>

        <div className="mt-4">
          <Button onClick={() => refetch()} isLoading={isFetching} size="sm">
            Refresh
          </Button>
        </div>
      </Card>
    </div>
  );
}
