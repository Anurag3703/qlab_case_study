'use client';

import { AlertTriangle, Info, Search, Sparkles, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ComposedChart, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';



// === TYPE DEFINITIONS ===
interface Defect {
  id: number;
  date: string;
  time: string;
  defectName: string;
  station: string;
  partOfCar: string;
  reporter: string;
  partNumber: string;
  severityRating: number;
  carModel: string;
  motorType: string;
  designPackage: string;
  productionShift: string;
  resolutionTime: number;
  rootCauseIdentified: 'Yes' | 'No';
  defectCategory: 'Cosmetic' | 'Functional' | 'Critical';
  flagged: boolean;
  note: string;
  status: string;
}

// === SYNTHETIC DATA GENERATOR ===
const generateSyntheticData = (): Defect[] => {
  const models = ['Base', 'iX0M', 'Long', 'Alpina', 'Pick-Up'];
  const motorTypes = ['Long Range', 'High Performance'];
  const designPackages = ['Offroad', 'Race', 'Luxury'];
  const shifts = ['Morning', 'Afternoon', 'Night'];
  const stations = ['Body Shop', 'Paint Shop', 'Assembly', 'Quality Gate', 'Final Inspection'];
  const parts = ['Battery Pack', 'Door Panel', 'Windshield', 'Suspension', 'Electric Motor', 'Dashboard', 'Seat Assembly', 'Brake System'];
  const defectNames = ['Misalignment', 'Paint Defect', 'Electrical Issue', 'Loose Component', 'Calibration Error', 'Surface Scratch', 'Seal Defect', 'Software Glitch'];
  const reporters = ['John Smith', 'Maria Garcia', 'Ahmed Hassan', 'Lisa Chen', 'Hans Mueller', 'Sofia Kovacs'];
  const categories: ('Cosmetic' | 'Functional' | 'Critical')[] = ['Cosmetic', 'Functional', 'Critical'];

  const data: Defect[] = [];
  for (let i = 0; i < 500; i++) {
    const date = new Date(2025, 0, 1 + Math.floor(Math.random() * 90));
    const severity = Math.floor(Math.random() * 10) + 1;
    const resolutionTime = Math.max(0.5, Math.random() * 12 + (severity > 7 ? 5 : 0));

    data.push({
      id: i + 1,
      date: date.toISOString().split('T')[0],
      time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      defectName: defectNames[Math.floor(Math.random() * defectNames.length)],
      station: stations[Math.floor(Math.random() * stations.length)],
      partOfCar: parts[Math.floor(Math.random() * parts.length)],
      reporter: reporters[Math.floor(Math.random() * reporters.length)],
      partNumber: `BMW-${1000 + Math.floor(Math.random() * 9000)}`,
      severityRating: severity,
      carModel: models[Math.floor(Math.random() * models.length)],
      motorType: motorTypes[Math.floor(Math.random() * motorTypes.length)],
      designPackage: designPackages[Math.floor(Math.random() * designPackages.length)],
      productionShift: shifts[Math.floor(Math.random() * shifts.length)],
      resolutionTime: parseFloat(resolutionTime.toFixed(2)),
      rootCauseIdentified: Math.random() > 0.3 ? 'Yes' : 'No',
      defectCategory: categories[severity > 7 ? 2 : severity > 4 ? 1 : 0],
      flagged: false,
      note: '',
      status: ''
    });
  }
  return data;
};

const BMWQualityDashboard = () => {
  const [data, setData] = useState<Defect[]>(generateSyntheticData());
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Defect | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [showOutliersOnly, setShowOutliersOnly] = useState(false);
  const [stdDevThreshold, setStdDevThreshold] = useState(2);
  const [aiAnalysis, setAiAnalysis] = useState('');

  // === OUTLIER CALCULATION ===
  const calculateOutliers = useMemo(() => {
    const metrics = ['resolutionTime', 'severityRating'] as const;
    type Metric = typeof metrics[number];

    const outliers: Record<Metric, {
      mean: number;
      stdDev: number;
      lowerBound: number;
      upperBound: number;
    }> & { staticCritical: number } = {} as any;

    metrics.forEach(metric => {
      const values = data.map(d => d[metric]);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      outliers[metric] = {
        mean,
        stdDev,
        lowerBound: mean - (stdDevThreshold * stdDev),
        upperBound: mean + (stdDevThreshold * stdDev)
      };
    });

    outliers.staticCritical = 8;
    return outliers;
  }, [data, stdDevThreshold]);

  const isOutlier = (record: Defect): boolean => {
    const resTime = calculateOutliers.resolutionTime;
    const sevTime = calculateOutliers.severityRating;

    return (
      record.resolutionTime > resTime.upperBound ||
      record.resolutionTime < resTime.lowerBound ||
      record.severityRating > sevTime.upperBound ||
      record.severityRating >= calculateOutliers.staticCritical
    );
  };

  // === ANALYTICS ===
  const analytics = useMemo(() => {
    const defectsByModel = data.reduce((acc, d) => {
      acc[d.carModel] = (acc[d.carModel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const defectsByType = data.reduce((acc, d) => {
      acc[d.defectName] = (acc[d.defectName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const top5Defects = Object.entries(defectsByType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const reporterPerformance = data.reduce((acc, d) => {
      if (!acc[d.reporter]) {
        acc[d.reporter] = { total: 0, avgTime: 0, times: [] };
      }
      acc[d.reporter].total += 1;
      acc[d.reporter].times.push(d.resolutionTime);
      return acc;
    }, {} as Record<string, { total: number; avgTime: number; times: number[] }>);

    Object.keys(reporterPerformance).forEach(reporter => {
      const times = reporterPerformance[reporter].times;
      reporterPerformance[reporter].avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    });

    const defectsByDate = data.reduce((acc, d) => {
      acc[d.date] = (acc[d.date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const shiftAnalysis = data.reduce((acc, d) => {
      if (!acc[d.productionShift]) {
        acc[d.productionShift] = { count: 0, avgSeverity: 0, severities: [] };
      }
      acc[d.productionShift].count += 1;
      acc[d.productionShift].severities.push(d.severityRating);
      return acc;
    }, {} as Record<string, { count: number; avgSeverity: number; severities: number[] }>);

    Object.keys(shiftAnalysis).forEach(shift => {
      const sev = shiftAnalysis[shift].severities;
      shiftAnalysis[shift].avgSeverity = sev.reduce((a, b) => a + b, 0) / sev.length;
    });

    const stationDefects = data.reduce((acc, d) => {
      acc[d.station] = (acc[d.station] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      defectsByModel: Object.entries(defectsByModel).map(([name, value]) => ({ name, value })),
      top5Defects,
      reporterPerformance: Object.entries(reporterPerformance).map(([name, data]) => ({
        name,
        avgTime: parseFloat(data.avgTime.toFixed(2)),
        total: data.total
      })),
      defectsByDate: Object.entries(defectsByDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count })),
      shiftAnalysis: Object.entries(shiftAnalysis).map(([shift, data]) => ({
        shift,
        count: data.count,
        avgSeverity: parseFloat(data.avgSeverity.toFixed(2))
      })),
      stationDefects: Object.entries(stationDefects).map(([station, count]) => ({ station, count })),
      totalDefects: data.length,
      criticalDefects: data.filter(d => d.severityRating >= 8).length
    };
  }, [data]);
  
  const pareto = useMemo(() => {
  const countByDefect: Record<string, number> = {};
  const countByPart: Record<string, number> = {};

  for (const d of data) {
    countByDefect[d.defectName] = (countByDefect[d.defectName] || 0) + 1;
    countByPart[d.partOfCar] = (countByPart[d.partOfCar] || 0) + 1;
  }

  const total = data.length || 1;

  const defectsPareto = Object.entries(countByDefect)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .map((row, i, arr) => {
      const cum = arr.slice(0, i + 1).reduce((s, r) => s + r.count, 0);
      return {
        ...row,
        pct: parseFloat(((row.count / total) * 100).toFixed(2)),
        cumPct: parseFloat(((cum / total) * 100).toFixed(2))
      };
    });

  const partsPareto = Object.entries(countByPart)
    .map(([part, count]) => ({ part, count }))
    .sort((a, b) => b.count - a.count)
    .map((row, i, arr) => {
      const cum = arr.slice(0, i + 1).reduce((s, r) => s + r.count, 0);
      return {
        ...row,
        pct: parseFloat(((row.count / total) * 100).toFixed(2)),
        cumPct: parseFloat(((cum / total) * 100).toFixed(2))
      };
    });

  return { defectsPareto, partsPareto };
}, [data]);
// Top-N defects × Station × Shift heatmap data
const heatmap = useMemo(() => {
  // 1) Pick top N defect names from your existing Pareto or counts
  const countsByDefect: Record<string, number> = {};
  for (const d of data) countsByDefect[d.defectName] = (countsByDefect[d.defectName] || 0) + 1;
  const topN = Object.entries(countsByDefect)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6) // adjust N
    .map(([name]) => name);

  // 2) Build a 3D aggregation: defect -> station -> shift -> count
  const stations = Array.from(new Set(data.map(d => d.station)));
  const shifts = Array.from(new Set(data.map(d => d.productionShift)));

  const cube: Record<string, Record<string, Record<string, number>>> = {};
  for (const d of data) {
    if (!topN.includes(d.defectName)) continue;
    cube[d.defectName] = cube[d.defectName] || {};
    cube[d.defectName][d.station] = cube[d.defectName][d.station] || {};
    cube[d.defectName][d.station][d.productionShift] = (cube[d.defectName][d.station][d.productionShift] || 0) + 1;
  }

  // 3) Flatten into rows for rendering and compute global max for color scaling
  const rows: Array<{
    defectName: string;
    station: string;
    shift: string;
    count: number;
  }> = [];

  let maxCount = 0;
  for (const defect of topN) {
    for (const st of stations) {
      for (const sh of shifts) {
        const c = cube[defect]?.[st]?.[sh] ?? 0;
        rows.push({ defectName: defect, station: st, shift: sh, count: c });
        if (c > maxCount) maxCount = c;
      }
    }
  }

  return { topDefects: topN, stations, shifts, rows, maxCount: Math.max(maxCount, 1) };
}, [data]);
function heatColor(value: number, max: number): string {
  // 0 -> slate-700, mid -> amber-400, max -> red-500
  const ratio = value / Math.max(max, 1);
  if (ratio === 0) return 'bg-slate-700';
  if (ratio < 0.25) return 'bg-emerald-700';
  if (ratio < 0.5) return 'bg-emerald-500';
  if (ratio < 0.75) return 'bg-amber-500';
  return 'bg-red-500';
}

// Recurrence clusters: Defect × Station × Part
const triads = useMemo(() => {
  type Key = string;
  const keyOf = (d: Defect): Key => `${d.defectName}|||${d.station}|||${d.partOfCar}`;

  const map: Record<Key, {
    defectName: string;
    station: string;
    partOfCar: string;
    count: number;
    sumSeverity: number;
    sumResH: number;
    rootCauseNo: number;
  }> = {};

  for (const d of data) {
    const k = keyOf(d);
    if (!map[k]) {
      map[k] = {
        defectName: d.defectName,
        station: d.station,
        partOfCar: d.partOfCar,
        count: 0,
        sumSeverity: 0,
        sumResH: 0,
        rootCauseNo: 0
      };
    }
    map[k].count += 1;
    map[k].sumSeverity += d.severityRating;
    map[k].sumResH += d.resolutionTime;
    map[k].rootCauseNo += d.rootCauseIdentified === 'No' ? 1 : 0;
  }

  const rows = Object.values(map).map(r => ({
    ...r,
    avgSeverity: parseFloat((r.sumSeverity / r.count).toFixed(2)),
    avgResH: parseFloat((r.sumResH / r.count).toFixed(2)),
  }));

  // Weighted score to prioritize by impact: tune weights as needed
  const withScore = rows.map(r => ({
    ...r,
    score: parseFloat((r.count * (0.6 + 0.4 * (r.avgSeverity / 10)) + 0.2 * r.avgResH).toFixed(2))
  }));

  // Two sorted views
  const byCount = [...withScore].sort((a, b) => b.count - a.count);
  const byScore = [...withScore].sort((a, b) => b.score - a.score);

  return { byCount, byScore };
}, [data]);


// Selected defect for drill
const [selectedDefect, setSelectedDefect] = useState<string | null>(null);

const recurrenceExplorer = useMemo(() => {
  if (!selectedDefect) {
    // Default to the most common defect if nothing picked
    const counts: Record<string, number> = {};
    for (const d of data) counts[d.defectName] = (counts[d.defectName] || 0) + 1;
    const top = Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0] ?? null;
    if (!top) return null;
    // We’ll compute using `top` below
    const target = top;

    const rows = data.filter(d => d.defectName === target);

    const byStation: Record<string, { count: number; sumResH: number; sumSev: number }> = {};
    const byPart: Record<string, { count: number; sumResH: number; sumSev: number }> = {};
    const byShift: Record<string, { count: number; sumSev: number; sumResH: number }> = {};

    for (const r of rows) {
      (byStation[r.station] ||= { count:0, sumResH:0, sumSev:0 });
      byStation[r.station].count++; byStation[r.station].sumResH += r.resolutionTime; byStation[r.station].sumSev += r.severityRating;

      (byPart[r.partOfCar] ||= { count:0, sumResH:0, sumSev:0 });
      byPart[r.partOfCar].count++; byPart[r.partOfCar].sumResH += r.resolutionTime; byPart[r.partOfCar].sumSev += r.severityRating;

      (byShift[r.productionShift] ||= { count:0, sumSev:0, sumResH:0 });
      byShift[r.productionShift].count++; byShift[r.productionShift].sumSev += r.severityRating; byShift[r.productionShift].sumResH += r.resolutionTime;
    }

    const topStations = Object.entries(byStation)
      .map(([station, v]) => ({ station, count: v.count, avgResH: +(v.sumResH/v.count).toFixed(2), avgSev: +(v.sumSev/v.count).toFixed(2) }))
      .sort((a,b) => b.count - a.count)
      .slice(0,5);

    const topParts = Object.entries(byPart)
      .map(([part, v]) => ({ part, count: v.count, avgResH: +(v.sumResH/v.count).toFixed(2), avgSev: +(v.sumSev/v.count).toFixed(2) }))
      .sort((a,b) => b.count - a.count)
      .slice(0,5);

    // Shift deltas (worst differences)
    const shifts = ['Morning','Afternoon','Night'];
    const shiftStats = shifts.map(sh => {
      const v = byShift[sh] || { count:0, sumSev:0, sumResH:0 };
      const avgSev = v.count ? v.sumSev/v.count : 0;
      const avgResH = v.count ? v.sumResH/v.count : 0;
      return { shift: sh, count: v.count, avgSev: +avgSev.toFixed(2), avgResH: +avgResH.toFixed(2) };
    });
    // compute worst delta by comparing counts between shifts
    const pair = (a:any,b:any) => ({ pair:`${a.shift}→${b.shift}`, deltaCount: b.count - a.count, from:a, to:b });
    const deltas = [
      pair(shiftStats[0], shiftStats[1]),
      pair(shiftStats[1], shiftStats[2]),
      pair(shiftStats[0], shiftStats[2]),
      pair(shiftStats[2], shiftStats[0]),
      pair(shiftStats[1], shiftStats[0]),
      pair(shiftStats[2], shiftStats[1]),
    ].sort((a,b) => Math.abs(b.deltaCount) - Math.abs(a.deltaCount));

    const samples = rows.slice(0,20);

    return { target, topStations, topParts, shiftStats, deltas, samples };
  }

  const target = selectedDefect;
  const rows = data.filter(d => d.defectName === target);

  const byStation: Record<string, { count: number; sumResH: number; sumSev: number }> = {};
  const byPart: Record<string, { count: number; sumResH: number; sumSev: number }> = {};
  const byShift: Record<string, { count: number; sumSev: number; sumResH: number }> = {};

  for (const r of rows) {
    (byStation[r.station] ||= { count:0, sumResH:0, sumSev:0 });
    byStation[r.station].count++; byStation[r.station].sumResH += r.resolutionTime; byStation[r.station].sumSev += r.severityRating;

    (byPart[r.partOfCar] ||= { count:0, sumResH:0, sumSev:0 });
    byPart[r.partOfCar].count++; byPart[r.partOfCar].sumResH += r.resolutionTime; byPart[r.partOfCar].sumSev += r.severityRating;

    (byShift[r.productionShift] ||= { count:0, sumSev:0, sumResH:0 });
    byShift[r.productionShift].count++; byShift[r.productionShift].sumSev += r.severityRating; byShift[r.productionShift].sumResH += r.resolutionTime;
  }

  const topStations = Object.entries(byStation)
    .map(([station, v]) => ({ station, count: v.count, avgResH: +(v.sumResH/v.count).toFixed(2), avgSev: +(v.sumSev/v.count).toFixed(2) }))
    .sort((a,b) => b.count - a.count)
    .slice(0,5);

  const topParts = Object.entries(byPart)
    .map(([part, v]) => ({ part, count: v.count, avgResH: +(v.sumResH/v.count).toFixed(2), avgSev: +(v.sumSev/v.count).toFixed(2) }))
    .sort((a,b) => b.count - a.count)
    .slice(0,5);

  const shifts = ['Morning','Afternoon','Night'];
  const shiftStats = shifts.map(sh => {
    const v = byShift[sh] || { count:0, sumSev:0, sumResH:0 };
    const avgSev = v.count ? v.sumSev/v.count : 0;
    const avgResH = v.count ? v.sumResH/v.count : 0;
    return { shift: sh, count: v.count, avgSev: +avgSev.toFixed(2), avgResH: +avgResH.toFixed(2) };
  });
  const pair = (a:any,b:any) => ({ pair:`${a.shift}→${b.shift}`, deltaCount: b.count - a.count, from:a, to:b });
  const deltas = [
    pair(shiftStats[0], shiftStats[1]),
    pair(shiftStats[1], shiftStats[2]),
    pair(shiftStats[0], shiftStats[2]),
    pair(shiftStats[2], shiftStats[0]),
    pair(shiftStats[1], shiftStats[0]),
    pair(shiftStats[2], shiftStats[1]),
  ].sort((a,b) => Math.abs(b.deltaCount) - Math.abs(a.deltaCount));

  const samples = rows.slice(0,20);

  return { target, topStations, topParts, shiftStats, deltas, samples };
}, [data, selectedDefect]);

const quickActions = useMemo(() => {
  if (!recurrenceExplorer) return [];

  const target = recurrenceExplorer.target;
  const rows = data.filter(d => d.defectName === target);

  // Build Station×Shift and Station×Part combinations, then score them
  type Cand = {
    label: string;
    filter: string; // for quick search
    count: number;
    avgSev: number;
    avgResH: number;
    score: number;
  };

  const cands: Cand[] = [];

  // Station × Shift
  const ssMap: Record<string, { count:number; sumSev:number; sumResH:number }> = {};
  for (const r of rows) {
    const key = `${r.station}|||${r.productionShift}`;
    ssMap[key] = ssMap[key] || { count:0, sumSev:0, sumResH:0 };
    ssMap[key].count++; ssMap[key].sumSev += r.severityRating; ssMap[key].sumResH += r.resolutionTime;
  }
  for (const [k, v] of Object.entries(ssMap)) {
    const [station, shift] = k.split('|||');
    const avgSev = v.sumSev / v.count;
    const avgResH = v.sumResH / v.count;
    const score = v.count * (0.6 + 0.4 * (avgSev / 10)) + 0.2 * avgResH;
    cands.push({
      label: `${station} • ${shift}`,
      filter: `${target} ${station} ${shift}`,
      count: v.count,
      avgSev: +avgSev.toFixed(2),
      avgResH: +avgResH.toFixed(2),
      score: +score.toFixed(2)
    });
  }

  // Station × Part
  const spMap: Record<string, { count:number; sumSev:number; sumResH:number }> = {};
  for (const r of rows) {
    const key = `${r.station}|||${r.partOfCar}`;
    spMap[key] = spMap[key] || { count:0, sumSev:0, sumResH:0 };
    spMap[key].count++; spMap[key].sumSev += r.severityRating; spMap[key].sumResH += r.resolutionTime;
  }
  for (const [k, v] of Object.entries(spMap)) {
    const [station, part] = k.split('|||');
    const avgSev = v.sumSev / v.count;
    const avgResH = v.sumResH / v.count;
    const score = v.count * (0.6 + 0.4 * (avgSev / 10)) + 0.2 * avgResH;
    cands.push({
      label: `${station} • ${part}`,
      filter: `${target} ${station} ${part}`,
      count: v.count,
      avgSev: +avgSev.toFixed(2),
      avgResH: +avgResH.toFixed(2),
      score: +score.toFixed(2)
    });
  }

  return cands.sort((a, b) => b.score - a.score).slice(0, 3);
}, [data, recurrenceExplorer]);






  // === FILTER & SORT ===
  const filtered = useMemo(() => {
    let result = data.filter(d =>
      Object.values(d).some(val =>
        val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (showOutliersOnly) {
      result = result.filter(isOutlier);
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key!];
        const bVal = b[sortConfig.key!];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, showOutliersOnly, sortConfig, isOutlier]);

  // === INTERACTIVE FUNCTIONS ===
  const handleFlag = (id: number) => {
    setData(data.map(d =>
      d.id === id ? { ...d, flagged: !d.flagged, status: d.flagged ? '' : 'Under Review' } : d
    ));
  };

  const handleNoteUpdate = (id: number, note: string) => {
    setData(data.map(d => d.id === id ? { ...d, note } : d));
  };

  const handleSort = (key: keyof Defect) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };
  

  // === AI ANALYSIS ===
const runAIAnalysis = async () => {
  console.log('API Key loaded:', process.env.REACT_APP_GROK_API_KEY ? 'YES' : 'NO');
  const flaggedRecords = data.filter(d => d.flagged);
  if (flaggedRecords.length === 0) {
    setAiAnalysis('No flagged records to analyze.');
    return;
  }

  setAiAnalysis('Analyzing...');

  try {
    // Aggregate quick stats for the prompt
    const defectFrequency = flaggedRecords.reduce((acc, r) => {
      acc[r.defectName] = (acc[r.defectName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topDefect = Object.entries(defectFrequency).sort((a, b) => b[1] - a[1])[0] || ['Unknown', 0];
    const avgSeverity = (flaggedRecords.reduce((a, r) => a + r.severityRating, 0) / flaggedRecords.length).toFixed(1);
    const avgResTime = (flaggedRecords.reduce((a, r) => a + r.resolutionTime, 0) / flaggedRecords.length).toFixed(2);

    const prompt = `Analyze BMW iX0 quality issues:
- Total flagged: ${flaggedRecords.length}
- Critical (severity ≥8): ${flaggedRecords.filter(r => r.severityRating >= 8).length}
- Most common defect: ${topDefect[0]} (${topDefect[1]} occurrences)
- Affected models: ${Array.from(new Set(flaggedRecords.map(r => r.carModel))).join(', ')}
- Average severity: ${avgSeverity}/10
- Average resolution time: ${avgResTime} hours
- Stations involved: ${Array.from(new Set(flaggedRecords.map(r => r.station))).join(', ')}

Provide ONLY:
1. ROOT CAUSE PATTERNS (2-3 sentences max)
2. PREVENTIVE ACTIONS (2-3 bullet points)
Keep response under 200 words. Be specific and actionable.`;

    // ✔ CRA-compatible environment variable
    const apiKey = process.env.REACT_APP_GROK_API_KEY;

    if (!apiKey) {
      throw new Error(
        'API key not found. Please set REACT_APP_GROK_API_KEY in your .env or .env.local file.'
      );
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const text = result?.choices?.[0]?.message?.content ?? 'No content returned';

    setAiAnalysis(text);
  } catch (err: any) {
    setAiAnalysis(`AI Analysis failed: ${err?.message ?? 'Unknown error'}`);
  }
};


  const flaggedData = data.filter(d => d.flagged);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              BMW iX0 Quality Intelligence Dashboard
            </h1>
            <p className="text-slate-400 mt-2">Real-time defect analysis • Outlier detection • AI insights</p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {['overview', 'defects', 'outliers', 'ai', 'data'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400">Total Defects</p>
                    <p className="text-3xl font-bold">{analytics.totalDefects}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-400" />
                </div>
              </div>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400">Critical (≥8)</p>
                    <p className="text-3xl font-bold text-red-400">{analytics.criticalDefects}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400">Flagged</p>
                    <p className="text-3xl font-bold text-yellow-400">{flaggedData.length}</p>
                  </div>
                  <Info className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400">Outliers</p>
                    <p className="text-3xl font-bold text-purple-400">{data.filter(isOutlier).length}</p>
                  </div>
                  <Sparkles className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </div>
          )}

          {/* Charts */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold mb-4">Defects by Model</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.defectsByModel.map(d => ({
                    ...d,
                    rate: ((d.value / analytics.totalDefects) * 100).toFixed(1)
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#6ee7b7" />
                    <YAxis stroke="#6ee7b7" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold mb-4">Defects Over Time</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={analytics.defectsByDate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#6ee7b7" />
                    <YAxis stroke="#6ee7b7" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {/* Defects Tab */}
{activeTab === 'defects' && (
  <div className="space-y-6">
    {/* Row 1: Top defects + Defects by Station */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold mb-4">Top 5 Defect Types</h3>
        <div className="space-y-3">
          {analytics.top5Defects.map(([name, count], idx) => (
            <div key={name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-slate-600">#{idx + 1}</span>
                <span className="font-medium">{name}</span>
              </div>
              <span className="px-3 py-1 bg-blue-500 rounded-lg font-semibold">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold mb-4">Defects by Station</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={analytics.stationDefects}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="station" stroke="#6ee7b7" angle={-45} textAnchor="end" height={100} />
            <YAxis stroke="#6ee7b7" />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
            <Bar dataKey="count" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Row 2: Shift analysis + Reporter performance */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold mb-4">Shift Analysis</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={analytics.shiftAnalysis}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="shift" stroke="#a78bfa" />
            <YAxis stroke="#a78bfa" />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
            <Bar dataKey="count" fill="#8b5cf6" name="Defect Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold mb-4">Reporter Performance</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {analytics.reporterPerformance
            .sort((a, b) => b.total - a.total)
            .map(rep => (
              <div key={rep.name} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                <span className="font-medium">{rep.name}</span>
                <div className="flex gap-4 text-sm">
                  <span className="text-cyan-400">{rep.total} reports</span>
                  <span className="text-orange-400">{rep.avgTime}h avg</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>

    {/* Row 3: Category breakdown */}
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h3 className="text-xl font-bold mb-4">Defect Category Breakdown</h3>
      <div className="grid grid-cols-3 gap-4">
        {['Cosmetic', 'Functional', 'Critical'].map(category => {
          const count = data.filter(d => d.defectCategory === category).length;
          const percentage = ((count / data.length) * 100).toFixed(1);
          return (
            <div key={category} className="bg-slate-700 rounded-lg p-4 text-center">
              <p className={`text-3xl font-bold mb-2 ${
                category === 'Critical' ? 'text-red-400' :
                category === 'Functional' ? 'text-orange-400' : 'text-green-400'
              }`}>{count}</p>
              <p className="text-slate-300 font-medium">{category}</p>
              <p className="text-slate-500 text-sm">{percentage}%</p>
            </div>
          );
        })}
      </div>
    </div>

    {/* Row 4: Pareto charts */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold mb-4">Pareto: Defect Names</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={pareto.defectsPareto.slice(0, 15)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-35} textAnchor="end" height={80} />
            {/* Left axis for counts */}
            <YAxis yAxisId="left" />
            {/* Right axis for cumulative percentage */}
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip />
            <Bar yAxisId="left" dataKey="count" fill="#60a5fa" name="Count" />
            <Line yAxisId="right" type="monotone" dataKey="cumPct" stroke="#f59e0b" strokeWidth={2} dot={false} name="Cumulative %" />
            <ReferenceLine yAxisId="right" y={80} stroke="#ef4444" strokeDasharray="4 4" label="80%" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold mb-4">Pareto: Part of the Car</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={pareto.partsPareto.slice(0, 15)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="part" angle={-35} textAnchor="end" height={80} />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip />
            <Bar yAxisId="left" dataKey="count" fill="#34d399" name="Count" />
            <Line yAxisId="right" type="monotone" dataKey="cumPct" stroke="#f59e0b" strokeWidth={2} dot={false} name="Cumulative %" />
            <ReferenceLine yAxisId="right" y={80} stroke="#ef4444" strokeDasharray="4 4" label="80%" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {/* Heatmap: Top Defects × Station × Shift */}
<div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-xl font-bold">Heatmap: Top Defects × Station × Shift</h3>
    <span className="text-slate-400 text-sm">
      Max cell = {heatmap.maxCount}
    </span>
  </div>

  {/* Legend */}
  <div className="flex items-center gap-2 mb-3 text-xs">
    <span className="px-2 py-1 rounded bg-slate-700">0</span>
    <span className="px-2 py-1 rounded bg-emerald-700">low</span>
    <span className="px-2 py-1 rounded bg-emerald-500">med‑low</span>
    <span className="px-2 py-1 rounded bg-amber-500">med‑high</span>
    <span className="px-2 py-1 rounded bg-red-500">high</span>
  </div>

  {/* Grid */}
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-700">
          <th className="p-2 text-left">Defect Name</th>
          {heatmap.stations.map(st => (
            <th key={st} className="p-2 text-left">{st}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {heatmap.topDefects.map(def => (
          <tr key={def} className="border-b border-slate-700 align-top">
            <td className="p-2 font-medium text-slate-200">{def}</td>
            {heatmap.stations.map(st => {
              const cells = heatmap.shifts.map(sh => {
                const cell = heatmap.rows.find(r => r.defectName === def && r.station === st && r.shift === sh);
                const c = cell?.count ?? 0;
                return { sh, c };
              });
              return (
                <td key={st} className="p-2">
                  <div className="grid grid-cols-3 gap-1">
                    {cells.map(({ sh, c }) => (
                      <div
                        key={sh}
                        className={`h-8 rounded ${heatColor(c, heatmap.maxCount)} flex items-center justify-center`}
                        title={`${def} @ ${st} / ${sh}: ${c}`}
                      >
                        <span className="text-[11px]">{c}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                    {heatmap.shifts.map(sh => <span key={sh}>{sh[0]}</span>)}
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
    
  </div>
  
</div>
{/* Recurrence Explorer */}
<div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-4">
  <div className="flex items-center gap-3">
    <h3 className="text-xl font-bold">Recurrence Explorer</h3>
    <select
      value={selectedDefect ?? ''}
      onChange={(e) => setSelectedDefect(e.target.value || null)}
      className="px-3 py-2 bg-slate-700 rounded text-white"
    >
      <option value="">(Top defect)</option>
      {Array.from(new Set(data.map(d => d.defectName))).sort().map(name => (
        <option key={name} value={name}>{name}</option>
      ))}
    </select>
    {recurrenceExplorer && (
      <span className="text-slate-400 text-sm">Viewing: {recurrenceExplorer.target}</span>
    )}
  </div>

  {recurrenceExplorer && (
    <>
      {/* Top Stations and Parts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-700/40 rounded p-4">
          <h4 className="font-semibold mb-3">Top Stations</h4>
          <ul className="space-y-2">
            {recurrenceExplorer.topStations.map(s => (
              <li key={s.station} className="flex items-center justify-between">
                <span>{s.station}</span>
                <span className="text-sm text-slate-300">{s.count} • {s.avgResH}h • Sev {s.avgSev}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-slate-700/40 rounded p-4">
          <h4 className="font-semibold mb-3">Top Parts</h4>
          <ul className="space-y-2">
            {recurrenceExplorer.topParts.map(p => (
              <li key={p.part} className="flex items-center justify-between">
                <span>{p.part}</span>
                <span className="text-sm text-slate-300">{p.count} • {p.avgResH}h • Sev {p.avgSev}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Shift deltas */}
      <div className="bg-slate-700/40 rounded p-4">
        <h4 className="font-semibold mb-3">Worst Shift Deltas (by count)</h4>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {recurrenceExplorer.deltas.slice(0,3).map(d => (
            <li key={d.pair} className="flex items-center justify-between">
              <span>{d.pair}</span>
              <span className={`text-sm ${d.deltaCount >= 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
                Δ {d.deltaCount >= 0 ? '+' : ''}{d.deltaCount}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Sample records + quick filters */}
      <div className="bg-slate-700/40 rounded p-4">
        <h4 className="font-semibold mb-3">Sample Records</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {recurrenceExplorer.samples.map(r => (
            <div key={r.id} className="p-2 rounded bg-slate-800 border border-slate-700 text-sm flex justify-between">
              <div>
                <div className="font-medium">{r.date} • {r.time}</div>
                <div className="text-slate-300">{r.station} • {r.partOfCar}</div>
              </div>
              <div className="text-right">
                <div className={`text-xs px-2 py-0.5 rounded ${
                  r.severityRating >= 8 ? 'bg-red-500' :
                  r.severityRating >= 5 ? 'bg-orange-500' : 'bg-green-500'
                }`}>Sev {r.severityRating}</div>
                <div className="text-slate-400 text-xs">{r.resolutionTime}h</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs"
            onClick={() => {
              // Example: filter to this defect in your Data tab search
              setActiveTab('data');
              setSearchTerm(recurrenceExplorer.target);
            }}
          >
            Filter Data: {recurrenceExplorer.target}
          </button>
          {recurrenceExplorer.topStations[0] && (
            <button
              className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs"
              onClick={() => {
                setActiveTab('data');
                setSearchTerm(`${recurrenceExplorer.target} ${recurrenceExplorer.topStations[0].station}`);
              }}
            >
              Filter: + Top Station
            </button>
          )}
          {recurrenceExplorer.topParts[0] && (
            <button
              className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs"
              onClick={() => {
                setActiveTab('data');
                setSearchTerm(`${recurrenceExplorer.target} ${recurrenceExplorer.topParts[0].part}`);
              }}
            >
              Filter: + Top Part
            </button>
          )}
        </div>
        
      </div>
    </>
  )}
</div>


   
</div>

  </div>
)}


          {/* Outliers Tab */}
          {activeTab === 'outliers' && (
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold mb-4">Statistical Outlier Detection</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-blue-300">Resolution Time:</p>
                    <p>• Mean (μ): {calculateOutliers.resolutionTime.mean.toFixed(2)} hours</p>
                    <p>• Std Dev (σ): {calculateOutliers.resolutionTime.stdDev.toFixed(2)} hours</p>
                    <p>• Range: {calculateOutliers.resolutionTime.lowerBound.toFixed(2)}h - {calculateOutliers.resolutionTime.upperBound.toFixed(2)}h</p>
                  </div>
                  <div>
                    <p className="text-blue-300">Severity Rating:</p>
                    <p>• Mean (μ): {calculateOutliers.severityRating.mean.toFixed(2)}</p>
                    <p>• Std Dev (σ): {calculateOutliers.severityRating.stdDev.toFixed(2)}</p>
                    <p>• Range: {calculateOutliers.severityRating.lowerBound.toFixed(2)} - {calculateOutliers.severityRating.upperBound.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm text-slate-400">Threshold (σ):</label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.5"
                    value={stdDevThreshold}
                    onChange={e => setStdDevThreshold(parseFloat(e.target.value))}
                    className="ml-2 w-32"
                  />
                  <span className="ml-2 text-cyan-400">{stdDevThreshold}σ</span>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 overflow-x-auto">
                <h3 className="text-xl font-bold mb-4">Outlier Records (Top 20)</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Model</th>
                      <th className="text-left p-2">Defect</th>
                      <th className="text-left p-2">Severity</th>
                      <th className="text-left p-2">Res Time</th>
                      <th className="text-left p-2">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.filter(isOutlier).slice(0, 20).map(row => {
                      const reasons = [];
                      if (row.resolutionTime > calculateOutliers.resolutionTime.upperBound) reasons.push('High Res Time');
                      if (row.resolutionTime < calculateOutliers.resolutionTime.lowerBound) reasons.push('Low Res Time');
                      if (row.severityRating >= 8) reasons.push('Critical Severity');
                      if (row.severityRating > calculateOutliers.severityRating.upperBound) reasons.push('High Severity');

                      return (
                        <tr key={row.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                          <td className="p-2">{row.id}</td>
                          <td className="p-2">{row.carModel}</td>
                          <td className="p-2">{row.defectName}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              row.severityRating >= 8 ? 'bg-red-500' :
                              row.severityRating >= 5 ? 'bg-orange-500' : 'bg-green-500'
                            }`}>
                              {row.severityRating}
                            </span>
                          </td>
                          <td className="p-2">{row.resolutionTime}h</td>
                          <td className="p-2 text-xs">{reasons.join(', ')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6">
                <h3 className="text-2xl font-bold mb-4">AI Root Cause Analysis</h3>
                <p className="mb-4">Flag records and click below for AI insights</p>
                <button
                  onClick={runAIAnalysis}
                  disabled={flaggedData.length === 0}
                  className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Sparkles className="inline w-5 h-5 mr-2" />
                  Analyze with AI
                </button>
              </div>

              {flaggedData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h4 className="font-semibold mb-3">Flagged Defect Types</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={Object.entries(flaggedData.reduce((acc, d) => {
                        acc[d.defectName] = (acc[d.defectName] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)).map(([name, count]) => ({ name, count }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#a78bfa" angle={-45} textAnchor="end" height={80} />
                        <YAxis stroke="#a78bfa" />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  

                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h4 className="font-semibold mb-3">Flagged by Model</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={Object.entries(flaggedData.reduce((acc, d) => {
                        acc[d.carModel] = (acc[d.carModel] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)).map(([name, count]) => ({ name, count }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#f472b6" />
                        <YAxis stroke="#f472b6" />
                        <Tooltip />
                        <Bar dataKey="count" fill="#ec4899" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {aiAnalysis && (
                <div className="bg-slate-800 rounded-xl p-6 border border-green-500">
                  <h4 className="font-bold text-green-400 mb-3">AI Analysis Result</h4>
                  <pre className="whitespace-pre-wrap text-sm">{aiAnalysis}</pre>
                </div>
              )}
            </div>
          )}
          

          {/* Data Table Tab */}
          {activeTab === 'data' && (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search any field..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOutliersOnly}
                    onChange={e => setShowOutliersOnly(e.target.checked)}
                    className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500"
                  />
                  <span>Outliers Only</span>
                </label>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      {(['id', 'date', 'carModel', 'defectName', 'severityRating', 'resolutionTime', 'station', 'reporter'] as (keyof Defect)[]).map(key => (
                        <th key={key} className="text-left p-2">
                          <button
                            onClick={() => handleSort(key)}
                            className="font-medium hover:text-cyan-400 transition"
                          >
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            {sortConfig.key === key && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                          </button>
                        </th>
                      ))}
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 50).map(row => (
                      <tr key={row.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                        <td className="p-2">{row.id}</td>
                        <td className="p-2">{row.date}</td>
                        <td className="p-2">{row.carModel}</td>
                        <td className="p-2">{row.defectName}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            row.severityRating >= 8 ? 'bg-red-500' :
                            row.severityRating >= 5 ? 'bg-orange-500' : 'bg-green-500'
                          }`}>
                            {row.severityRating}
                          </span>
                        </td>
                        <td className="p-2">{row.resolutionTime}h</td>
                        <td className="p-2">{row.station}</td>
                        <td className="p-2">{row.reporter}</td>
                        <td className="p-2">
                          <button
                            onClick={() => handleFlag(row.id)}
                            className={`mr-2 px-3 py-1 rounded text-xs transition ${
                              row.flagged
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
                            }`}
                          >
                            {row.flagged ? 'Flagged' : 'Flag'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BMWQualityDashboard;