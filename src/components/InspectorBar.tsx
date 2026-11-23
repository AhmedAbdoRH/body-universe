import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronUp, RotateCcw, SlidersHorizontal } from 'lucide-react';
import {
  ForceNode,
  HormoneNode,
  ScenarioCategory,
  ScenarioDef,
  SimulationSnapshot,
} from '../types/simulator';

interface InspectorBarProps {
  configForces: ForceNode[];
  configHormones: HormoneNode[];
  scenarios: ScenarioDef[];
  snapshot: SimulationSnapshot;
  selectedNodeId: string | null;
  onSelectScenario: (scenarioId: string) => void;
  onResetToBaseline: () => void;
  onClearSelection: () => void;
  onSwitchToFreeMode: () => void;
}

const CATEGORY_ORDER: ScenarioCategory[] = ['control', 'psychophysical', 'sexual_response'];
const CATEGORY_LABELS: Record<ScenarioCategory, string> = {
  control: 'التحكم والمرجعية',
  psychophysical: 'الحالات النفسية والجسدية',
  sexual_response: 'الاستجابة الجنسية ومراحلها',
};

export const InspectorBar: React.FC<InspectorBarProps> = ({
  configForces,
  configHormones,
  scenarios,
  snapshot,
  selectedNodeId,
  onSelectScenario,
  onResetToBaseline,
  onClearSelection,
  onSwitchToFreeMode,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const selectedForce = configForces.find((f) => f.id === selectedNodeId);
  const selectedHormone = configHormones.find((h) => h.id === selectedNodeId);

  const selectedValue = selectedForce
    ? snapshot.forces[selectedForce.id]
    : selectedHormone
    ? snapshot.hormones[selectedHormone.id]
    : null;

  const incomingCount = selectedNodeId
    ? snapshot.edgeStates.filter((e) => e.edge.to === selectedNodeId).length
    : 0;
  const outgoingCount = selectedNodeId
    ? snapshot.edgeStates.filter((e) => e.edge.from === selectedNodeId).length
    : 0;

  return (
    <footer
      dir="rtl"
      data-testid="bottom-pinned-bar"
      className="sticky bottom-0 bg-slate-900/95 backdrop-blur-xs border-t border-slate-800 px-3 sm:px-4 lg:px-6 py-1.5 flex items-center justify-between gap-2 sm:gap-3 text-[11px] shrink-0 z-30"
    >
      {/* Right (Start in RTL): Scenario Dropdown Button + Active Selection/Info */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
        <div ref={dropdownRef} className="relative shrink-0">
          <button
            type="button"
            data-testid="scenario-dropdown-btn"
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-100 font-semibold transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          >
            <SlidersHorizontal className="w-3 h-3 text-sky-400 shrink-0" aria-hidden="true" />
            <span className="text-slate-400 font-normal hidden sm:inline">السيناريو:</span>
            <span className="text-sky-300 font-bold max-w-[130px] sm:max-w-[210px] truncate">
              {snapshot.activeScenario.nameAr}
            </span>
            <ChevronUp
              className={`w-3 h-3 text-slate-400 transition-transform duration-150 shrink-0 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {isDropdownOpen && (
            <div
              data-testid="scenario-dropdown-menu"
              role="listbox"
              aria-label="اختيار السيناريو"
              className="absolute bottom-full right-0 mb-2 w-[265px] sm:w-[295px] max-w-[calc(100vw-24px)] max-h-[65dvh] overflow-y-auto rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50"
            >
              {CATEGORY_ORDER.map((category) => {
                const groupScenarios = scenarios.filter((s) => s.category === category);
                if (groupScenarios.length === 0) return null;
                return (
                  <div key={category} className="mb-1 last:mb-0">
                    <div className="px-2 py-0.5 text-[9.5px] font-bold text-slate-400 border-b border-slate-800/80 mb-0.5">
                      {CATEGORY_LABELS[category]}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {groupScenarios.map((sc) => {
                        const isActive = snapshot.activeScenario.id === sc.id;
                        return (
                          <button
                            key={sc.id}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            data-testid={`dropdown-scenario-${sc.id}`}
                            onClick={() => {
                              onSelectScenario(sc.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-right px-2 py-1.5 rounded-lg flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-sky-500/20 text-sky-200 border border-sky-500/40'
                                : 'text-slate-200 hover:bg-slate-800 border border-transparent'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="text-[11px] font-bold leading-snug truncate">
                                {sc.nameAr}
                              </div>
                              <div className="text-[9px] font-latin text-slate-400 truncate">
                                {sc.nameEn}
                              </div>
                            </div>
                            {isActive && (
                              <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" aria-hidden="true" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="button"
          data-testid="reset-baseline-btn"
          onClick={onResetToBaseline}
          title="إعادة ضبط المنظومة بالكامل إلى الحالة الطبيعية"
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10.5px] font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
            snapshot.activeScenario.isBaseline &&
            !selectedNodeId &&
            Math.abs(snapshot.forces.spiritual?.delta ?? 0) < 0.1
              ? 'bg-slate-800/50 border-slate-800 text-slate-400'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-emerald-300'
          }`}
        >
          <RotateCcw className="w-3 h-3 shrink-0" aria-hidden="true" />
          <span>الحالة الطبيعية</span>
        </button>

        {selectedNodeId && (selectedForce || selectedHormone) && selectedValue ? (
          <div className="flex items-center gap-2 min-w-0 flex-1 text-[10.5px]">
            <span className="font-bold text-slate-100 whitespace-nowrap truncate">
              {selectedForce?.nameAr ?? selectedHormone?.nameAr}
            </span>
            <span
              dir="ltr"
              style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }}
              className="font-mono-num font-semibold text-slate-100 whitespace-nowrap inline-block"
            >
              {selectedValue.value}% ({selectedValue.delta >= 0 ? `+${selectedValue.delta}` : selectedValue.delta})
            </span>
            <span className="text-slate-600 hidden md:inline" aria-hidden="true">·</span>
            <span className="text-slate-400 truncate max-w-md hidden md:inline">
              {selectedForce?.description ?? selectedHormone?.description}
            </span>
            <span className="text-slate-600 hidden lg:inline" aria-hidden="true">·</span>
            <span className="text-slate-400 hidden lg:inline whitespace-nowrap">
              وارد: {incomingCount} · صادر: {outgoingCount}
            </span>
            <button
              type="button"
              onClick={onClearSelection}
              className="text-sky-400 hover:underline font-medium whitespace-nowrap cursor-pointer shrink-0"
            >
              إلغاء
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 min-w-0 flex-1 text-[10.5px]">
            <span className="text-slate-400 truncate max-w-xl">
              {snapshot.activeScenario.description}
            </span>
            <span className="text-slate-600 hidden lg:inline" aria-hidden="true">·</span>
            <span className="text-slate-400 hidden lg:inline whitespace-nowrap">
              اضغط مطولاً على أي بطاقة لفتح مؤشر التحكم
            </span>
            {!snapshot.isFreeMode && (
              <button
                type="button"
                onClick={onSwitchToFreeMode}
                className="text-sky-400 hover:underline font-medium whitespace-nowrap cursor-pointer shrink-0"
              >
                فتح التحكم اليدوي الحر
              </button>
            )}
          </div>
        )}
      </div>

      {/* Unboxed Arrow Legend (Desktop) */}
      <div className="hidden xl:flex items-center gap-3.5 text-[10.5px] text-slate-400 shrink-0">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-3.5 h-0.5 bg-emerald-400 inline-block" aria-hidden="true" />
          تحفيز طردي
        </span>
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-3.5 h-0.5 bg-rose-400 inline-block" aria-hidden="true" />
          تثبيط عكسي
        </span>
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-3.5 h-0.5 bg-amber-400 inline-block" aria-hidden="true" />
          مسار روحي (أحادي الاتجاه)
        </span>
      </div>
    </footer>
  );
};
