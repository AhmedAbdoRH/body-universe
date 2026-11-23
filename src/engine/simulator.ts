import {
  ComputedEdgeState,
  HormonalSystemConfig,
  NodeComputationResult,
  ScenarioDef,
  SimulationInputState,
  SimulationSnapshot,
} from '../types/simulator';

export function clamp(val: number, min: number, max: number): number {
  if (Number.isNaN(val)) return min;
  return Math.max(min, Math.min(max, val));
}

export function round1(val: number): number {
  return Math.round(val * 10) / 10;
}

export function evaluateSimulation(
  config: HormonalSystemConfig,
  input: SimulationInputState
): SimulationSnapshot {
  const activeScenario: ScenarioDef =
    config.scenarios.find((s) => s.id === input.activeScenarioId) ??
    config.scenarios.find((s) => s.isBaseline) ??
    config.scenarios[0];

  const isFreeMode = Boolean(activeScenario?.isFreeMode);

  // 1. Evaluate independent force(s) first (Spiritual Force: influences without being influenced)
  const forces: Record<string, NodeComputationResult> = {};
  const interactiveForces = config.forces.filter((f) => !f.isIndependent);
  const independentForces = config.forces.filter((f) => f.isIndependent);

  for (const force of independentForces) {
    const bonus = !isFreeMode ? activeScenario?.spiritualImpact ?? 0 : 0;
    const val = clamp(input.spiritualLevel + bonus, 0, 100);
    forces[force.id] = {
      id: force.id,
      value: round1(val),
      baseline: force.baseline,
      delta: round1(val - force.baseline),
    };
  }

  // Initialize interactive force values (pinned if overridden in Free Mode)
  const interactiveForceValues: Record<string, number> = {};
  for (const f of interactiveForces) {
    if (isFreeMode && input.forceOverrides[f.id] !== undefined) {
      interactiveForceValues[f.id] = clamp(input.forceOverrides[f.id], 0, 100);
    } else {
      interactiveForceValues[f.id] = f.baseline;
    }
  }

  // 2. Initialize Hormones (Pass 0: Baseline + Scenario direct impacts + Spiritual Force + pinned Force overrides)
  const hormoneValues: Record<string, number> = {};
  const hormoneMap = new Map(config.hormones.map((h) => [h.id, h]));
  const interactiveForceMap = new Map(interactiveForces.map((f) => [f.id, f]));

  for (const h of config.hormones) {
    if (isFreeMode && input.hormoneOverrides[h.id] !== undefined) {
      hormoneValues[h.id] = clamp(input.hormoneOverrides[h.id], 0, 100);
      continue;
    }

    const scenarioImpact = !isFreeMode ? activeScenario?.hormoneImpacts?.[h.id] ?? 0 : 0;

    let spiritualDelta = 0;
    let initialForceFeedback = 0;
    for (const edge of config.edges) {
      if (edge.to === h.id) {
        if (forces[edge.from]) {
          spiritualDelta += forces[edge.from].delta * edge.weight;
        } else if (interactiveForceMap.has(edge.from)) {
          const srcForce = interactiveForceMap.get(edge.from)!;
          initialForceFeedback += (interactiveForceValues[edge.from] - srcForce.baseline) * edge.weight * 0.45;
        }
      }
    }

    hormoneValues[h.id] = clamp(
      h.baseline + scenarioImpact + spiritualDelta + initialForceFeedback,
      0,
      100
    );
  }

  // 3. Coupled Steady-State Convergence (Hormones <-> Hormones and Hormones <-> 4 Interactive Forces)
  const hormoneEdges = config.edges.filter(
    (e) => hormoneMap.has(e.from) && hormoneMap.has(e.to)
  );
  const forceToHormoneEdges = config.edges.filter(
    (e) => interactiveForceMap.has(e.from) && hormoneMap.has(e.to)
  );

  for (let pass = 0; pass < 4; pass++) {
    // Update 4 interactive forces from current hormone + spiritual levels
    for (const force of interactiveForces) {
      if (isFreeMode && input.forceOverrides[force.id] !== undefined) {
        interactiveForceValues[force.id] = clamp(input.forceOverrides[force.id], 0, 100);
        continue;
      }

      let incomingDelta = 0;
      for (const edge of config.edges) {
        if (edge.to === force.id) {
          if (hormoneMap.has(edge.from)) {
            const hNode = hormoneMap.get(edge.from)!;
            incomingDelta += (hormoneValues[edge.from] - hNode.baseline) * edge.weight;
          } else if (forces[edge.from]) {
            incomingDelta += forces[edge.from].delta * edge.weight;
          }
        }
      }
      interactiveForceValues[force.id] = clamp(force.baseline + incomingDelta * 0.68, 0, 100);
    }

    // Update hormones from scenario + spiritual + intra-hormone + 4 interactive forces feedback
    const nextHormones: Record<string, number> = { ...hormoneValues };
    for (const h of config.hormones) {
      if (isFreeMode && input.hormoneOverrides[h.id] !== undefined) {
        nextHormones[h.id] = clamp(input.hormoneOverrides[h.id], 0, 100);
        continue;
      }

      const scenarioImpact = !isFreeMode ? activeScenario?.hormoneImpacts?.[h.id] ?? 0 : 0;

      let spiritualDelta = 0;
      for (const edge of config.edges) {
        if (edge.to === h.id && forces[edge.from]) {
          spiritualDelta += forces[edge.from].delta * edge.weight;
        }
      }

      let hormoneNetworkDelta = 0;
      for (const edge of hormoneEdges) {
        if (edge.to === h.id) {
          const srcNode = hormoneMap.get(edge.from)!;
          const srcDelta = hormoneValues[edge.from] - srcNode.baseline;
          hormoneNetworkDelta += srcDelta * edge.weight * 0.3;
        }
      }

      let forceFeedbackDelta = 0;
      for (const edge of forceToHormoneEdges) {
        if (edge.to === h.id) {
          const srcForce = interactiveForceMap.get(edge.from)!;
          const srcDelta = interactiveForceValues[edge.from] - srcForce.baseline;
          // Stronger direct push when user manually overrides a force in Free Mode
          const gain = isFreeMode && input.forceOverrides[edge.from] !== undefined ? 0.55 : 0.25;
          forceFeedbackDelta += srcDelta * edge.weight * gain;
        }
      }

      nextHormones[h.id] = clamp(
        h.baseline + scenarioImpact + spiritualDelta + hormoneNetworkDelta + forceFeedbackDelta,
        0,
        100
      );
    }

    for (const key of Object.keys(nextHormones)) {
      hormoneValues[key] = nextHormones[key];
    }
  }

  const hormones: Record<string, NodeComputationResult> = {};
  for (const h of config.hormones) {
    const val = round1(hormoneValues[h.id]);
    hormones[h.id] = {
      id: h.id,
      value: val,
      baseline: h.baseline,
      delta: round1(val - h.baseline),
    };
  }

  for (const force of interactiveForces) {
    const val = round1(interactiveForceValues[force.id]);
    forces[force.id] = {
      id: force.id,
      value: val,
      baseline: force.baseline,
      delta: round1(val - force.baseline),
    };
  }

  // 5. Compute Dynamic Edge Visuals (Color, Width, Intensity — Static Crisp Display)
  const edgeStates = computeEdgeVisuals(config, hormones, forces);

  return {
    activeScenario,
    isFreeMode,
    hormones,
    forces,
    edgeStates,
  };
}

export function computeEdgeVisuals(
  config: HormonalSystemConfig,
  hormones: Record<string, NodeComputationResult>,
  forces: Record<string, NodeComputationResult>
): ComputedEdgeState[] {
  return config.edges.map((edge) => {
    const src = hormones[edge.from] ?? forces[edge.from];
    const absWeight = Math.abs(edge.weight);

    if (!src) {
      return {
        edge,
        intensity: 0.15,
        signedFlow: 0,
        strokeWidth: 1.5,
        pulseDurationSec: 5,
        isActive: false,
      };
    }

    const srcDelta = src.delta;
    const isSpiritual =
      edge.type === 'spiritual' ||
      Boolean(config.forces.find((f) => f.id === edge.from)?.isIndependent);

    let intensity: number;
    if (isSpiritual) {
      const levelRatio = src.value / 100;
      intensity = clamp(0.18 + levelRatio * absWeight * 1.45, 0.16, 1.0);
    } else if (srcDelta >= 0) {
      intensity = clamp(0.2 + (srcDelta / 50) * absWeight * 1.65, 0.18, 1.0);
    } else {
      const suppressionFactor = clamp(1 + srcDelta / 50, 0, 1);
      intensity = clamp(0.1 + suppressionFactor * 0.12 * absWeight, 0.08, 0.25);
    }

    const strokeWidth = round1(1.3 + intensity * 3.2);
    const pulseDurationSec = round1(5.4 - intensity * 4.2);
    const signedFlow = round1(srcDelta * edge.weight);

    return {
      edge,
      intensity: round1(intensity),
      signedFlow,
      strokeWidth,
      pulseDurationSec,
      isActive: intensity >= 0.22,
    };
  });
}

export interface ParseConfigResult {
  ok: true;
  config: HormonalSystemConfig;
}

export interface ParseConfigError {
  ok: false;
  error: string;
}

export function parseAndValidateConfig(rawJson: string): ParseConfigResult | ParseConfigError {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    return {
      ok: false,
      error: `خطأ في صيغة JSON: ${err instanceof Error ? err.message : 'صيغة غير صالحة'}`,
    };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'يجب أن يكون ملف JSON كائناً يحتوي على الحقول الرئيسية للمنظومة.' };
  }

  const obj = parsed as Record<string, unknown>;
  const requiredArrays = ['forces', 'clusters', 'hormones', 'scenarios', 'edges'] as const;
  for (const key of requiredArrays) {
    if (!Array.isArray(obj[key])) {
      return { ok: false, error: `الحقل "${key}" مفقود أو ليس مصفوفة صالحة.` };
    }
  }

  const cfg = obj as unknown as HormonalSystemConfig;

  if (cfg.forces.length === 0 || cfg.hormones.length === 0 || cfg.scenarios.length === 0) {
    return { ok: false, error: 'يجب أن يحتوي الملف على القوى والهرمونات والسيناريوهات.' };
  }

  const independentIds = new Set(
    cfg.forces.filter((f) => f.isIndependent).map((f) => f.id)
  );
  const invalidEdge = cfg.edges.find((e) => independentIds.has(e.to));
  if (invalidEdge) {
    return {
      ok: false,
      error: `انتهاك قاعدة القوة الروحية (تؤثر ولا تتأثر): السهم "${invalidEdge.id}" يستهدف "${invalidEdge.to}".`,
    };
  }

  return {
    ok: true,
    config: {
      title: typeof cfg.title === 'string' && cfg.title.trim() ? cfg.title : 'المحاكي الهرموني التفاعلي',
      subtitle: typeof cfg.subtitle === 'string' ? cfg.subtitle : '',
      forces: cfg.forces,
      clusters: cfg.clusters,
      hormones: cfg.hormones,
      scenarios: cfg.scenarios,
      edges: cfg.edges,
    },
  };
}
