import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot, increment } from 'firebase/firestore';
import { db } from './firebase';

export interface AppActivityMetrics {
  // Games
  quartetClashMatches: number;
  findTheThiefMatches: number;

  // Pulse
  pulseTasksNoted: number;

  // Tools Requests
  drawingSeriesRequests: number;
  fileNameGrabberRequests: number;
  transmittalBuilderRequests: number;

  // Calculators
  formCalculatorCalculations: number;
  keypadCalculatorCalculations: number;

  updatedAt?: string;
}

const STORAGE_KEY = 'buildsmith_activity_metrics_v1';

export const DEFAULT_METRICS: AppActivityMetrics = {
  quartetClashMatches: 142,
  findTheThiefMatches: 98,
  pulseTasksNoted: 24,
  drawingSeriesRequests: 67,
  fileNameGrabberRequests: 85,
  transmittalBuilderRequests: 42,
  formCalculatorCalculations: 119,
  keypadCalculatorCalculations: 234,
};

export function getCachedMetrics(): AppActivityMetrics {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_METRICS, ...JSON.parse(saved) };
    }
  } catch {}
  return { ...DEFAULT_METRICS };
}

export function saveCachedMetrics(metrics: AppActivityMetrics): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
  } catch {}
}

const METRICS_DOC_ID = 'global_counters';

/**
 * Increment a specific metric counter both in local storage and in Firestore
 */
export async function incrementMetric(
  key: keyof Omit<AppActivityMetrics, 'updatedAt'>,
  amount: number = 1
): Promise<void> {
  // 1. Immediately update local cache for instant UI feedback
  const current = getCachedMetrics();
  current[key] = (current[key] || 0) + amount;
  current.updatedAt = new Date().toISOString();
  saveCachedMetrics(current);

  // Dispatch custom storage event so other components in the same window update immediately
  window.dispatchEvent(new Event('buildsmith_metrics_updated'));

  // 2. Persist to Firestore
  try {
    const docRef = doc(db, 'analytics', METRICS_DOC_ID);
    await setDoc(
      docRef,
      {
        [key]: increment(amount),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore incrementMetric notice:', err);
  }
}

/**
 * Set a specific metric (e.g. sync exact tasks list count)
 */
export async function setMetricValue(
  key: keyof Omit<AppActivityMetrics, 'updatedAt'>,
  value: number
): Promise<void> {
  const current = getCachedMetrics();
  current[key] = Math.max(0, value);
  current.updatedAt = new Date().toISOString();
  saveCachedMetrics(current);

  window.dispatchEvent(new Event('buildsmith_metrics_updated'));

  try {
    const docRef = doc(db, 'analytics', METRICS_DOC_ID);
    await setDoc(
      docRef,
      {
        [key]: Math.max(0, value),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore setMetricValue notice:', err);
  }
}

/**
 * Subscribe to real-time metrics from Firestore with local cache fallback
 */
export function subscribeActivityMetrics(
  callback: (metrics: AppActivityMetrics) => void
): () => void {
  const cached = getCachedMetrics();
  callback(cached);

  const docRef = doc(db, 'analytics', METRICS_DOC_ID);

  // First verify doc exists, if not initialize it
  getDoc(docRef)
    .then((snap) => {
      if (!snap.exists()) {
        setDoc(docRef, { ...cached, updatedAt: new Date().toISOString() }, { merge: true }).catch(
          () => {}
        );
      }
    })
    .catch(() => {});

  const unsubFirestore = onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const merged: AppActivityMetrics = {
          quartetClashMatches: Number(data.quartetClashMatches ?? cached.quartetClashMatches),
          findTheThiefMatches: Number(data.findTheThiefMatches ?? cached.findTheThiefMatches),
          pulseTasksNoted: Number(data.pulseTasksNoted ?? cached.pulseTasksNoted),
          drawingSeriesRequests: Number(data.drawingSeriesRequests ?? cached.drawingSeriesRequests),
          fileNameGrabberRequests: Number(
            data.fileNameGrabberRequests ?? cached.fileNameGrabberRequests
          ),
          transmittalBuilderRequests: Number(
            data.transmittalBuilderRequests ?? cached.transmittalBuilderRequests
          ),
          formCalculatorCalculations: Number(
            data.formCalculatorCalculations ?? cached.formCalculatorCalculations
          ),
          keypadCalculatorCalculations: Number(
            data.keypadCalculatorCalculations ?? cached.keypadCalculatorCalculations
          ),
          updatedAt: data.updatedAt,
        };
        saveCachedMetrics(merged);
        callback(merged);
      }
    },
    (err) => {
      console.warn('Firestore metrics subscription notice:', err);
    }
  );

  const handleLocalUpdate = () => {
    callback(getCachedMetrics());
  };

  window.addEventListener('buildsmith_metrics_updated', handleLocalUpdate);

  return () => {
    unsubFirestore();
    window.removeEventListener('buildsmith_metrics_updated', handleLocalUpdate);
  };
}

/**
 * React Hook for consuming activity metrics across any page
 */
export function useActivityMetrics() {
  const [metrics, setMetrics] = useState<AppActivityMetrics>(() => getCachedMetrics());

  useEffect(() => {
    const unsub = subscribeActivityMetrics((updated) => {
      setMetrics(updated);
    });
    return () => unsub();
  }, []);

  return { metrics, incrementMetric, setMetricValue };
}
