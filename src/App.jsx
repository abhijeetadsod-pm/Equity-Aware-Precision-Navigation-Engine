import { useEffect, useMemo, useState } from 'react';

const mockPatients = [
  {
    id: 'A',
    name: 'Patient A',
    nccnRiskScore: 0.85,
    insuranceType: 'Medicaid',
    adiStatus: 'High ADI',
    language: 'Spanish',
    priorTesting: 'No prior genetic testing',
    equitySignals: ['Medicaid coverage', 'High Area Deprivation Index', 'Non-English preferred language']
  },
  {
    id: 'B',
    name: 'Patient B',
    nccnRiskScore: 0.75,
    insuranceType: 'Private',
    adiStatus: 'Low ADI',
    language: 'English',
    priorTesting: 'No prior genetic testing',
    equitySignals: []
  },
  {
    id: 'C',
    name: 'Patient C',
    nccnRiskScore: 0.35,
    insuranceType: 'Private',
    adiStatus: 'Moderate ADI',
    language: 'English',
    priorTesting: 'Prior panel test completed',
    equitySignals: []
  }
];

const rulesConfig = {
  riskThreshold: 0.7,
  useEquityAmplification: true
};

const priorityMeta = {
  HIGH: { label: 'High Priority', className: 'priority-high' },
  STANDARD: { label: 'Standard Priority', className: 'priority-standard' },
  LOW: { label: 'Low Priority', className: 'priority-low' }
};

function assessPatient(patient, isEquityAmplificationEnabled) {
  const hasHighRisk = patient.nccnRiskScore >= rulesConfig.riskThreshold;
  const hasEquitySignal = patient.equitySignals.length > 0;

  let tier = 'LOW';
  if (isEquityAmplificationEnabled) {
    if (hasHighRisk && hasEquitySignal) tier = 'HIGH';
    else if (hasHighRisk) tier = 'STANDARD';
  } else if (hasHighRisk) {
    tier = 'STANDARD';
  }

  const factors = [
    `NCCN risk score: ${patient.nccnRiskScore.toFixed(2)} (threshold: ${rulesConfig.riskThreshold.toFixed(2)})`,
    `Insurance type: ${patient.insuranceType}`,
    `ADI status: ${patient.adiStatus}`,
    `Preferred language: ${patient.language}`,
    `Prior testing: ${patient.priorTesting}`
  ];

  if (isEquityAmplificationEnabled && hasEquitySignal) {
    factors.push(`Equity signals considered: ${patient.equitySignals.join(', ')}`);
  }

  if (!isEquityAmplificationEnabled) {
    factors.push('Equity amplification disabled: only NCCN score used for tier assignment');
  }

  return {
    tier,
    factors,
    testingRecommended: hasHighRisk
  };
}

export default function App() {
  const [selectedPatientId, setSelectedPatientId] = useState(mockPatients[0].id);
  const [equityAmplificationEnabled, setEquityAmplificationEnabled] = useState(rulesConfig.useEquityAmplification);
  const [assessmentLog, setAssessmentLog] = useState([]);
  const [toast, setToast] = useState('');

  const selectedPatient = useMemo(
    () => mockPatients.find((patient) => patient.id === selectedPatientId) ?? mockPatients[0],
    [selectedPatientId]
  );

  const selectedAssessment = useMemo(
    () => assessPatient(selectedPatient, equityAmplificationEnabled),
    [selectedPatient, equityAmplificationEnabled]
  );

  useEffect(() => {
    const timestamp = new Date().toISOString();
    const latestAssessment = assessPatient(selectedPatient, equityAmplificationEnabled);

    setAssessmentLog((current) => [
      {
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        tier: latestAssessment.tier,
        testingRecommended: latestAssessment.testingRecommended,
        timestamp
      },
      ...current
    ]);
  }, [selectedPatient, equityAmplificationEnabled]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(timeout);
  }, [toast]);

  const latestPerPatient = useMemo(() => {
    const seen = new Map();
    for (const event of assessmentLog) {
      if (!seen.has(event.patientId)) seen.set(event.patientId, event);
    }
    return Array.from(seen.values());
  }, [assessmentLog]);

  const metrics = useMemo(() => {
    const total = latestPerPatient.length;
    const tierCounts = latestPerPatient.reduce(
      (acc, event) => {
        acc[event.tier] += 1;
        if (event.testingRecommended) acc.testingRecommended += 1;
        return acc;
      },
      { HIGH: 0, STANDARD: 0, LOW: 0, testingRecommended: 0 }
    );

    return {
      totalPatientsProcessed: total,
      highPct: total ? Math.round((tierCounts.HIGH / total) * 100) : 0,
      standardPct: total ? Math.round((tierCounts.STANDARD / total) * 100) : 0,
      lowPct: total ? Math.round((tierCounts.LOW / total) * 100) : 0,
      testingRecommendedPct: total ? Math.round((tierCounts.testingRecommended / total) * 100) : 0
    };
  }, [latestPerPatient]);

  const runAction = (actionName) => {
    setToast(`${actionName} completed for ${selectedPatient.name}`);
  };

  return (
    <div className="app-shell">
      <header>
        <h1>Equity-Aware Precision Navigation Engine</h1>
        <p className="subtitle">Provider decision support prototype</p>
      </header>

      <section className="panel rule-panel">
        <div>
          <h2>Rule Engine</h2>
          <p>Threshold: NCCN risk score ≥ {rulesConfig.riskThreshold.toFixed(2)}</p>
        </div>
        <label className="toggle">
          <input
            type="checkbox"
            checked={equityAmplificationEnabled}
            onChange={(event) => setEquityAmplificationEnabled(event.target.checked)}
          />
          Enable Equity Amplification
        </label>
      </section>

      <section className="panel patient-selector">
        <h2>Patient Selector</h2>
        <div className="tabs">
          {mockPatients.map((patient) => (
            <button
              key={patient.id}
              type="button"
              className={patient.id === selectedPatient.id ? 'active' : ''}
              onClick={() => setSelectedPatientId(patient.id)}
            >
              {patient.name}
            </button>
          ))}
        </div>
      </section>

      <main className="grid">
        <section className="panel">
          <h2>Patient Summary</h2>
          <dl>
            <div><dt>NCCN Risk Score</dt><dd>{selectedPatient.nccnRiskScore.toFixed(2)}</dd></div>
            <div><dt>Insurance</dt><dd>{selectedPatient.insuranceType}</dd></div>
            <div><dt>ADI Status</dt><dd>{selectedPatient.adiStatus}</dd></div>
            <div><dt>Language</dt><dd>{selectedPatient.language}</dd></div>
            <div><dt>Prior Testing</dt><dd>{selectedPatient.priorTesting}</dd></div>
          </dl>
        </section>

        <section className="panel">
          <h2>Priority Banner</h2>
          <div className={`priority-banner ${priorityMeta[selectedAssessment.tier].className}`}>
            {priorityMeta[selectedAssessment.tier].label}
          </div>

          <details open>
            <summary>Why is this patient {priorityMeta[selectedAssessment.tier].label.toLowerCase()}?</summary>
            <ul className="factors-list">
              {selectedAssessment.factors.map((factor) => (
                <li key={factor}>{factor}</li>
              ))}
            </ul>
          </details>
        </section>

        <section className="panel">
          <h2>Recommended Actions</h2>
          <div className="actions">
            {['Order Genetic Test', 'Refer to Counseling', 'Flag Navigator', 'Send Education'].map((action) => (
              <button key={action} type="button" onClick={() => runAction(action)}>
                {action}
              </button>
            ))}
          </div>
        </section>

        <section className="panel metrics">
          <h2>Metrics Dashboard</h2>
          <div className="metric-cards">
            <article><h3>{metrics.totalPatientsProcessed}</h3><p>Total patients processed</p></article>
            <article><h3>{metrics.highPct}%</h3><p>High priority</p></article>
            <article><h3>{metrics.standardPct}%</h3><p>Standard priority</p></article>
            <article><h3>{metrics.lowPct}%</h3><p>Low priority</p></article>
            <article><h3>{metrics.testingRecommendedPct}%</h3><p>Testing recommended</p></article>
          </div>
          <p className="timestamp-note">Assessments logged in-memory with timestamp.</p>
        </section>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
