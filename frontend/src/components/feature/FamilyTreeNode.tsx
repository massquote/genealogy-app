import type { CustomNodeElementProps } from 'react-d3-tree';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/cn';
import type { TreeNodeAttributes } from '@/lib/treeData';

const NODE_W = 200;
const NODE_H = 92;

const genderClasses: Record<string, { bg: string; border: string }> = {
  male: { bg: 'bg-sky-50', border: 'border-sky-400' },
  female: { bg: 'bg-pink-50', border: 'border-pink-400' },
  other: { bg: 'bg-violet-50', border: 'border-violet-400' },
  unknown: { bg: 'bg-slate-50', border: 'border-slate-400' },
};

export function FamilyTreeNode({ nodeDatum }: CustomNodeElementProps) {
  const navigate = useNavigate();
  const attrs = nodeDatum.attributes as unknown as TreeNodeAttributes | undefined;
  if (!attrs) return null;

  const tone = genderClasses[attrs.gender] ?? genderClasses.unknown;
  const dobYear = attrs.dob ? attrs.dob.slice(0, 4) : '';
  const spouseDisplay = attrs.spouseNames
    ? String(attrs.spouseNames).length > 26
      ? `${String(attrs.spouseNames).slice(0, 26)}…`
      : String(attrs.spouseNames)
    : '';

  return (
    <g onClick={() => navigate(`/people/${attrs.id}`)} style={{ cursor: 'pointer' }}>
      <foreignObject x={-NODE_W / 2} y={-NODE_H / 2} width={NODE_W} height={NODE_H}>
        <div
          // xmlns is required so the browser parses the inner content as HTML
          // when it lives inside an SVG <foreignObject>.
          xmlns="http://www.w3.org/1999/xhtml"
          className={cn(
            'flex h-full w-full flex-col items-center justify-center rounded-xl border-2 px-3 text-center font-sans shadow-sm',
            tone.bg,
            tone.border,
          )}
        >
          <p className="truncate text-[13px] font-semibold leading-tight text-slate-900 w-full">
            {attrs.full_name}
          </p>
          {dobYear && (
            <p className="mt-0.5 text-[11px] text-slate-500">b. {dobYear}</p>
          )}
          {spouseDisplay && (
            <p className="mt-0.5 truncate text-[11px] text-slate-600 w-full">
              <span className="text-slate-400">+</span>{' '}
              <span className="italic">{spouseDisplay}</span>
            </p>
          )}
        </div>
      </foreignObject>

      {attrs.is_claimed && (
        <g transform={`translate(${NODE_W / 2 - 14}, ${-NODE_H / 2 + 10})`}>
          <circle r={9} fill="#10b981" stroke="white" strokeWidth={2} />
          <text
            x={0}
            y={3}
            textAnchor="middle"
            fontSize={11}
            fontWeight={700}
            fill="#fff"
            fontFamily="system-ui, sans-serif"
          >
            ✓
          </text>
        </g>
      )}
    </g>
  );
}
