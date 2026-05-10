import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-5xl font-bold text-slate-900">404</h1>
      <p className="mt-2 text-slate-600">This branch doesn’t exist on the tree.</p>
      <Link to="/" className="mt-6">
        <Button variant="primary">Back home</Button>
      </Link>
    </div>
  );
}
