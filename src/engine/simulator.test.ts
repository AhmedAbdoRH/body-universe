import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_HORMONAL_CONFIG } from '../data/defaultConfig';
import { evaluateSimulation, parseAndValidateConfig } from './simulator';

test('baseline scenario maintains equilibrium at 50% across hormones and interactive forces', () => {
  const snapshot = evaluateSimulation(DEFAULT_HORMONAL_CONFIG, {
    activeScenarioId: 'baseline',
    hormoneOverrides: {},
    forceOverrides: {},
    spiritualLevel: 50,
  });

  assert.equal(snapshot.isFreeMode, false);
  for (const h of DEFAULT_HORMONAL_CONFIG.hormones) {
    assert.equal(snapshot.hormones[h.id].value, 50, `Expected ${h.id} at 50`);
    assert.equal(snapshot.hormones[h.id].delta, 0);
  }
  for (const f of DEFAULT_HORMONAL_CONFIG.forces) {
    assert.equal(snapshot.forces[f.id].value, 50, `Expected force ${f.id} at 50`);
    assert.equal(snapshot.forces[f.id].delta, 0);
  }
});

test('stress scenario elevates cortisol/adrenaline and suppresses melatonin & emotional/sexual forces', () => {
  const snapshot = evaluateSimulation(DEFAULT_HORMONAL_CONFIG, {
    activeScenarioId: 'stress',
    hormoneOverrides: {},
    forceOverrides: {},
    spiritualLevel: 50,
  });

  assert.ok(snapshot.hormones.cortisol.value > 75, 'Cortisol should surge in stress');
  assert.ok(snapshot.hormones.adrenaline.value > 80, 'Adrenaline should surge in stress');
  assert.ok(snapshot.hormones.melatonin.value < 25, 'Melatonin should drop in stress');
  assert.ok(snapshot.forces.emotional.value < 45, 'Emotional force should drop in stress');
  assert.ok(snapshot.forces.sexual.value < 45, 'Sexual force should drop in stress');
});

test('spiritual force influences hormones and forces but is never influenced by hormones', () => {
  const baselineWithLowSpiritual = evaluateSimulation(DEFAULT_HORMONAL_CONFIG, {
    activeScenarioId: 'stress',
    hormoneOverrides: {},
    forceOverrides: {},
    spiritualLevel: 50,
  });

  const stressWithHighSpiritual = evaluateSimulation(DEFAULT_HORMONAL_CONFIG, {
    activeScenarioId: 'stress',
    hormoneOverrides: {},
    forceOverrides: {},
    spiritualLevel: 90,
  });

  // Spiritual stays exactly at its independent level even under heavy Stress hormones
  assert.equal(baselineWithLowSpiritual.forces.spiritual.value, 50);
  assert.equal(stressWithHighSpiritual.forces.spiritual.value, 90);

  // Higher spiritual force buffers cortisol and lifts serotonin & emotional force
  assert.ok(
    stressWithHighSpiritual.hormones.cortisol.value <
      baselineWithLowSpiritual.hormones.cortisol.value,
    'High spiritual level should dampen cortisol'
  );
  assert.ok(
    stressWithHighSpiritual.forces.emotional.value >
      baselineWithLowSpiritual.forces.emotional.value,
    'High spiritual level should lift emotional force'
  );
});

test('free mode overrides pin chosen hormone and propagate to dependent hormones and forces', () => {
  const snapshot = evaluateSimulation(DEFAULT_HORMONAL_CONFIG, {
    activeScenarioId: 'free',
    hormoneOverrides: { testosterone: 90, dopamine: 85 },
    forceOverrides: {},
    spiritualLevel: 50,
  });

  assert.equal(snapshot.isFreeMode, true);
  assert.equal(snapshot.hormones.testosterone.value, 90);
  assert.equal(snapshot.hormones.dopamine.value, 85);
  assert.ok(snapshot.forces.sexual.value > 65, 'Sexual force should rise with high testosterone & dopamine');
  assert.ok(snapshot.forces.mental.value > 58, 'Mental force should rise with high dopamine');
});

test('interactive four forces influence hormones downward in free mode while spiritual stays unaffected', () => {
  const snapshot = evaluateSimulation(DEFAULT_HORMONAL_CONFIG, {
    activeScenarioId: 'free',
    hormoneOverrides: {},
    forceOverrides: { sexual: 92, emotional: 88 },
    spiritualLevel: 50,
  });

  assert.equal(snapshot.forces.sexual.value, 92);
  assert.equal(snapshot.forces.emotional.value, 88);
  assert.equal(snapshot.forces.spiritual.value, 50);

  assert.ok(snapshot.hormones.testosterone.value > 58, 'High sexual force should stimulate testosterone');
  assert.ok(snapshot.hormones.oxytocin.value > 58, 'High emotional force should stimulate oxytocin');
  assert.ok(snapshot.hormones.cortisol.value < 45, 'High emotional force should dampen cortisol');
});

test('dynamic edges reflect current intensity via strokeWidth and pulseDurationSec', () => {
  const baseline = evaluateSimulation(DEFAULT_HORMONAL_CONFIG, {
    activeScenarioId: 'baseline',
    hormoneOverrides: {},
    forceOverrides: {},
    spiritualLevel: 50,
  });

  const stress = evaluateSimulation(DEFAULT_HORMONAL_CONFIG, {
    activeScenarioId: 'stress',
    hormoneOverrides: {},
    forceOverrides: {},
    spiritualLevel: 50,
  });

  const baseCortMel = baseline.edgeStates.find((e) => e.edge.id === 'h_cort_mel')!;
  const stressCortMel = stress.edgeStates.find((e) => e.edge.id === 'h_cort_mel')!;

  assert.ok(stressCortMel.strokeWidth > baseCortMel.strokeWidth, 'Inhibitory edge should thicken during stress');
  assert.ok(stressCortMel.pulseDurationSec < baseCortMel.pulseDurationSec, 'Inhibitory pulse should speed up during stress');
});

test('parseAndValidateConfig accepts valid JSON and rejects incoming edges to spiritual force', () => {
  const validText = JSON.stringify(DEFAULT_HORMONAL_CONFIG);
  const validRes = parseAndValidateConfig(validText);
  assert.equal(validRes.ok, true);

  const badSyntax = parseAndValidateConfig('{ invalid json');
  assert.equal(badSyntax.ok, false);

  const brokenSpiritual = structuredClone(DEFAULT_HORMONAL_CONFIG);
  brokenSpiritual.edges.push({
    id: 'illegal_feedback',
    from: 'cortisol',
    to: 'spiritual',
    weight: -0.5,
    type: 'inhibitory',
  });
  const spiritualCheck = parseAndValidateConfig(JSON.stringify(brokenSpiritual));
  assert.equal(spiritualCheck.ok, false);
});

test('expanded 20-hormone model includes all required hormones across the three axes without runaway saturation', () => {
  assert.equal(DEFAULT_HORMONAL_CONFIG.hormones.length, 20);

  const requiredIds = [
    'cortisol', 'adrenaline', 'insulin', 'thyroid', 'glucagon', 'leptin', 'ghrelin',
    'dopamine', 'serotonin', 'melatonin', 'oxytocin', 'noradrenaline', 'gaba', 'endorphins',
    'testosterone', 'estrogen', 'progesterone', 'growth_hormone', 'dhea', 'prolactin',
  ];
  const presentIds = new Set(DEFAULT_HORMONAL_CONFIG.hormones.map((h) => h.id));
  for (const id of requiredIds) {
    assert.ok(presentIds.has(id), `Missing hormone: ${id}`);
  }

  // Verify every scenario produces balanced non-saturated values (strictly inside (5, 95))
  for (const scenario of DEFAULT_HORMONAL_CONFIG.scenarios) {
    const snap = evaluateSimulation(DEFAULT_HORMONAL_CONFIG, {
      activeScenarioId: scenario.id,
      hormoneOverrides: {},
      forceOverrides: {},
      spiritualLevel: 50,
    });
    for (const h of DEFAULT_HORMONAL_CONFIG.hormones) {
      const val = snap.hormones[h.id].value;
      assert.ok(
        val > 5 && val < 95,
        `Hormone ${h.id} saturated to ${val}% under scenario ${scenario.id}`
      );
    }
  }
});

test('new hormones exhibit balanced physiological behavior across meditation, relaxation, and post-climax scenarios', () => {
  const meditation = evaluateSimulation(DEFAULT_HORMONAL_CONFIG, {
    activeScenarioId: 'meditation',
    hormoneOverrides: {},
    forceOverrides: {},
    spiritualLevel: 50,
  });
  assert.ok(meditation.hormones.gaba.value > 72, 'GABA should rise significantly during meditation');
  assert.ok(meditation.hormones.growth_hormone.value > 62, 'Growth hormone should rise during meditation');
  assert.ok(meditation.hormones.dhea.value > 62, 'DHEA should rise during meditation');

  const relaxation = evaluateSimulation(DEFAULT_HORMONAL_CONFIG, {
    activeScenarioId: 'relaxation',
    hormoneOverrides: {},
    forceOverrides: {},
    spiritualLevel: 50,
  });
  assert.ok(relaxation.hormones.gaba.value > 72, 'GABA should rise significantly during relaxation');
  assert.ok(relaxation.hormones.growth_hormone.value > 68, 'Growth hormone should rise during relaxation');

  const paraAfter = evaluateSimulation(DEFAULT_HORMONAL_CONFIG, {
    activeScenarioId: 'sex_para_after',
    hormoneOverrides: {},
    forceOverrides: {},
    spiritualLevel: 50,
  });
  const sympAfter = evaluateSimulation(DEFAULT_HORMONAL_CONFIG, {
    activeScenarioId: 'sex_symp_after',
    hormoneOverrides: {},
    forceOverrides: {},
    spiritualLevel: 50,
  });
  assert.ok(paraAfter.hormones.prolactin.value > 75, 'Prolactin should rise post-climax (parasympathetic)');
  assert.ok(sympAfter.hormones.prolactin.value > 80, 'Prolactin should surge post-climax (sympathetic)');
  assert.ok(sympAfter.hormones.dopamine.value < 35, 'Dopamine should drop during sympathetic refractory period');
});

