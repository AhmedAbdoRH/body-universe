import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_HORMONAL_CONFIG } from './data/defaultConfig';
import { evaluateSimulation, parseAndValidateConfig } from './engine/simulator';
import { HormonalSystemConfig, SimulationInputState } from './types/simulator';
import { ArrowFilterMode, TopBar, ViewMode } from './components/TopBar';
import { MindMapCanvas } from './components/MindMapCanvas';
import { MobileMindMapView } from './components/MobileMindMapView';
import { InspectorBar } from './components/InspectorBar';
import { JsonSyncModal } from './components/JsonSyncModal';

const STORAGE_KEY = 'hormonal_simulator_custom_json_v2';

function loadInitialConfig(): { config: HormonalSystemConfig; isCustom: boolean } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = parseAndValidateConfig(saved);
      if (parsed.ok) {
        return { config: parsed.config, isCustom: true };
      }
    }
  } catch {
    // Ignore storage read errors
  }
  return { config: DEFAULT_HORMONAL_CONFIG, isCustom: false };
}

export default function App() {
  const initial = useMemo(() => loadInitialConfig(), []);
  const [config, setConfig] = useState<HormonalSystemConfig>(initial.config);
  const [hasCustomConfig, setHasCustomConfig] = useState<boolean>(initial.isCustom);

  const defaultSpiritual = useMemo(
    () => config.forces.find((f) => f.isIndependent)?.baseline ?? 50,
    [config]
  );

  const [simInput, setSimInput] = useState<SimulationInputState>({
    activeScenarioId: 'baseline',
    hormoneOverrides: {},
    forceOverrides: {},
    spiritualLevel: defaultSpiritual,
  });

  const [arrowFilter, setArrowFilter] = useState<ArrowFilterMode>('all');
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    typeof window !== 'undefined' && window.innerWidth < 1024 ? 'mobile' : 'desktop'
  );
  const [hasManualViewMode, setHasManualViewMode] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);

  useEffect(() => {
    if (hasManualViewMode) return;
    const onResize = () => {
      setViewMode(window.innerWidth < 1024 ? 'mobile' : 'desktop');
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [hasManualViewMode]);

  const handleToggleViewMode = () => {
    setHasManualViewMode(true);
    setViewMode((prev) => (prev === 'desktop' ? 'mobile' : 'desktop'));
  };

  // Ensure active scenario stays valid if JSON config replaces scenarios
  useEffect(() => {
    const exists = config.scenarios.some((s) => s.id === simInput.activeScenarioId);
    if (!exists && config.scenarios.length > 0) {
      const fallback = config.scenarios.find((s) => s.isBaseline) ?? config.scenarios[0];
      setSimInput((prev) => ({
        ...prev,
        activeScenarioId: fallback.id,
        hormoneOverrides: {},
        forceOverrides: {},
      }));
    }
  }, [config, simInput.activeScenarioId]);

  const snapshot = useMemo(() => evaluateSimulation(config, simInput), [config, simInput]);

  const handleSelectScenario = (scenarioId: string) => {
    const nextScenario = config.scenarios.find((s) => s.id === scenarioId);
    setSimInput((prev) => ({
      ...prev,
      activeScenarioId: scenarioId,
      hormoneOverrides: nextScenario?.isBaseline ? {} : prev.hormoneOverrides,
      forceOverrides: nextScenario?.isBaseline ? {} : prev.forceOverrides,
      spiritualLevel: nextScenario?.isBaseline ? defaultSpiritual : prev.spiritualLevel,
    }));
  };

  const handleChangeHormone = (hormoneId: string, value: number) => {
    const freeScenario = config.scenarios.find((s) => s.isFreeMode);
    setSimInput((prev) => {
      if (snapshot.isFreeMode || !freeScenario) {
        return {
          ...prev,
          hormoneOverrides: {
            ...prev.hormoneOverrides,
            [hormoneId]: value,
          },
        };
      }
      return {
        ...prev,
        activeScenarioId: freeScenario.id,
        hormoneOverrides: {
          [hormoneId]: value,
        },
      };
    });
  };

  const handleChangeForce = (forceId: string, value: number) => {
    const freeScenario = config.scenarios.find((s) => s.isFreeMode);
    setSimInput((prev) => {
      if (snapshot.isFreeMode || !freeScenario) {
        return {
          ...prev,
          forceOverrides: {
            ...prev.forceOverrides,
            [forceId]: value,
          },
        };
      }
      return {
        ...prev,
        activeScenarioId: freeScenario.id,
        forceOverrides: {
          ...prev.forceOverrides,
          [forceId]: value,
        },
      };
    });
  };

  const handleChangeSpiritual = (value: number) => {
    setSimInput((prev) => ({
      ...prev,
      spiritualLevel: value,
    }));
  };

  const handleSwitchToFreeMode = () => {
    const freeScenario = config.scenarios.find((s) => s.isFreeMode);
    if (freeScenario) {
      setSimInput((prev) => ({
        ...prev,
        activeScenarioId: freeScenario.id,
      }));
    }
  };

  const handleResetToBaseline = () => {
    const baselineScenario = config.scenarios.find((s) => s.isBaseline) ?? config.scenarios[0];
    setSelectedNodeId(null);
    setSimInput({
      activeScenarioId: baselineScenario?.id ?? 'baseline',
      hormoneOverrides: {},
      forceOverrides: {},
      spiritualLevel: defaultSpiritual,
    });
  };

  const handleApplyJsonConfig = (nextConfig: HormonalSystemConfig) => {
    setConfig(nextConfig);
    setHasCustomConfig(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig));
    } catch {
      // Ignore storage quota errors
    }
    const nextSpiritual = nextConfig.forces.find((f) => f.isIndependent)?.baseline ?? 50;
    setSimInput((prev) => ({
      ...prev,
      spiritualLevel: nextSpiritual,
      hormoneOverrides: {},
      forceOverrides: {},
    }));
  };

  const handleResetDefaultConfig = () => {
    setConfig(DEFAULT_HORMONAL_CONFIG);
    setHasCustomConfig(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    const baseSpiritual =
      DEFAULT_HORMONAL_CONFIG.forces.find((f) => f.isIndependent)?.baseline ?? 50;
    setSimInput({
      activeScenarioId: 'baseline',
      hormoneOverrides: {},
      forceOverrides: {},
      spiritualLevel: baseSpiritual,
    });
  };

  return (
    <div className="h-dvh w-screen flex flex-col overflow-hidden bg-slate-950 text-slate-100">
      <TopBar
        title={config.title}
        arrowFilter={arrowFilter}
        onChangeArrowFilter={setArrowFilter}
        viewMode={viewMode}
        onToggleViewMode={handleToggleViewMode}
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
        hasCustomConfig={hasCustomConfig}
      />

      <main className="flex-1 min-h-0 flex flex-col relative">
        {viewMode === 'desktop' ? (
          <MindMapCanvas
            config={config}
            snapshot={snapshot}
            arrowFilter={arrowFilter}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onChangeHormone={handleChangeHormone}
            onChangeForce={handleChangeForce}
            onChangeSpiritual={handleChangeSpiritual}
          />
        ) : (
          <MobileMindMapView
            config={config}
            snapshot={snapshot}
            arrowFilter={arrowFilter}
            onChangeArrowFilter={setArrowFilter}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onChangeHormone={handleChangeHormone}
            onChangeForce={handleChangeForce}
            onChangeSpiritual={handleChangeSpiritual}
          />
        )}
      </main>

      <InspectorBar
        configForces={config.forces}
        configHormones={config.hormones}
        scenarios={config.scenarios}
        snapshot={snapshot}
        selectedNodeId={selectedNodeId}
        onSelectScenario={handleSelectScenario}
        onResetToBaseline={handleResetToBaseline}
        onClearSelection={() => setSelectedNodeId(null)}
        onSwitchToFreeMode={handleSwitchToFreeMode}
      />

      <JsonSyncModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        config={config}
        snapshot={snapshot}
        onApplyConfig={handleApplyJsonConfig}
        onResetDefault={handleResetDefaultConfig}
      />
    </div>
  );
}
