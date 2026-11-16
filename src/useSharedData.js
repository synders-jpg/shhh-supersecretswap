import { useCallback, useEffect, useRef, useState } from 'react';

/*
  Shared storage for the gift swap, backed by a Supabase table called "kv".
  Every participant / wishlist / availability record is its own row, so two
  people editing different things at the same time never overwrite each other.

    participant:<id>   -> one participant object
    wishlist:<id>      -> that person's wishlist array
    availability:<id>  -> that person's { dateStr: status } object
    meta:seeded        -> marker so demo data is only written once

  If the two VITE_SUPABASE_* env vars are not set, the app falls back to the
  old behaviour (data stored only in each person's own browser).
*/

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const SHARED_ENABLED = Boolean(SUPABASE_URL && SUPABASE_KEY);

const POLL_MS = 4000;
const TABLE = `${SUPABASE_URL}/rest/v1/kv`;
const headers = {
  apikey: SUPABASE_KEY,
  'Content-Type': 'application/json',
};

// ---------- row <-> state helpers (pure) ----------

export function rowsToState(rows) {
  const participants = [];
  const wishlists = {};
  const availability = {};
  let seeded = false;

  for (const { key, value } of rows) {
    const i = key.indexOf(':');
    const kind = i === -1 ? key : key.slice(0, i);
    const id = i === -1 ? '' : key.slice(i + 1);
    if (kind === 'participant') participants.push(value);
    else if (kind === 'wishlist') wishlists[id] = value;
    else if (kind === 'availability') availability[id] = value;
    else if (key === 'meta:seeded') seeded = true;
  }
  // ids are '1'..'6' for the originals and Date.now() for later additions,
  // so sorting by number keeps everyone in the order they were added.
  participants.sort((a, b) => Number(a.id) - Number(b.id));
  return { participants, wishlists, availability, seeded };
}

export function stateToRows(state) {
  const rows = {};
  for (const p of state.participants) rows[`participant:${p.id}`] = p;
  for (const [id, v] of Object.entries(state.wishlists)) rows[`wishlist:${id}`] = v;
  for (const [id, v] of Object.entries(state.availability)) rows[`availability:${id}`] = v;
  return rows;
}

export function diffRows(before, after) {
  const upserts = [];
  const deletes = [];
  for (const [key, value] of Object.entries(after)) {
    if (JSON.stringify(before[key]) !== JSON.stringify(value)) upserts.push({ key, value });
  }
  for (const key of Object.keys(before)) {
    if (!(key in after)) deletes.push(key);
  }
  return { upserts, deletes };
}

// ---------- network ----------

async function fetchRows() {
  const res = await fetch(`${TABLE}?select=key,value`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`load failed (${res.status})`);
  return res.json();
}

async function upsertRows(rows) {
  if (!rows.length) return;
  const res = await fetch(`${TABLE}?on_conflict=key`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`save failed (${res.status})`);
}

async function deleteRow(key) {
  const res = await fetch(`${TABLE}?key=eq.${encodeURIComponent(key)}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error(`delete failed (${res.status})`);
}

// ---------- the hook ----------

function readLocal(name, fallback) {
  try {
    const saved = localStorage.getItem(name);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Returns the same [value, setter] pairs the app used with useState, plus a
 * status: 'local' | 'loading' | 'ok' | 'error'.
 * Setters accept a new value or an updater function, like useState.
 */
export default function useSharedData(initial) {
  const [state, setState] = useState(() =>
    SHARED_ENABLED
      ? { participants: [], wishlists: {}, availability: {} }
      : {
          participants: readLocal('holiday_participants', initial.participants),
          wishlists: readLocal('holiday_wishlists', initial.wishlists),
          availability: readLocal('holiday_availability', initial.availability),
        }
  );
  const [status, setStatus] = useState(SHARED_ENABLED ? 'loading' : 'local');

  const stateRef = useRef(state);
  const writeVersion = useRef(0); // bumps on every local change
  const queue = useRef(Promise.resolve()); // writes go out one at a time
  const pending = useRef(0); // writes not yet confirmed by the server
  const initialRef = useRef(initial);

  const commit = useCallback((next) => {
    stateRef.current = next;
    setState(next);
  }, []);

  // --- local-only fallback: keep using localStorage ---
  useEffect(() => {
    if (SHARED_ENABLED) return;
    try {
      localStorage.setItem('holiday_participants', JSON.stringify(state.participants));
      localStorage.setItem('holiday_wishlists', JSON.stringify(state.wishlists));
      localStorage.setItem('holiday_availability', JSON.stringify(state.availability));
    } catch { /* storage unavailable */ }
  }, [state]);

  // --- shared mode: load, seed once, then poll ---
  useEffect(() => {
    if (!SHARED_ENABLED) return undefined;
    let stopped = false;

    const load = async () => {
      const startedAt = writeVersion.current;
      try {
        let rows = await fetchRows();
        if (stopped) return;
        let parsed = rowsToState(rows);

        if (!parsed.seeded) {
          // first ever visit: write the starting data once
          const seed = stateToRows(initialRef.current);
          const seedRows = Object.entries(seed).map(([key, value]) => ({ key, value }));
          seedRows.push({ key: 'meta:seeded', value: true });
          await upsertRows(seedRows);
          if (stopped) return;
          rows = await fetchRows();
          if (stopped) return;
          parsed = rowsToState(rows);
        }

        // ignore this result if the user changed something while it was loading
        if (pending.current === 0 && writeVersion.current === startedAt) {
          const { seeded, ...data } = parsed;
          if (JSON.stringify(data) !== JSON.stringify(stateRef.current)) commit(data);
        }
        setStatus('ok');
      } catch (err) {
        if (!stopped) setStatus('error');
      }
    };

    load();
    const timer = setInterval(load, POLL_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [commit]);

  const update = useCallback((field, valueOrFn) => {
    const prev = stateRef.current;
    const value = typeof valueOrFn === 'function' ? valueOrFn(prev[field]) : valueOrFn;
    const next = { ...prev, [field]: value };
    commit(next);
    if (!SHARED_ENABLED) return;

    writeVersion.current += 1;
    const { upserts, deletes } = diffRows(stateToRows(prev), stateToRows(next));
    pending.current += 1;
    queue.current = queue.current
      .then(async () => {
        await upsertRows(upserts);
        for (const key of deletes) await deleteRow(key);
        setStatus('ok');
      })
      .catch(() => setStatus('error'))
      .finally(() => {
        pending.current -= 1;
        writeVersion.current += 1; // any poll that started before this finished is stale
      });
  }, [commit]);

  const setParticipants = useCallback((v) => update('participants', v), [update]);
  const setWishlists = useCallback((v) => update('wishlists', v), [update]);
  const setAvailability = useCallback((v) => update('availability', v), [update]);

  return {
    participants: state.participants,
    wishlists: state.wishlists,
    availability: state.availability,
    setParticipants,
    setWishlists,
    setAvailability,
    status,
  };
}
