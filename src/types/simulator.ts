export type ForceId = 'vital' | 'sexual' | 'emotional' | 'mental' | 'spiritual';

export type HormoneId =
  | 'cortisol'
  | 'adrenaline'
  | 'insulin'
  | 'thyroid'
  | 'glucagon'
  | 'leptin'
  | 'ghrelin'
  | 'dopamine'
  | 'serotonin'
  | 'melatonin'
  | 'oxytocin'
  | 'noradrenaline'
  | 'gaba'
  | 'endorphins'
  | 'testosterone'
  | 'estrogen'
  | 'progesterone'
  | 'growth_hormone'
  | 'dhea'
  | 'prolactin';

export type ClusterId = 'stress_metabolism' | 'mood_sleep_bonding' | 'anabolism_reproduction';

export type ScenarioCategory = 'control' | 'psychophysical' | 'sexual_response';

export type EdgeType = 'excitatory' | 'inhibitory' | 'spiritual';

export interface ForceNode {
  id: string;
  nameAr: string;
  nameEn: string;
  baseline: number;
  isIndependent?: boolean; // true for Spiritual Force ("تؤثر ولا تتأثر")
  description: string;
}

export interface HormoneCluster {
  id: string;
  nameAr: string;
  nameEn: string;
  accent: string;
}

export interface HormoneNode {
  id: string;
  clusterId: string;
  nameAr: string;
  nameEn: string;
  baseline: number;
  unit: string;
  description: string;
}

export interface ScenarioDef {
  id: string;
  category: ScenarioCategory;
  nameAr: string;
  nameEn: string;
  isFreeMode?: boolean;
  isBaseline?: boolean;
  description: string;
  /** Direct stimulus deltas injected into hormones (-50 to +50) */
  hormoneImpacts: Record<string, number>;
  /** Optional direct modulation from the scenario onto the spiritual driver if specified */
  spiritualImpact?: number;
}

export interface InfluenceEdge {
  id: string;
  from: string;
  to: string;
  /** Positive for excitatory/spiritual amplification, negative for inhibitory */
  weight: number;
  type: EdgeType;
  description?: string;
}

export interface HormonalSystemConfig {
  title: string;
  subtitle: string;
  forces: ForceNode[];
  clusters: HormoneCluster[];
  hormones: HormoneNode[];
  scenarios: ScenarioDef[];
  edges: InfluenceEdge[];
}

export interface SimulationInputState {
  activeScenarioId: string;
  /** Manual overrides used in Free Mode for hormones */
  hormoneOverrides: Record<string, number>;
  /** Manual overrides used in Free Mode for the 4 interactive forces */
  forceOverrides: Record<string, number>;
  /** Independent slider value for Spiritual Force (influences without being influenced) */
  spiritualLevel: number;
}

export interface NodeComputationResult {
  id: string;
  value: number;
  baseline: number;
  delta: number;
}

export interface ComputedEdgeState {
  edge: InfluenceEdge;
  /** Normalized intensity 0..1 reflecting live flow strength */
  intensity: number;
  /** Signed live flow contribution */
  signedFlow: number;
  /** Stroke width in px */
  strokeWidth: number;
  /** Animation duration in seconds (lower = faster pulse) */
  pulseDurationSec: number;
  /** Whether the pathway is currently active above noise floor */
  isActive: boolean;
}

export interface SimulationSnapshot {
  activeScenario: ScenarioDef;
  isFreeMode: boolean;
  hormones: Record<string, NodeComputationResult>;
  forces: Record<string, NodeComputationResult>;
  edgeStates: ComputedEdgeState[];
}
