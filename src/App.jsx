// App.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import TemperatureChart from './TemperatureChart';
import AuthUI from './Auth';
import CycleCalendar from './CycleCalendar';

export default function App() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [temperature, setTemperature] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const currentSession = supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('entries').insert({
      user_id: user.id,
      date: new Date().toISOString().split('T')[0],
      temperature: parseFloat(temperature),
      test_result: testResult,
      note,
    });
    setSaving(false);
    if (error) alert('Ошибка при сохранении 😥');
    else {
      alert('Сохранено в Supabase 🎉');
      setTemperature('');
      setTestResult(null);
      setNote('');
      fetchEntries();
    }
  };

  const fetchEntries = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });
    if (!error) setEntries(data);
  };

  useEffect(() => {
    if (user) fetchEntries();
  }, [user]);

  if (!session) return <AuthUI />;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Ovulation Tracker</h1>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-sm text-indigo-600 hover:underline">
          Log out
        </button>
      </div>

      <div className="max-w-md mx-auto bg-white p-4 rounded shadow">
        <label className="block mb-2 font-semibold">Temperature (°C)</label>
        <input
          type="number"
          step="0.01"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
        />

        <label className="block mb-2 font-semibold">Ovulation Test</label>
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="test"
              value="negative"
              checked={testResult === 'negative'}
              onChange={(e) => setTestResult(e.target.value)}
            />
            ❌ Negative
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="test"
              value="positive"
              checked={testResult === 'positive'}
              onChange={(e) => setTestResult(e.target.value)}
            />
            ✅ Positive
          </label>
        </div>

        <label className="block mb-2 font-semibold">Notes</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
          placeholder="Any symptoms..."
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* Show Entries */}
      <div className="max-w-md mx-auto mt-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold mb-2">Recent Entries</h2>
        <ul className="text-sm text-gray-800 space-y-1">
          {entries.map((e) => (
            <li key={e.id} className="border-b py-1">
              📅 {e.date} — 🌡️ {e.temperature}°C — {e.test_result === 'positive' ? '✅' : '❌'}
              {e.note && <div className="text-gray-500 text-xs">✏️ {e.note}</div>}
            </li>
          ))}
        </ul>
      </div>

      {/* Chart */}
      <div className="max-w-md mx-auto mt-6 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold mb-2">Temperature Chart</h2>
        <TemperatureChart data={entries} />
      </div>
      <CycleCalendar user={user} />
    </div>
  );
}
