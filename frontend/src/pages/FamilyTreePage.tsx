import { useEffect, useMemo, useRef, useState } from 'react';
import Tree from 'react-d3-tree';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardDescription, CardTitle } from '@/components/ui/Card';
import { FamilyTreeNode } from '@/components/feature/FamilyTreeNode';
import { useAuth } from '@/hooks/useAuth';
import { useTree } from '@/hooks/useTree';
import { buildDescendantTree, findParents } from '@/lib/treeData';

export function FamilyTreePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const myPersonId = user?.person?.id;

  const rootIdParam = searchParams.get('rootId');
  const rootId = rootIdParam ? Number(rootIdParam) : myPersonId;

  const tree = useTree(rootId);
  const containerRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 80 });

  // Centre the tree horizontally on first render
  useEffect(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      setTranslate({ x: width / 2, y: 80 });
    }
  }, []);

  const hierarchy = useMemo(() => {
    if (!tree.data || !rootId) return null;
    return buildDescendantTree(rootId, tree.data.data.people, tree.data.data.relationships);
  }, [tree.data, rootId]);

  const parentIds = useMemo(() => {
    if (!tree.data || !rootId) return [];
    return findParents(rootId, tree.data.data.relationships);
  }, [tree.data, rootId]);

  const peopleById = useMemo(() => {
    const map = new Map<number, string>();
    tree.data?.data.people.forEach((p) => map.set(p.id, p.full_name));
    return map;
  }, [tree.data]);

  const reroot = (id: number | undefined) => {
    if (!id) return;
    setSearchParams({ rootId: String(id) });
  };

  if (!myPersonId) {
    return (
      <Card padding="lg">
        <CardTitle>No tree yet</CardTitle>
        <CardDescription>Set up your profile first to start your tree.</CardDescription>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Family Tree</h1>
          <p className="mt-1 text-slate-600">
            Click any node to open their profile · drag to pan · scroll to zoom.
          </p>
        </div>
        {rootId !== myPersonId && (
          <Button variant="secondary" size="sm" onClick={() => reroot(myPersonId)}>
            Centre on me
          </Button>
        )}
      </header>

      {parentIds.length > 0 && (
        <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm">
          <span className="text-slate-500">Re-root upward:</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {parentIds.map((pid) => (
              <button
                key={pid}
                type="button"
                onClick={() => reroot(pid)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                ↑ {peopleById.get(pid) ?? `Person #${pid}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="h-[640px] w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      >
        {tree.isLoading ? (
          <div className="flex h-full items-center justify-center text-slate-500">
            Building your tree…
          </div>
        ) : tree.isError ? (
          <div className="flex h-full items-center justify-center text-red-600">
            Could not load the tree.
          </div>
        ) : !hierarchy ? (
          <div className="flex h-full items-center justify-center text-slate-500">
            No descendants to draw — try re-rooting on a parent above.
          </div>
        ) : (
          <Tree
            data={hierarchy}
            translate={translate}
            orientation="vertical"
            pathFunc="step"
            renderCustomNodeElement={(props) => <FamilyTreeNode {...props} />}
            separation={{ siblings: 1.4, nonSiblings: 1.8 }}
            nodeSize={{ x: 240, y: 150 }}
            zoomable
            collapsible={false}
          />
        )}
      </div>

      <p className="text-xs text-slate-500">
        Showing {tree.data?.meta.total_people ?? 0} people across{' '}
        {tree.data?.meta.total_relationships ?? 0} relationships.{' '}
        <Link to="/relatives/new" className="text-brand-700 hover:underline">
          Add a relative
        </Link>
      </p>
    </div>
  );
}
