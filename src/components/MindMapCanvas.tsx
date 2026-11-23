import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Crosshair, Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react';
import {
  ComputedEdgeState,
  ForceNode,
  HormonalSystemConfig,
  HormoneNode,
  SimulationSnapshot,
} from '../types/simulator';
import { ArrowFilterMode } from './TopBar';

const WORLD_WIDTH = 1440;
const WORLD_HEIGHT = 490;
const LONG_PRESS_MS = 400;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
}

interface MindMapCanvasProps {
  config: HormonalSystemConfig;
  snapshot: SimulationSnapshot;
  arrowFilter: ArrowFilterMode;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onChangeHormone: (hormoneId: string, value: number) => void;
  onChangeForce: (forceId: string, value: number) => void;
  onChangeSpiritual: (value: number) => void;
}

const DEFAULT_FORCE_ORDER = ['sexual', 'emotional', 'spiritual', 'mental', 'vital'];
const DEFAULT_CLUSTER_ORDER = [
  'anabolism_reproduction',
  'mood_sleep_bonding',
  'stress_metabolism',
];
const DEFAULT_HORMONE_ORDER = [
  'estrogen',
  'testosterone',
  'progesterone',
  'growth_hormone',
  'dhea',
  'prolactin',
  'oxytocin',
  'melatonin',
  'serotonin',
  'dopamine',
  'noradrenaline',
  'gaba',
  'endorphins',
  'thyroid',
  'insulin',
  'glucagon',
  'leptin',
  'ghrelin',
  'adrenaline',
  'cortisol',
];

function blendOverSlate(r: number, g: number, b: number, a: number): string {
  const outR = Math.round(15 * (1 - a) + r * a);
  const outG = Math.round(23 * (1 - a) + g * a);
  const outB = Math.round(42 * (1 - a) + b * a);
  return `rgb(${outR}, ${outG}, ${outB})`;
}

function getNodeDeltaColors(delta: number, isIndependent: boolean): {
  backgroundColor: string;
  borderColor: string;
} {
  if (isIndependent) {
    if (delta > 0.4) {
      const t = Math.min(1, delta / 42);
      return {
        backgroundColor: blendOverSlate(245, 158, 11, 0.16 + t * 0.24),
        borderColor: `rgba(251, 191, 36, ${(0.55 + t * 0.42).toFixed(3)})`,
      };
    }
    if (delta < -0.4) {
      const t = Math.min(1, Math.abs(delta) / 42);
      return {
        backgroundColor: blendOverSlate(120, 53, 15, 0.28 - t * 0.14),
        borderColor: `rgba(217, 119, 6, ${(0.45 - t * 0.2).toFixed(3)})`,
      };
    }
    return {
      backgroundColor: blendOverSlate(69, 26, 3, 0.48),
      borderColor: 'rgba(245, 158, 11, 0.5)',
    };
  }

  if (delta > 0.4) {
    const t = Math.min(1, delta / 42);
    return {
      backgroundColor: blendOverSlate(16, 185, 129, 0.12 + t * 0.26),
      borderColor: `rgba(52, 211, 153, ${(0.42 + t * 0.53).toFixed(3)})`,
    };
  }
  if (delta < -0.4) {
    const t = Math.min(1, Math.abs(delta) / 42);
    return {
      backgroundColor: blendOverSlate(244, 63, 94, 0.12 + t * 0.26),
      borderColor: `rgba(251, 113, 133, ${(0.42 + t * 0.53).toFixed(3)})`,
    };
  }
  return {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
  };
}

function computeLayout(config: HormonalSystemConfig) {
  const forceRects: Record<string, Rect> = {};
  const hormoneRects: Record<string, Rect> = {};
  const clusterRects: Record<string, Rect> = {};

  const sortedForces = [...config.forces].sort((a, b) => {
    const ia = DEFAULT_FORCE_ORDER.indexOf(a.id);
    const ib = DEFAULT_FORCE_ORDER.indexOf(b.id);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return 0;
  });

  const interactiveForces = sortedForces.filter((f) => !f.isIndependent);
  const independentForces = sortedForces.filter((f) => f.isIndependent);

  // Ultra-compact Force cards
  const forceW = 156;
  const forceH = 56;
  const slotXs = [84, 324, 960, 1200];
  interactiveForces.forEach((f, idx) => {
    const x =
      idx < slotXs.length
        ? slotXs[idx]
        : 84 + (idx * (WORLD_WIDTH - 168 - forceW)) / Math.max(1, interactiveForces.length - 1);
    const y = 38;
    forceRects[f.id] = { x, y, w: forceW, h: forceH, cx: x + forceW / 2, cy: y + forceH / 2 };
  });

  independentForces.forEach((f, idx) => {
    const w = 196;
    const h = 68;
    const x = (WORLD_WIDTH - w) / 2 + idx * 214;
    const y = 28;
    forceRects[f.id] = { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
  });

  // Order clusters & ultra-compact 2-row hormone grids per cluster
  const sortedClusters = [...config.clusters].sort((a, b) => {
    const ia = DEFAULT_CLUSTER_ORDER.indexOf(a.id);
    const ib = DEFAULT_CLUSTER_ORDER.indexOf(b.id);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return 0;
  });

  const orderedHormonesByCluster = sortedClusters.map((c) => {
    const items = config.hormones
      .filter((h) => h.clusterId === c.id)
      .sort((a, b) => {
        const ia = DEFAULT_HORMONE_ORDER.indexOf(a.id);
        const ib = DEFAULT_HORMONE_ORDER.indexOf(b.id);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return 0;
      });
    return { cluster: c, items };
  });

  const clusterIds = new Set(sortedClusters.map((c) => c.id));
  const orphans = config.hormones.filter((h) => !clusterIds.has(h.clusterId));
  if (orphans.length > 0) {
    orderedHormonesByCluster.push({
      cluster: { id: '_other', nameAr: 'هرمونات إضافية', nameEn: 'Additional', accent: 'slate' },
      items: orphans,
    });
  }

  const nonEmptyGroups = orderedHormonesByCluster.filter((g) => g.items.length > 0);
  const clusterCols = nonEmptyGroups.map((g) =>
    g.items.length <= 3 ? g.items.length : Math.ceil(g.items.length / 2)
  );
  const totalCols = clusterCols.reduce((sum, cols) => sum + cols, 0);

  const clusterGap = 28;
  const cardGap = 10;
  const rowGap = 14;
  const sideMargin = 44;
  const totalCardGaps = clusterCols.reduce((sum, cols) => sum + Math.max(0, cols - 1), 0);
  const availableW =
    WORLD_WIDTH -
    sideMargin * 2 -
    Math.max(0, nonEmptyGroups.length - 1) * clusterGap -
    totalCardGaps * cardGap;

  const hCardW = Math.min(114, Math.max(88, Math.floor(availableW / Math.max(1, totalCols))));
  const hCardH = 62;
  const hBaseY = 222;

  const totalUsedW =
    totalCols * hCardW +
    totalCardGaps * cardGap +
    Math.max(0, nonEmptyGroups.length - 1) * clusterGap;
  let cursorX = (WORLD_WIDTH - totalUsedW) / 2;

  nonEmptyGroups.forEach((group, groupIdx) => {
    const cols = clusterCols[groupIdx];
    const startX = cursorX;
    const groupW = cols * hCardW + Math.max(0, cols - 1) * cardGap;

    for (let i = 0; i < group.items.length; i++) {
      const h = group.items[i];
      const row = Math.floor(i / cols);
      const col = i % cols;
      const itemsInThisRow =
        row === Math.floor((group.items.length - 1) / cols)
          ? group.items.length - row * cols
          : cols;
      const rowWidth = itemsInThisRow * hCardW + Math.max(0, itemsInThisRow - 1) * cardGap;
      const rowOffsetX = (groupW - rowWidth) / 2;

      const x = startX + rowOffsetX + col * (hCardW + cardGap);
      const y = hBaseY + row * (hCardH + rowGap);

      hormoneRects[h.id] = {
        x,
        y,
        w: hCardW,
        h: hCardH,
        cx: x + hCardW / 2,
        cy: y + hCardH / 2,
      };
    }

    clusterRects[group.cluster.id] = {
      x: startX,
      y: hBaseY - 26,
      w: Math.max(110, groupW),
      h: 20,
      cx: startX + groupW / 2,
      cy: hBaseY - 16,
    };
    cursorX += groupW + clusterGap;
  });

  return {
    forceRects,
    hormoneRects,
    clusterRects,
    orderedHormonesByCluster,
    sortedForces,
  };
}

function getEdgeColor(type: ComputedEdgeState['edge']['type']) {
  if (type === 'spiritual') return '#fbbf24';
  if (type === 'inhibitory') return '#fb7185';
  return '#34d399';
}

function buildEdgePath(
  edgeState: ComputedEdgeState,
  forceRects: Record<string, Rect>,
  hormoneRects: Record<string, Rect>,
  edgeIndex: number,
  isIndependentSource: boolean
): string | null {
  const { from, to } = edgeState.edge;
  const fromForce = forceRects[from];
  const toForce = forceRects[to];
  const fromHormone = hormoneRects[from];
  const toHormone = hormoneRects[to];

  // Case 1: Spiritual Force -> Interactive Force
  if (fromForce && toForce) {
    const startX = toForce.cx < fromForce.cx ? fromForce.x + 10 : fromForce.x + fromForce.w - 10;
    const startY = fromForce.cy + 4;
    const endX = toForce.cx < fromForce.cx ? toForce.x + toForce.w - 5 : toForce.x + 5;
    const endY = toForce.cy - 4;
    const ctrlX = (startX + endX) / 2;
    const ctrlY = Math.min(startY, endY) - 18;
    return `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
  }

  // Case 2: Force -> Hormone (Downward)
  if (fromForce && toHormone) {
    const portOffset = isIndependentSource ? 0 : 14;
    const startX = fromForce.cx + (toHormone.cx - fromForce.cx) * 0.14 + portOffset;
    const startY = fromForce.y + fromForce.h + 2;
    const endX = toHormone.cx + portOffset * 0.7;
    const endY = toHormone.y - 4;
    const midY = (startY + endY) / 2 + (isIndependentSource ? 0 : 12);
    return `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
  }

  // Case 3: Hormone -> Interactive Force (Upward)
  if (fromHormone && toForce) {
    const portOffset = -12;
    const startX = fromHormone.cx + portOffset;
    const startY = fromHormone.y - 2;
    const endX = toForce.cx + (fromHormone.cx - toForce.cx) * 0.18 + portOffset;
    const endY = toForce.y + toForce.h + 4;
    const midY = (startY + endY) / 2 - 10;
    return `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
  }

  // Case 4: Intra-Hormone (arcs cleanly through the corridor beneath Layer 2)
  if (fromHormone && toHormone) {
    const startX = fromHormone.cx - 8;
    const startY = fromHormone.y + fromHormone.h + 2;
    const endX = toHormone.cx + 8;
    const endY = toHormone.y + toHormone.h + 4;
    const dist = Math.abs(endX - startX);
    const corridorFloor = 382 + Math.min(82, dist * 0.08 + (edgeIndex % 4) * 14);
    const ctrlY = Math.max(corridorFloor, Math.max(startY, endY) + 34);
    return `M ${startX} ${startY} C ${startX} ${ctrlY}, ${endX} ${ctrlY}, ${endX} ${endY}`;
  }

  return null;
}

export const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  config,
  snapshot,
  arrowFilter,
  selectedNodeId,
  onSelectNode,
  onChangeHormone,
  onChangeForce,
  onChangeSpiritual,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [sliderNodeId, setSliderNodeId] = useState<string | null>(null);
  const [pressingNodeId, setPressingNodeId] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.96 });
  const hasUserInteractedRef = useRef(false);

  const draggingRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  }>({ active: false, startX: 0, startY: 0, origX: 0, origY: 0 });
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartRef = useRef<{
    dist: number;
    scale: number;
    midX: number;
    midY: number;
    origX: number;
    origY: number;
  } | null>(null);

  // Long-press state tracking for cards
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const suppressNextClickRef = useRef<string | null>(null);

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressStartPosRef.current = null;
    setPressingNodeId(null);
  }, []);

  const startCardLongPress = (nodeId: string, e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    clearLongPress();
    longPressStartPosRef.current = { x: e.clientX, y: e.clientY };
    setPressingNodeId(nodeId);
    longPressTimerRef.current = setTimeout(() => {
      suppressNextClickRef.current = nodeId;
      setSliderNodeId(nodeId);
      onSelectNode(nodeId);
      setPressingNodeId(null);
      longPressTimerRef.current = null;
    }, LONG_PRESS_MS);
  };

  const moveCardLongPress = (e: React.PointerEvent) => {
    if (!longPressStartPosRef.current) return;
    const dist = Math.hypot(
      e.clientX - longPressStartPosRef.current.x,
      e.clientY - longPressStartPosRef.current.y
    );
    if (dist > 8) {
      clearLongPress();
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSliderNodeId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      clearLongPress();
    };
  }, [clearLongPress]);

  const layout = useMemo(() => computeLayout(config), [config]);

  const computeDefaultTransform = useCallback(
    (width: number, height: number, forceMode?: 'fit' | 'mobile-core') => {
      if (width <= 0 || height <= 0) return { x: 0, y: 0, scale: 0.96 };
      const isMobile = forceMode ? forceMode === 'mobile-core' : width < 1024;

      if (!isMobile) {
        const pad = 20;
        const scale = Math.min((width - pad) / WORLD_WIDTH, (height - pad) / WORLD_HEIGHT);
        const clampedScale = Math.max(0.4, Math.min(1.22, scale));
        const x = (width - WORLD_WIDTH * clampedScale) / 2;
        const y = (height - WORLD_HEIGHT * clampedScale) / 2;
        return { x, y, scale: clampedScale };
      }

      const mobileScale = Math.max(0.56, Math.min(0.85, width / 560));
      const focusWorldX = WORLD_WIDTH * 0.5;
      const focusWorldY = 240;
      const x = width / 2 - focusWorldX * mobileScale;
      const y = height / 2 - focusWorldY * mobileScale;
      return { x, y, scale: mobileScale };
    },
    []
  );

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const applyInitial = () => {
      if (hasUserInteractedRef.current) return;
      const rect = el.getBoundingClientRect();
      setTransform(computeDefaultTransform(rect.width, rect.height));
    };

    applyInitial();
    const ro = new ResizeObserver(() => {
      if (!hasUserInteractedRef.current) {
        const rect = el.getBoundingClientRect();
        setTransform(computeDefaultTransform(rect.width, rect.height));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [computeDefaultTransform]);

  const handleFitAll = () => {
    const el = viewportRef.current;
    if (!el) return;
    hasUserInteractedRef.current = true;
    const rect = el.getBoundingClientRect();
    setTransform(computeDefaultTransform(rect.width, rect.height, 'fit'));
  };

  const handleRecenter = () => {
    const el = viewportRef.current;
    if (!el) return;
    hasUserInteractedRef.current = false;
    const rect = el.getBoundingClientRect();
    setTransform(computeDefaultTransform(rect.width, rect.height));
  };

  const zoomBy = (factor: number) => {
    const el = viewportRef.current;
    if (!el) return;
    hasUserInteractedRef.current = true;
    const rect = el.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setTransform((prev) => {
      const nextScale = Math.max(0.32, Math.min(2.4, prev.scale * factor));
      const ratio = nextScale / prev.scale;
      return {
        scale: nextScale,
        x: cx - (cx - prev.x) * ratio,
        y: cy - (cy - prev.y) * ratio,
      };
    });
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = viewportRef.current;
    if (!el) return;
    hasUserInteractedRef.current = true;
    const rect = el.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.09 : 0.91;
    setTransform((prev) => {
      const nextScale = Math.max(0.32, Math.min(2.4, prev.scale * factor));
      const ratio = nextScale / prev.scale;
      return {
        scale: nextScale,
        x: mx - (mx - prev.x) * ratio,
        y: my - (my - prev.y) * ratio,
      };
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-slider-popover]')) {
      setSliderNodeId(null);
    }
    if (target.closest('input, button, select, textarea, a, [data-slider-popover]')) {
      return;
    }

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);

    if (pointersRef.current.size === 1) {
      draggingRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        origX: transform.x,
        origY: transform.y,
      };
    } else if (pointersRef.current.size === 2) {
      draggingRef.current.active = false;
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const el = viewportRef.current?.getBoundingClientRect();
      const midX = (pts[0].x + pts[1].x) / 2 - (el?.left ?? 0);
      const midY = (pts[0].y + pts[1].y) / 2 - (el?.top ?? 0);
      pinchStartRef.current = {
        dist,
        scale: transform.scale,
        midX,
        midY,
        origX: transform.x,
        origY: transform.y,
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2 && pinchStartRef.current) {
      hasUserInteractedRef.current = true;
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const el = viewportRef.current?.getBoundingClientRect();
      const curMidX = (pts[0].x + pts[1].x) / 2 - (el?.left ?? 0);
      const curMidY = (pts[0].y + pts[1].y) / 2 - (el?.top ?? 0);
      const p = pinchStartRef.current;
      const nextScale = Math.max(0.32, Math.min(2.4, p.scale * (dist / Math.max(10, p.dist))));
      const ratio = nextScale / p.scale;
      setTransform({
        scale: nextScale,
        x: curMidX - (p.midX - p.origX) * ratio,
        y: curMidY - (p.midY - p.origY) * ratio,
      });
      return;
    }

    if (draggingRef.current.active && pointersRef.current.size === 1) {
      const dx = e.clientX - draggingRef.current.startX;
      const dy = e.clientY - draggingRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasUserInteractedRef.current = true;
      }
      setTransform((prev) => ({
        ...prev,
        x: draggingRef.current.origX + dx,
        y: draggingRef.current.origY + dy,
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) {
      pinchStartRef.current = null;
    }
    if (pointersRef.current.size === 0) {
      draggingRef.current.active = false;
    }
  };

  const activeFocusId = hoveredNodeId ?? selectedNodeId;
  const forceIdSet = useMemo(() => new Set(config.forces.map((f) => f.id)), [config.forces]);
  const independentIdSet = useMemo(
    () => new Set(config.forces.filter((f) => f.isIndependent).map((f) => f.id)),
    [config.forces]
  );
  const hormoneIdSet = useMemo(() => new Set(config.hormones.map((h) => h.id)), [config.hormones]);

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

  // Active long-pressed node metadata for floating slider popover
  const sliderTarget = useMemo(() => {
    if (!sliderNodeId) return null;
    const f = config.forces.find((item) => item.id === sliderNodeId);
    if (f && layout.forceRects[f.id] && snapshot.forces[f.id]) {
      return {
        kind: 'force' as const,
        node: f,
        rect: layout.forceRects[f.id],
        res: snapshot.forces[f.id],
        isIndependent: Boolean(f.isIndependent),
      };
    }
    const h = config.hormones.find((item) => item.id === sliderNodeId);
    if (h && layout.hormoneRects[h.id] && snapshot.hormones[h.id]) {
      return {
        kind: 'hormone' as const,
        node: h,
        rect: layout.hormoneRects[h.id],
        res: snapshot.hormones[h.id],
        isIndependent: false,
      };
    }
    return null;
  }, [sliderNodeId, config, layout, snapshot]);

  return (
    <div
      ref={viewportRef}
      data-testid="mindmap-viewport"
      data-scenario={snapshot.activeScenario.id}
      data-scale={transform.scale.toFixed(2)}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative flex-1 w-full h-full overflow-hidden bg-lab-grid touch-none select-none cursor-grab active:cursor-grabbing"
    >
      <div
        dir="ltr"
        style={{
          width: WORLD_WIDTH,
          height: WORLD_HEIGHT,
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
          transformOrigin: '0 0',
        }}
        className="absolute top-0 left-0 will-change-transform"
      >
        {/* Subtle Architectural Layer Zone Bands */}
        <div
          className="absolute inset-x-6 top-2 h-[98px] rounded-2xl border border-slate-800/80 bg-slate-900/35 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-6 top-[166px] h-[208px] rounded-2xl border border-slate-800/80 bg-slate-900/35 pointer-events-none"
          aria-hidden="true"
        />

        {/* Layer Titles */}
        <div
          dir="rtl"
          className="absolute right-10 top-3 text-[11px] font-bold text-slate-400 pointer-events-none"
        >
          الطبقة العليا · القوى الخمس
        </div>
        <div
          dir="rtl"
          className="absolute right-10 top-[172px] text-[11px] font-bold text-slate-400 pointer-events-none"
        >
          الطبقة الوسطى · منظومة الهرمونات ({config.hormones.length} هرموناً)
        </div>

        {/* SVG Static Dynamic-Weight Arrows Layer */}
        <svg
          width={WORLD_WIDTH}
          height={WORLD_HEIGHT}
          viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}
          className="absolute inset-0 pointer-events-none overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <marker
              id="arrow-excitatory"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#34d399" />
            </marker>
            <marker
              id="arrow-inhibitory"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#fb7185" />
            </marker>
            <marker
              id="arrow-spiritual"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5.5"
              markerHeight="5.5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#fbbf24" />
            </marker>
          </defs>

          {filteredEdgeStates.map((edgeState, idx) => {
            const isIndepSrc = independentIdSet.has(edgeState.edge.from);
            const path = buildEdgePath(
              edgeState,
              layout.forceRects,
              layout.hormoneRects,
              idx,
              isIndepSrc
            );
            if (!path) return null;

            const color = getEdgeColor(edgeState.edge.type);
            const markerId =
              edgeState.edge.type === 'spiritual'
                ? 'url(#arrow-spiritual)'
                : edgeState.edge.type === 'inhibitory'
                ? 'url(#arrow-inhibitory)'
                : 'url(#arrow-excitatory)';

            const isConnectedToFocus =
              !activeFocusId ||
              edgeState.edge.from === activeFocusId ||
              edgeState.edge.to === activeFocusId;

            const opacity = isConnectedToFocus
              ? 0.35 + edgeState.intensity * 0.58
              : 0.08;

            return (
              <path
                key={edgeState.edge.id}
                data-edge-id={edgeState.edge.id}
                data-intensity={edgeState.intensity}
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={edgeState.strokeWidth}
                strokeLinecap="round"
                strokeOpacity={opacity}
                markerEnd={markerId}
              />
            );
          })}
        </svg>

        {/* LAYER 1: THE FIVE FORCES (Ultra-Compact Cards with Dynamic Color Shift) */}
        {layout.sortedForces.map((force: ForceNode) => {
          const rect = layout.forceRects[force.id];
          const res = snapshot.forces[force.id];
          if (!rect || !res) return null;

          const isIndependent = Boolean(force.isIndependent);
          const isSelected = selectedNodeId === force.id;
          const isPressing = pressingNodeId === force.id;
          const colors = getNodeDeltaColors(res.delta, isIndependent);
          const deltaStr = res.delta > 0 ? `+${res.delta}` : `${res.delta}`;
          const deltaColor =
            res.delta > 0.4
              ? isIndependent
                ? 'text-amber-300'
                : 'text-emerald-300'
              : res.delta < -0.4
              ? 'text-rose-300'
              : 'text-slate-400';

          return (
            <button
              key={force.id}
              type="button"
              dir="rtl"
              data-testid={`force-node-${force.id}`}
              aria-label={`${force.nameAr} ${res.value}% — اضغط مطولاً للتعديل`}
              style={{
                left: rect.x,
                top: rect.y,
                width: rect.w,
                height: rect.h,
                backgroundColor: colors.backgroundColor,
                borderColor: colors.borderColor,
              }}
              onPointerDown={(e) => startCardLongPress(force.id, e)}
              onPointerMove={moveCardLongPress}
              onPointerUp={clearLongPress}
              onPointerCancel={clearLongPress}
              onPointerLeave={() => {
                clearLongPress();
                setHoveredNodeId(null);
              }}
              onMouseEnter={() => setHoveredNodeId(force.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setSliderNodeId(force.id);
                onSelectNode(force.id);
              }}
              onClick={() => {
                if (suppressNextClickRef.current === force.id) {
                  suppressNextClickRef.current = null;
                  return;
                }
                onSelectNode(isSelected ? null : force.id);
              }}
              className={`absolute rounded-xl border px-2.5 py-1.5 flex items-center justify-between gap-2 text-right transition-[background-color,border-color,transform] duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-400 ${
                isSelected ? 'ring-2 ring-sky-400' : ''
              } ${isPressing ? 'scale-[0.96]' : ''}`}
            >
              <div className="min-w-0">
                <div
                  className={`text-[11px] font-bold leading-tight truncate ${
                    isIndependent ? 'text-amber-200' : 'text-slate-100'
                  }`}
                >
                  {force.nameAr}
                </div>
                <div className="text-[9px] font-latin text-slate-400 leading-tight mt-0.5 truncate">
                  {force.nameEn}
                </div>
                {isIndependent && (
                  <div className="text-[9px] font-medium text-amber-300/90 leading-tight mt-0.5">
                    تؤثر ولا تتأثر
                  </div>
                )}
              </div>

              <div className="text-left shrink-0">
                <div dir="ltr" className="font-mono-num text-[13px] font-bold text-slate-50 leading-none">
                  {res.value}%
                </div>
                <div dir="ltr" className={`font-mono-num text-[10px] font-semibold mt-0.5 ${deltaColor}`}>
                  {deltaStr}
                </div>
              </div>
            </button>
          );
        })}

        {/* LAYER 2 CLUSTER LABELS */}
        {layout.orderedHormonesByCluster.map(({ cluster }) => {
          const cRect = layout.clusterRects[cluster.id];
          if (!cRect) return null;
          return (
            <div
              key={cluster.id}
              dir="rtl"
              style={{ left: cRect.x, top: cRect.y, width: cRect.w, height: cRect.h }}
              className="absolute z-10 flex items-center justify-between bg-slate-900/95 border-b border-slate-800 px-2 rounded-t-md pointer-events-none"
            >
              <span className="text-[10.5px] font-bold text-slate-200 truncate">{cluster.nameAr}</span>
              <span className="text-[9px] font-latin text-slate-400 truncate hidden sm:inline">
                {cluster.nameEn}
              </span>
            </div>
          );
        })}

        {/* LAYER 2: THE 20 HORMONES (Ultra-Compact Cards with Dynamic Color Shift) */}
        {config.hormones.map((hormone: HormoneNode) => {
          const rect = layout.hormoneRects[hormone.id];
          const res = snapshot.hormones[hormone.id];
          if (!rect || !res) return null;

          const isSelected = selectedNodeId === hormone.id;
          const isPressing = pressingNodeId === hormone.id;
          const colors = getNodeDeltaColors(res.delta, false);
          const deltaStr = res.delta > 0 ? `+${res.delta}` : `${res.delta}`;
          const deltaColor =
            res.delta > 0.4
              ? 'text-emerald-300'
              : res.delta < -0.4
              ? 'text-rose-300'
              : 'text-slate-400';

          return (
            <button
              key={hormone.id}
              type="button"
              dir="rtl"
              data-testid={`hormone-node-${hormone.id}`}
              title={`${hormone.nameAr} (${hormone.nameEn})`}
              aria-label={`${hormone.nameAr} ${res.value}% — اضغط مطولاً للتعديل`}
              style={{
                left: rect.x,
                top: rect.y,
                width: rect.w,
                height: rect.h,
                backgroundColor: colors.backgroundColor,
                borderColor: colors.borderColor,
              }}
              onPointerDown={(e) => startCardLongPress(hormone.id, e)}
              onPointerMove={moveCardLongPress}
              onPointerUp={clearLongPress}
              onPointerCancel={clearLongPress}
              onPointerLeave={() => {
                clearLongPress();
                setHoveredNodeId(null);
              }}
              onMouseEnter={() => setHoveredNodeId(hormone.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setSliderNodeId(hormone.id);
                onSelectNode(hormone.id);
              }}
              onClick={() => {
                if (suppressNextClickRef.current === hormone.id) {
                  suppressNextClickRef.current = null;
                  return;
                }
                onSelectNode(isSelected ? null : hormone.id);
              }}
              className={`absolute rounded-xl border px-2 py-1.5 flex flex-col justify-between text-right transition-[background-color,border-color,transform] duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-400 ${
                isSelected ? 'ring-2 ring-sky-400' : ''
              } ${isPressing ? 'scale-[0.95]' : ''}`}
            >
              <div className="w-full">
                <div className="text-[11px] font-bold text-slate-100 leading-tight truncate">
                  {hormone.nameAr}
                </div>
                <div className="text-[9px] font-latin text-slate-400 leading-tight mt-0.5 truncate">
                  {hormone.nameEn}
                </div>
              </div>

              <div className="w-full flex items-baseline justify-between gap-1">
                <span dir="ltr" className="font-mono-num text-[13px] font-bold text-slate-50 leading-none">
                  {res.value}%
                </span>
                <span dir="ltr" className={`font-mono-num text-[10px] font-semibold ${deltaColor}`}>
                  {deltaStr}
                </span>
              </div>
            </button>
          );
        })}

        {/* FLOATING LONG-PRESS SLIDER POPOVER (Hidden until Long-Press) */}
        {sliderTarget && (
          <div
            dir="rtl"
            data-slider-popover="true"
            data-testid="slider-popover"
            role="dialog"
            aria-label={`تعديل ${sliderTarget.node.nameAr}`}
            style={{
              left: Math.max(16, Math.min(WORLD_WIDTH - 246, sliderTarget.rect.cx - 115)),
              top:
                sliderTarget.kind === 'force'
                  ? sliderTarget.rect.y + sliderTarget.rect.h + 10
                  : sliderTarget.rect.y + sliderTarget.rect.h + 10,
              width: 230,
            }}
            className="absolute z-40 rounded-xl bg-slate-900 border border-slate-700 p-3 shadow-2xl"
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

      {/* Floating Compact Navigation Controls */}
      <div
        role="toolbar"
        aria-label="أدوات التحكم في عرض الخريطة"
        className="absolute bottom-3 left-3 z-20 flex items-center gap-1 bg-slate-900/95 backdrop-blur-xs border border-slate-800 rounded-xl p-1 shadow-lg"
      >
        <button
          type="button"
          onClick={() => zoomBy(1.18)}
          aria-label="تكبير"
          title="تكبير"
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => zoomBy(0.84)}
          aria-label="تصغير"
          title="تصغير"
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" aria-hidden="true" />
        </button>
        <span className="font-mono-num text-[11px] font-medium text-slate-400 px-1.5 min-w-[44px] text-center">
          {Math.round(transform.scale * 100)}%
        </span>
        <button
          type="button"
          onClick={handleFitAll}
          aria-label="عرض الكل"
          title="عرض الكل"
          className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="sm:hidden">الكل</span>
          <span className="hidden sm:inline">عرض الكل</span>
        </button>
        <button
          type="button"
          onClick={handleRecenter}
          aria-label="إعادة التمركز"
          title="إعادة التمركز"
          className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <Crosshair className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="sm:hidden">توسيط</span>
          <span className="hidden sm:inline">إعادة التمركز</span>
        </button>
      </div>
    </div>
  );
};
