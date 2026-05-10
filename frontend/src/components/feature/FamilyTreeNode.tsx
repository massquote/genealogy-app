import type { CustomNodeElementProps } from 'react-d3-tree';
import { useNavigate } from 'react-router-dom';
import type { TreeNodeAttributes } from '@/lib/treeData';

const genderFill: Record<string, string> = {
  male: '#dbe7f7',
  female: '#fbe1ed',
  other: '#e6e1f5',
  unknown: '#e2e8f0',
};

const genderStroke: Record<string, string> = {
  male: '#3b82f6',
  female: '#ec4899',
  other: '#8b5cf6',
  unknown: '#94a3b8',
};

export function FamilyTreeNode({ nodeDatum }: CustomNodeElementProps) {
  const navigate = useNavigate();
  const attrs = nodeDatum.attributes as unknown as TreeNodeAttributes | undefined;
  if (!attrs) return null;

  const fill = genderFill[attrs.gender] ?? genderFill.unknown;
  const stroke = genderStroke[attrs.gender] ?? genderStroke.unknown;
  const dobYear = attrs.dob ? attrs.dob.slice(0, 4) : '';

  return (
    <g
      onClick={() => navigate(`/people/${attrs.id}`)}
      style={{ cursor: 'pointer' }}
    >
      {/* Card background */}
      <rect
        x={-90}
        y={-32}
        width={180}
        height={attrs.spouseNames ? 76 : 64}
        rx={10}
        ry={10}
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
      />
      {/* Name */}
      <text
        x={0}
        y={-10}
        textAnchor="middle"
        fontSize={13}
        fontWeight={600}
        fill="#0f172a"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {attrs.full_name}
      </text>
      {/* Year */}
      {dobYear && (
        <text
          x={0}
          y={8}
          textAnchor="middle"
          fontSize={11}
          fill="#475569"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          b. {dobYear}
        </text>
      )}
      {/* Spouse line */}
      {attrs.spouseNames && (
        <text
          x={0}
          y={26}
          textAnchor="middle"
          fontSize={10}
          fontStyle="italic"
          fill="#475569"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          ⚭ {String(attrs.spouseNames).length > 22
            ? `${String(attrs.spouseNames).slice(0, 22)}…`
            : attrs.spouseNames}
        </text>
      )}
      {/* Claimed badge */}
      {attrs.is_claimed && (
        <g transform="translate(72, -22)">
          <circle r={8} fill="#10b981" />
          <text x={0} y={3} textAnchor="middle" fontSize={10} fill="#fff" fontWeight={700}>
            ✓
          </text>
        </g>
      )}
    </g>
  );
}
