import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ShieldAlert, Sliders, X } from 'lucide-react';
import {
  ComputedEdgeState,
  ForceNode,
  HormonalSystemConfig,
  HormoneNode,
  SimulationSnapshot,
} from '../types/simulator';
import { ArrowFilterMode } from './TopBar';

interface MobileRect {
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
}

interface MobileMindMapViewProps {
  config: HormonalSystemConfig;
  snapshot: SimulationSnapshot;
  arrowFilter: ArrowFilterMode;
  onChangeArrowFilter: (mode: ArrowFilterMode) => void;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onChangeHormone: (hormoneId: string, value: number) => void;
  onChangeForce: (forceId: string, value: number) => void;
  onChangeSpiritual: (value: number) => void;
}

const MOBILE_W = 384;
const LONG_PRESS_MS = 400;

const DEFAULT_FORCE_ORDER = ['sexual', 'emotional', 'spiritual', 'mental', 'vital'];
const DEFAULT_CLUSTER_ORDER = [
  'stress_metabolism',
  'mood_sleep_bonding',
  'anabolism_reproduction',
];
const DEFAULT_HORMONE_ORDER = [
  'cortisol',
  'adrenaline',
  'insulin',
  'thyroid',
  'glucagon',
  'leptin',
  'ghrelin',
  'dopamine',
  'serotonin',
  'melatonin',
  'oxytocin',
  'noradrenaline',
  'gaba',
  'endorphins',
  'testosterone',
  'estrogen',
  'progesterone',
  'growth_hormone',
  'dhea',
  'prolactin',
];

function blendOverSlate(r: number, g: number, b: number, a: number): string {
  const outR = Math.round(15 * (1 - a) + r * a);
  const outG = Math.round(23 * (1 - a) + g * a);
  const outB = Math.round(42 * (1 - a) + b * a);
  return `rgb(${outR}, ${outG}, ${outB})`;
}

function getMobileNodeColors(delta: number, isIndependent: boolean) {
  if (isIndependent) {
    if (delta > 0.4) {
      const t = Math.min(1, delta / 42);
      return {
        backgroundColor: blendOverSlate(245, 158, 11, 0.18 + t * 0.24),
        borderColor: `rgba(251, 191, 36, ${(0.55 + t * 0.42).toFixed(3)})`,
      };
    }
    return {
      backgroundColor: blendOverSlate(69, 26, 3, 0.48),
      borderColor: 'rgba(245, 158, 11, 0.55)',
    };
  }

  if (delta > 0.4) {
    const t = Math.min(1, delta / 42);
    return {
      backgroundColor: blendOverSlate(16, 185, 129, 0.14 + t * 0.26),
      borderColor: `rgba(52, 211, 153, ${(0.44 + t * 0.52).toFixed(3)})`,
    };
  }
  if (delta < -0.4) {
    const t = Math.min(1, Math.abs(delta) / 42);
    return {
      backgroundColor: blendOverSlate(244, 63, 94, 0.14 + t * 0.26),
      borderColor: `rgba(251, 113, 133, ${(0.44 + t * 0.52).toFixed(3)})`,
    };
  }
  return {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
  };
}

function getEdgeColor(type: ComputedEdgeState['edge']['type']) {
  if (type === 'spiritual') return '#fbbf24';
  if (type === 'inhibitory') return '#fb7185';
  return '#34d399';
}

function computeMobileLayout(config: HormonalSystemConfig) {
  const forceRects: Record<string, MobileRect> = {};
  const hormoneRects: Record<string, MobileRect> = {};
  const clusterHeaders: { id: string; nameAr: string; y: number }[] = [];

  const sortedForcesPlaceholder = config.forces;
  void sortedForcesPlaceholder;
  const sortedForces = [...config.forces].sort((a, b) => {
    const ia = DEFAULT_FORCE_ORDER.indexOf(a.id);
    const ib = DEFAULT_FORCE_ORDER.indexOf(b.id);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  // Place all 5 forces side-by-side in a single crisp horizontal row
  const fCols = Math.min(5, Math.max(1, sortedForces.length));
  const fGap = 5;
  const fMargin = 10;
  const fW = Math.floor((MOBILE_W - fMargin * 2 - (fCols - 1) * fGap) / fCols);
  const fH = 44;
  const fStartY = 22;
  const totalForceRowW = fCols * fW + (fCols - 1) * fGap;
  const fStartX = (MOBILE_W - totalForceRowW) / 2;

  sortedForces.forEach((f, idx) => {
    const col = idx % fCols;
    const row = Math.floor(idx / fCols);
    const x = fStartX + col * (fW + fGap);
    const y = fStartY + row * (fH + 6);
    forceRects[f.id] = { x, y, w: fW, h: fH, cx: x + fW / 2, cy: y + fH / 2 };
  });

  const forceBottom =
    fStartY + Math.max(1, Math.ceil(sortedForces.length / fCols)) * fH + Math.max(0, Math.ceil(sortedForces.length / fCols) - 1) * 6;

  const sortedClusters = [...config.clusters].sort((a, b) => {
    const ia = DEFAULT_CLUSTER_ORDER.indexOf(a.id);
    const ib = DEFAULT_CLUSTER_ORDER.indexOf(b.id);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  const groups = sortedClusters
    .map((c) => ({
      cluster: c,
      items: config.hormones
        .filter((h) => h.clusterId === c.id)
        .sort((a, b) => {
          const ia = DEFAULT_HORMONE_ORDER.indexOf(a.id);
          const ib = DEFAULT_HORMONE_ORDER.indexOf(b.id);
          return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        }),
    }))
    .filter((g) => g.items.length > 0);

  const clusterIdSet = new Set(sortedClusters.map((c) => c.id));
  const orphans = config.hormones.filter((h) => !clusterIdSet.has(h.clusterId));
  if (orphans.length > 0) {
    groups.push({
      cluster: { id: '_other', nameAr: 'هرمونات أخرى', nameEn: 'Other', accent: 'slate' },
      items: orphans,
    });
  }

  let cursorY = forceBottom + 14;
  const hGap = 5;
  const hRowGap = 9;
  const hMargin = 10;
  const maxW = MOBILE_W - hMargin * 2;
  const cardW = Math.floor((maxW - 3 * hGap) / 4);
  const cardH = 28;

  for (const group of groups) {
    clusterHeaders.push({ id: group.cluster.id, nameAr: group.cluster.nameAr, y: cursorY });
    cursorY += 21;

    const cols = group.items.length <= 3 ? group.items.length : Math.min(4, Math.ceil(group.items.length / 2));
    const rows = Math.ceil(group.items.length / cols);

    for (let i = 0; i < group.items.length; i++) {
      const h = group.items[i];
      const row = Math.floor(i / cols);
      const col = i % cols;
      const itemsInRow =
        row === rows - 1 ? group.items.length - row * cols : cols;
      const rowW = itemsInRow * cardW + Math.max(0, itemsInRow - 1) * hGap;
      const rowStartX = (MOBILE_W - rowW) / 2;
      const x = rowStartX + col * (cardW + hGap);
      const y = cursorY + row * (cardH + hRowGap);

      hormoneRects[h.id] = {
        x,
        y,
        w: cardW,
        h: cardH,
        cx: x + cardW / 2,
        cy: y + cardH / 2,
      };
    }

    cursorY += rows * cardH + Math.max(0, rows - 1) * hRowGap + 11;
  }

  return {
    forceRects,
    hormoneRects,
    clusterHeaders,
    totalHeight: cursorY + 4,
    sortedForces,
  };
}

function buildMobileEdgePath(
  fromRect: MobileRect,
  toRect: MobileRect,
  idx: number,
  isSelectedContext: boolean
): string {
  const dx = toRect.cx - fromRect.cx;
  const dy = toRect.cy - fromRect.cy;

  // Same-row top force connections arc cleanly overhead above y=22
  if (Math.abs(dy) <= 10 && fromRect.y <= 30 && toRect.y <= 30) {
    const startX = fromRect.cx + (dx > 0 ? 6 : -6);
    const startY = fromRect.y - 1;
    const endX = toRect.cx;
    const endY = toRect.y - 2;
    const ctrlX = (startX + endX) / 2;
    const ctrlY = Math.max(2, Math.min(startY, endY) - 10 - (Math.abs(dx) / MOBILE_W) * 14);
    return `M ${startX.toFixed(1)} ${startY.toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`;
  }

  const dist = Math.hypot(dx, dy) || 1;
  const nx = -dy / dist;
  const ny = dx / dist;
  const curveSign = idx % 2 === 0 ? 1 : -1;
  const bend = isSelectedContext
    ? Math.min(34, 12 + dist * 0.08) * curveSign
    : Math.min(18, 6 + dist * 0.05) * curveSign;

  const startY = dy > 14 ? fromRect.y + fromRect.h : dy < -14 ? fromRect.y : fromRect.cy;
  const endY = dy > 14 ? toRect.y - 2 : dy < -14 ? toRect.y + toRect.h + 2 : toRect.cy;
  const startX =
    Math.abs(dy) <= 14
      ? dx > 0
        ? fromRect.x + fromRect.w
        : fromRect.x
      : fromRect.cx;
  const endX =
    Math.abs(dy) <= 14
      ? dx > 0
        ? toRect.x - 2
        : toRect.x + toRect.w + 2
      : toRect.cx;

  const ctrlX = (startX + endX) / 2 + nx * bend;
  const ctrlY = (startY + endY) / 2 + ny * bend;
  return `M ${startX.toFixed(1)} ${startY.toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`;
}

export const MobileMindMapView: React.FC<MobileMindMapViewProps> = ({
  config,
  snapshot,
  arrowFilter,
  onChangeArrowFilter,
  selectedNodeId,
  onSelectNode,
  onChangeHormone,
  onChangeForce,
  onChangeSpiritual,
}) => {
  const [sliderNodeId, setSliderNodeId] = useState<string | null>(null);
  const [pressingNodeId, setPressingNodeId] = useState<string | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickRef = useRef<string | null>(null);

  const layout = useMemo(() => computeMobileLayout(config), [config]);

  const forceIdSet = useMemo(() => new Set(config.forces.map((f) => f.id)), [config.forces]);
  const independentIdSet = useMemo(
    () => new Set(config.forces.filter((f) => f.isIndependent).map((f) => f.id)),
    [config.forces]
  );
  const hormoneIdSet = useMemo(() => new Set(config.hormones.map((h) => h.id)), [config.hormones]);

  const nodeNameMap = useMemo(() => {
    const map = new Map<string, { nameAr: string; nameEn: string; isIndependent?: boolean }>();
    config.forces.forEach((f) =>
      map.set(f.id, { nameAr: f.nameAr, nameEn: f.nameEn, isIndependent: f.isIndependent })
    );
    config.hormones.forEach((h) => map.set(h.id, { nameAr: h.nameAr, nameEn: h.nameEn }));
    return map;
  }, [config.forces, config.hormones]);

  const filteredEdgeStates = useMemo(() => {
    return snapshot.edgeStates.filter((es) => {
      if (arrowFilter === 'spiritual') {
        return es.edge.type === 'spiritual' || independentIdSet.has(es.edge.from);
      }
      if (arrowFilter === 'forces') {
        return (
          (hormoneIdSet.has(es.edge.from) && forceIdSet.has(es.edge.to)) ||
          (forceIdSet.has(es.edge.from) && hormoneIdSet.has(es.edge.to)) ||
          independentIdSet.has(es.edge.from)
        );
      }
      if (arrowFilter === 'hormones') {
        return hormoneIdSet.has(es.edge.from) && hormoneIdSet.has(es.edge.to);
      }
      return true;
    });
  }, [snapshot.edgeStates, arrowFilter, forceIdSet, hormoneIdSet, independentIdSet]);

  const incomingEdges = useMemo(
    () =>
      selectedNodeId
        ? snapshot.edgeStates.filter((e) => e.edge.to === selectedNodeId)
        : [],
    [snapshot.edgeStates, selectedNodeId]
  );
  const outgoingEdges = useMemo(
    () =>
      selectedNodeId
        ? snapshot.edgeStates.filter((e) => e.edge.from === selectedNodeId)
        : [],
    [snapshot.edgeStates, selectedNodeId]
  );

  const relationByNodeId = useMemo(() => {
    const map = new Map<string, 'source' | 'target' | 'both'>();
    if (!selectedNodeId) return map;
    for (const e of incomingEdges) {
      map.set(e.edge.from, 'source');
    }
    for (const e of outgoingEdges) {
      const prev = map.get(e.edge.to);
      map.set(e.edge.to, prev === 'source' ? 'both' : 'target');
    }
    return map;
  }, [selectedNodeId, incomingEdges, outgoingEdges]);

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressStartRef.current = null;
    setPressingNodeId(null);
  }, []);

  const startLongPress = (nodeId: string, e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    clearLongPress();
    longPressStartRef.current = { x: e.clientX, y: e.clientY };
    setPressingNodeId(nodeId);
    longPressTimerRef.current = setTimeout(() => {
      suppressClickRef.current = nodeId;
      setSliderNodeId(nodeId);
      onSelectNode(nodeId);
      setPressingNodeId(null);
      longPressTimerRef.current = null;
    }, LONG_PRESS_MS);
  };

  const moveLongPress = (e: React.PointerEvent) => {
    if (!longPressStartRef.current) return;
    if (
      Math.hypot(
        e.clientX - longPressStartRef.current.x,
        e.clientY - longPressStartRef.current.y
      ) > 8
    ) {
      clearLongPress();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSliderNodeId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearLongPress();
    };
  }, [clearLongPress]);

  const selectedMeta = selectedNodeId
    ? config.forces.find((f) => f.id === selectedNodeId) ??
      config.hormones.find((h) => h.id === selectedNodeId) ??
      null
    : null;
  const selectedVal = selectedNodeId
    ? snapshot.forces[selectedNodeId] ?? snapshot.hormones[selectedNodeId] ?? null
    : null;
  const isSelectedIndependent = Boolean(
    selectedNodeId && independentIdSet.has(selectedNodeId)
  );

  const sliderTarget = useMemo(() => {
    if (!sliderNodeId) return null;
    const f = config.forces.find((item) => item.id === sliderNodeId);
    if (f && snapshot.forces[f.id]) {
      return {
        kind: 'force' as const,
        node: f,
        res: snapshot.forces[f.id],
        isIndependent: Boolean(f.isIndependent),
      };
    }
    const h = config.hormones.find((item) => item.id === sliderNodeId);
    if (h && snapshot.hormones[h.id]) {
      return {
        kind: 'hormone' as const,
        node: h,
        res: snapshot.hormones[h.id],
        isIndependent: false,
      };
    }
    return null;
  }, [sliderNodeId, config, snapshot]);

  const topMovers = useMemo(() => {
    const allHormones = config.hormones
      .map((h) => ({ node: h, res: snapshot.hormones[h.id] }))
      .filter((x) => Boolean(x.res));
    const risers = [...allHormones]
      .filter((x) => x.res.delta > 0.4)
      .sort((a, b) => b.res.delta - a.res.delta)
      .slice(0, 3);
    const drops = [...allHormones]
      .filter((x) => x.res.delta < -0.4)
      .sort((a, b) => a.res.delta - b.res.delta)
      .slice(0, 3);
    return { risers, drops };
  }, [config.hormones, snapshot.hormones]);

  const FILTER_TABS: { id: ArrowFilterMode; label: string }[] = [
    { id: 'all', label: 'الكل' },
    { id: 'forces', label: 'القوى' },
    { id: 'hormones', label: 'الهرمونات' },
    { id: 'spiritual', label: 'الروحي' },
  ];

  return (
    <div
      data-testid="mobile-mindmap-view"
      data-scenario={snapshot.activeScenario.id}
      className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden bg-slate-950/90 flex justify-center"
    >
      <div className="w-full max-w-[430px] min-h-full flex flex-col bg-[#090d16] bg-lab-grid border-x border-slate-800/70">
        {/* Compact Mobile Arrow Filter Bar */}
        <div
          dir="rtl"
          className="px-2.5 pt-2 pb-1 flex items-center justify-between gap-2 shrink-0"
        >
          <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
            {config.forces.length} قوى · {config.hormones.length} هرموناً
          </span>
          <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {FILTER_TABS.map((tab) => {
              const active = arrowFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onChangeArrowFilter(tab.id)}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-slate-800 text-sky-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Full-Fit Compact Mobile Vertical Mind-Map (5 Forces + 20 Hormones + Directional SVG Arrows) */}
        <div className="w-full px-1 shrink-0">
          <div
            dir="ltr"
            className="relative w-full mx-auto select-none"
            style={{ aspectRatio: `${MOBILE_W} / ${layout.totalHeight}` }}
          >
            {/* SVG Directional Arrows Layer */}
            <svg
              viewBox={`0 0 ${MOBILE_W} ${layout.totalHeight}`}
              className="absolute inset-0 w-full h-full pointer-events-none"
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="mob-arrow-excitatory"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="4.5"
                  markerHeight="4.5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#34d399" />
                </marker>
                <marker
                  id="mob-arrow-inhibitory"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="4.5"
                  markerHeight="4.5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#fb7185" />
                </marker>
                <marker
                  id="mob-arrow-spiritual"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#fbbf24" />
                </marker>
              </defs>

              {filteredEdgeStates.map((es, idx) => {
                const fromRect =
                  layout.forceRects[es.edge.from] ?? layout.hormoneRects[es.edge.from];
                const toRect =
                  layout.forceRects[es.edge.to] ?? layout.hormoneRects[es.edge.to];
                if (!fromRect || !toRect) return null;

                const isConnected =
                  selectedNodeId &&
                  (es.edge.from === selectedNodeId || es.edge.to === selectedNodeId);

                // In uncluttered overview, show spiritual + strong active paths subtly; when a node is selected, spotlight all its incoming/outgoing paths sharply
                if (selectedNodeId && !isConnected) {
                  return null;
                }

                const isSpiritualEdge =
                  es.edge.type === 'spiritual' || independentIdSet.has(es.edge.from);
                const isForceHormone =
                  (forceIdSet.has(es.edge.from) && hormoneIdSet.has(es.edge.to)) ||
                  (hormoneIdSet.has(es.edge.from) && forceIdSet.has(es.edge.to));

                if (!selectedNodeId && !isSpiritualEdge && !isForceHormone && !es.isActive) {
                  return null;
                }

                const d = buildMobileEdgePath(
                  fromRect,
                  toRect,
                  idx,
                  Boolean(isConnected)
                );
                const color = getEdgeColor(es.edge.type);
                const markerId =
                  es.edge.type === 'spiritual'
                    ? 'url(#mob-arrow-spiritual)'
                    : es.edge.type === 'inhibitory'
                    ? 'url(#mob-arrow-inhibitory)'
                    : 'url(#mob-arrow-excitatory)';

                const opacity = isConnected
                  ? 0.92
                  : isSpiritualEdge
                  ? 0.55
                  : isForceHormone
                  ? 0.24
                  : 0.14;

                const strokeWidth = isConnected
                  ? Math.max(1.8, Math.min(3.0, es.strokeWidth * 0.72))
                  : isSpiritualEdge
                  ? 1.5
                  : 1.0;

                return (
                  <path
                    key={es.edge.id}
                    data-edge-id={es.edge.id}
                    d={d}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeOpacity={opacity}
                    markerEnd={isConnected || isSpiritualEdge ? markerId : undefined}
                  />
                );
              })}
            </svg>

            {/* Layer 1: 5 Forces */}
            {layout.sortedForces.map((force: ForceNode) => {
              const rect = layout.forceRects[force.id];
              const res = snapshot.forces[force.id];
              if (!rect || !res) return null;
              const isIndep = Boolean(force.isIndependent);
              const isSelected = selectedNodeId === force.id;
              const relation = relationByNodeId.get(force.id);
              const isDimmed = Boolean(selectedNodeId && !isSelected && !relation);
              const colors = getMobileNodeColors(res.delta, isIndep);
              const deltaStr = res.delta > 0 ? `+${res.delta}` : `${res.delta}`;

              return (
                <button
                  key={force.id}
                  type="button"
                  dir="rtl"
                  data-testid={`mobile-force-node-${force.id}`}
                  style={{
                    left: `${(rect.x / MOBILE_W) * 100}%`,
                    top: `${(rect.y / layout.totalHeight) * 100}%`,
                    width: `${(rect.w / MOBILE_W) * 100}%`,
                    height: `${(rect.h / layout.totalHeight) * 100}%`,
                    backgroundColor: colors.backgroundColor,
                    borderColor: colors.borderColor,
                  }}
                  onPointerDown={(e) => startLongPress(force.id, e)}
                  onPointerMove={moveLongPress}
                  onPointerUp={clearLongPress}
                  onPointerCancel={clearLongPress}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setSliderNodeId(force.id);
                    onSelectNode(force.id);
                  }}
                  onClick={() => {
                    if (suppressClickRef.current === force.id) {
                      suppressClickRef.current = null;
                      return;
                    }
                    onSelectNode(isSelected ? null : force.id);
                  }}
                  className={`absolute rounded-xl border px-1 py-1 flex flex-col justify-between text-right transition-all duration-150 cursor-pointer ${
                    isSelected ? 'ring-2 ring-sky-400 z-20' : relation ? 'z-15' : 'z-10'
                  } ${isDimmed ? 'brightness-50' : ''} ${
                    pressingNodeId === force.id ? 'scale-95' : ''
                  }`}
                >
                  {!isIndep && relation && (
                    <span
                      className={`absolute -top-1.5 left-1 px-1 py-px rounded bg-slate-950 border border-slate-700 text-[7px] font-bold leading-none pointer-events-none ${
                        relation === 'source'
                          ? 'text-emerald-300'
                          : relation === 'target'
                          ? 'text-sky-300'
                          : 'text-amber-300'
                      }`}
                    >
                      {relation === 'source' ? 'يؤثر' : relation === 'target' ? 'يتأثر' : 'متبادل'}
                    </span>
                  )}
                  <div className="w-full">
                    <span
                      className={`block text-[8px] font-bold leading-tight truncate ${
                        isIndep ? 'text-amber-200' : 'text-slate-100'
                      }`}
                    >
                      {force.nameAr}
                    </span>
                    {isIndep && (
                      <span className="block text-[6.5px] font-semibold text-amber-300/90 leading-none mt-0.5 truncate">
                        لا تتأثر
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between gap-0.5 w-full">
                    <span dir="ltr" className="font-mono-num text-[9.5px] font-bold text-slate-50 leading-none">
                      {res.value}%
                    </span>
                    <span
                      dir="ltr"
                      className={`font-mono-num text-[7.5px] font-semibold leading-none ${
                        res.delta > 0.4
                          ? isIndep
                            ? 'text-amber-300'
                            : 'text-emerald-300'
                          : res.delta < -0.4
                          ? 'text-rose-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {deltaStr}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Cluster Headers */}
            {layout.clusterHeaders.map((ch) => (
              <div
                key={ch.id}
                dir="rtl"
                style={{
                  left: '2.8%',
                  width: '94.4%',
                  top: `${(ch.y / layout.totalHeight) * 100}%`,
                }}
                className="absolute z-10 text-[9px] font-bold text-slate-300 bg-slate-900/90 border-b border-slate-800 px-1.5 py-0.5 rounded-t pointer-events-none truncate"
              >
                {ch.nameAr}
              </div>
            ))}

            {/* Layer 2: All 20 Hormones */}
            {config.hormones.map((hormone: HormoneNode) => {
              const rect = layout.hormoneRects[hormone.id];
              const res = snapshot.hormones[hormone.id];
              if (!rect || !res) return null;
              const isSelected = selectedNodeId === hormone.id;
              const relation = relationByNodeId.get(hormone.id);
              const isDimmed = Boolean(selectedNodeId && !isSelected && !relation);
              const colors = getMobileNodeColors(res.delta, false);

              return (
                <button
                  key={hormone.id}
                  type="button"
                  dir="rtl"
                  data-testid={`mobile-hormone-node-${hormone.id}`}
                  title={`${hormone.nameAr} (${hormone.nameEn})`}
                  style={{
                    left: `${(rect.x / MOBILE_W) * 100}%`,
                    top: `${(rect.y / layout.totalHeight) * 100}%`,
                    width: `${(rect.w / MOBILE_W) * 100}%`,
                    height: `${(rect.h / layout.totalHeight) * 100}%`,
                    backgroundColor: colors.backgroundColor,
                    borderColor: colors.borderColor,
                  }}
                  onPointerDown={(e) => startLongPress(hormone.id, e)}
                  onPointerMove={moveLongPress}
                  onPointerUp={clearLongPress}
                  onPointerCancel={clearLongPress}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setSliderNodeId(hormone.id);
                    onSelectNode(hormone.id);
                  }}
                  onClick={() => {
                    if (suppressClickRef.current === hormone.id) {
                      suppressClickRef.current = null;
                      return;
                    }
                    onSelectNode(isSelected ? null : hormone.id);
                  }}
                  className={`absolute rounded-2xl border px-2 flex items-center justify-between gap-1 text-right transition-all duration-150 cursor-pointer ${
                    isSelected ? 'ring-2 ring-sky-400 z-20' : relation ? 'z-15' : 'z-10'
                  } ${isDimmed ? 'brightness-50' : ''} ${
                    pressingNodeId === hormone.id ? 'scale-95' : ''
                  }`}
                >
                  {relation && (
                    <span
                      className={`absolute -top-[5px] left-1.5 px-1 py-[0.5px] rounded bg-slate-950 border border-slate-700 text-[6px] font-bold leading-none pointer-events-none ${
                        relation === 'source'
                          ? 'text-emerald-300'
                          : relation === 'target'
                          ? 'text-sky-300'
                          : 'text-amber-300'
                      }`}
                    >
                      {relation === 'source' ? 'يؤثر' : relation === 'target' ? 'يتأثر' : 'متبادل'}
                    </span>
                  )}
                  <span className="text-[8.5px] font-bold text-slate-100 leading-none truncate min-w-0">
                    {hormone.nameAr}
                  </span>
                  <span
                    dir="ltr"
                    className={`font-mono-num text-[9px] font-bold leading-none shrink-0 ${
                      res.delta > 0.4
                        ? 'text-emerald-300'
                        : res.delta < -0.4
                        ? 'text-rose-300'
                        : 'text-slate-200'
                    }`}
                  >
                    {Math.round(res.value)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Professional Mobile Causal Inspector: Influence & Being Influenced (التأثير والتأثر) */}
        <section
          dir="rtl"
          data-testid="mobile-causal-panel"
          className="mx-2.5 mb-2.5 mt-1 rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 flex-1 flex flex-col gap-2"
        >
          {selectedMeta && selectedVal ? (
            <>
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-100 truncate">
                      {selectedMeta.nameAr}
                    </span>
                    <span className="text-[10px] font-latin text-slate-400 truncate">
                      {selectedMeta.nameEn}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {selectedMeta.description}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span dir="ltr" className="font-mono-num text-xs font-bold text-slate-50">
                    {selectedVal.value}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setSliderNodeId(selectedMeta.id)}
                    aria-label="تعديل المستوى"
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] font-semibold text-sky-300 cursor-pointer"
                  >
                    <Sliders className="w-3 h-3" aria-hidden="true" />
                    تعديل
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectNode(null)}
                    aria-label="إغلاق التفاصيل"
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Incoming: يتأثر بـ */}
                <div className="rounded-lg bg-slate-950/70 border border-slate-800/80 p-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 mb-1.5">
                    <ArrowDownLeft className="w-3 h-3 text-sky-400 shrink-0" aria-hidden="true" />
                    <span>يتأثر بـ ({incomingEdges.length})</span>
                  </div>
                  {isSelectedIndependent ? (
                    <div className="flex items-start gap-1 text-[10px] text-amber-300/90 leading-relaxed">
                      <ShieldAlert className="w-3 h-3 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>قوة مرجعية مستقلة تؤثر في المنظومة ولا تستقبل أي ارتدادات.</span>
                    </div>
                  ) : incomingEdges.length === 0 ? (
                    <div className="text-[10px] text-slate-500">لا توجد روابط واردة.</div>
                  ) : (
                    <div className="flex flex-col gap-1 max-h-28 overflow-y-auto">
                      {incomingEdges.map((es) => {
                        const src = nodeNameMap.get(es.edge.from);
                        const pct = Math.round(es.edge.weight * 100);
                        const isPos = pct >= 0;
                        const isSp = es.edge.type === 'spiritual';
                        const pctStr = `${isPos ? '+' : ''}${pct}%`;
                        return (
                          <button
                            key={es.edge.id}
                            type="button"
                            onClick={() => onSelectNode(es.edge.from)}
                            className="w-full text-right flex items-center justify-between gap-1 px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[10px] cursor-pointer"
                          >
                            <span className="truncate text-slate-200">
                              {src?.nameAr ?? es.edge.from}
                            </span>
                            <span
                              dir="ltr"
                              style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }}
                              className={`font-mono-num text-[9.5px] font-semibold shrink-0 inline-block ${
                                isSp
                                  ? 'text-amber-300'
                                  : isPos
                                  ? 'text-emerald-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {pctStr}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Outgoing: يؤثر في */}
                <div className="rounded-lg bg-slate-950/70 border border-slate-800/80 p-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 mb-1.5">
                    <ArrowUpRight className="w-3 h-3 text-emerald-400 shrink-0" aria-hidden="true" />
                    <span>يؤثر في ({outgoingEdges.length})</span>
                  </div>
                  {outgoingEdges.length === 0 ? (
                    <div className="text-[10px] text-slate-500">لا توجد روابط صادرة.</div>
                  ) : (
                    <div className="flex flex-col gap-1 max-h-28 overflow-y-auto">
                      {outgoingEdges.map((es) => {
                        const tgt = nodeNameMap.get(es.edge.to);
                        const pct = Math.round(es.edge.weight * 100);
                        const isPos = pct >= 0;
                        const isSp = es.edge.type === 'spiritual';
                        const pctStr = `${isPos ? '+' : ''}${pct}%`;
                        return (
                          <button
                            key={es.edge.id}
                            type="button"
                            onClick={() => onSelectNode(es.edge.to)}
                            className="w-full text-right flex items-center justify-between gap-1 px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[10px] cursor-pointer"
                          >
                            <span className="truncate text-slate-200">
                              {tgt?.nameAr ?? es.edge.to}
                            </span>
                            <span
                              dir="ltr"
                              style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }}
                              className={`font-mono-num text-[9.5px] font-semibold shrink-0 inline-block ${
                                isSp
                                  ? 'text-amber-300'
                                  : isPos
                                  ? 'text-emerald-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {pctStr}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-200">
                  تحليل التأثير والتأثر · {snapshot.activeScenario.nameAr}
                </span>
                <span className="text-[9.5px] text-slate-400">
                  اضغط على بطاقة للتفاصيل · مطولاً للتعديل
                </span>
              </div>
              {topMovers.risers.length === 0 && topMovers.drops.length === 0 ? (
                <p className="text-[10.5px] text-slate-400">
                  {snapshot.activeScenario.description}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="rounded-lg bg-slate-950/60 border border-slate-800/80 p-1.5">
                    <div className="text-emerald-300 font-bold mb-1">أبرز الارتفاعات</div>
                    {topMovers.risers.length === 0 ? (
                      <div className="text-slate-500">—</div>
                    ) : (
                      topMovers.risers.map((item) => (
                        <button
                          key={item.node.id}
                          type="button"
                          onClick={() => onSelectNode(item.node.id)}
                          className="w-full flex items-center justify-between py-0.5 text-slate-200 hover:text-white cursor-pointer"
                        >
                          <span className="truncate">{item.node.nameAr}</span>
                          <span
                            dir="ltr"
                            style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }}
                            className="font-mono-num text-emerald-400 font-semibold inline-block"
                          >
                            +{item.res.delta}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="rounded-lg bg-slate-950/60 border border-slate-800/80 p-1.5">
                    <div className="text-rose-300 font-bold mb-1">أبرز الانخفاضات</div>
                    {topMovers.drops.length === 0 ? (
                      <div className="text-slate-500">—</div>
                    ) : (
                      topMovers.drops.map((item) => (
                        <button
                          key={item.node.id}
                          type="button"
                          onClick={() => onSelectNode(item.node.id)}
                          className="w-full flex items-center justify-between py-0.5 text-slate-200 hover:text-white cursor-pointer"
                        >
                          <span className="truncate">{item.node.nameAr}</span>
                          <span
                            dir="ltr"
                            style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }}
                            className="font-mono-num text-rose-400 font-semibold inline-block"
                          >
                            {item.res.delta}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Floating Slider Modal on Long-Press or "تعديل" tap */}
        {sliderTarget && (
          <div
            dir="rtl"
            data-slider-popover="true"
            data-testid="slider-popover"
            role="dialog"
            aria-label={`تعديل ${sliderTarget.node.nameAr}`}
            className="fixed inset-x-0 bottom-14 mx-auto z-50 w-[290px] max-w-[calc(100vw-24px)] rounded-xl bg-slate-900 border border-slate-700 p-3 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-100 truncate">
                  {sliderTarget.node.nameAr}
                </div>
                <div className="text-[10px] font-latin text-slate-400 truncate">
                  {sliderTarget.node.nameEn}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span dir="ltr" className="font-mono-num text-sm font-bold text-slate-50">
                  {sliderTarget.res.value}%
                </span>
                <button
                  type="button"
                  onClick={() => setSliderNodeId(null)}
                  aria-label="إغلاق المؤشر"
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(sliderTarget.res.value)}
              aria-label={`مستوى ${sliderTarget.node.nameAr}`}
              onChange={(e) => {
                const nextVal = Number(e.target.value);
                if (sliderTarget.isIndependent) {
                  onChangeSpiritual(nextVal);
                } else if (sliderTarget.kind === 'force') {
                  onChangeForce(sliderTarget.node.id, nextVal);
                } else {
                  onChangeHormone(sliderTarget.node.id, nextVal);
                }
              }}
              style={{
                background: sliderTarget.isIndependent
                  ? `linear-gradient(to left, #fbbf24 ${sliderTarget.res.value}%, #451a03 ${sliderTarget.res.value}%)`
                  : sliderTarget.res.delta > 0.4
                  ? `linear-gradient(to left, #34d399 ${sliderTarget.res.value}%, #1e293b ${sliderTarget.res.value}%)`
                  : sliderTarget.res.delta < -0.4
                  ? `linear-gradient(to left, #fb7185 ${sliderTarget.res.value}%, #1e293b ${sliderTarget.res.value}%)`
                  : `linear-gradient(to left, #38bdf8 ${sliderTarget.res.value}%, #1e293b ${sliderTarget.res.value}%)`,
              }}
              className="w-full hormone-slider"
            />
          </div>
        )}
      </div>
    </div>
  );
};
