// CycleCalendar.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import dayjs from 'dayjs';
import clsx from 'clsx';

const symptomsList = [
  { icon: '🤯', label: 'Headache' },
  { icon: '🤢', label: 'Nausea' },
  { icon: '⚡', label: 'Cramps' },
  { icon: '😡', label: 'Mood Swings' },
  { icon: '💧', label: 'Discharge' },
  { icon: '😴', label: 'Fatigue' },
  { icon: '🤒', label: 'Fever' },
];

export default function CycleCalendar({ user }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [month, setMonth] = useState(dayjs());
  const [symptomMap, setSymptomMap] = useState({});

  const daysInMonth = month.daysInMonth();
  const firstDay = month.startOf('month').day();

  useEffect(() => {
    const fetchSymptoms = async () => {
      const { data, error } = await supabase.from('symptoms').select('*').eq('user_id', user?.id);

      if (!error && data) {
        const map = {};
        data.forEach((entry) => {
          map[entry.date] = entry.symptom?.split(', ') || [];
        });
        setSymptomMap(map);
      }
    };
    if (user?.id) fetchSymptoms();
  }, [user, month]);

  const handleSave = async () => {
    if (!selectedDate || !user?.id) {
      alert('Missing selectedDate or user ID');
      return;
    }

    const { error, data } = await supabase.from('symptoms').upsert(
      {
        user_id: user.id,
        date: selectedDate,
        symptom: selectedSymptoms.join(', '),
      },
      {
        onConflict: ['user_id', 'date'],
      },
    );

    if (error) {
      console.error('❌ Supabase error:', error);
      alert('Supabase error: ' + error.message);
      return;
    }

    console.log('✅ Saved data:', data);

    setSymptomMap((prev) => ({
      ...prev,
      [selectedDate]: selectedSymptoms,
    }));
    setSelectedDate(null);
    setSelectedSymptoms([]);
  };

  const toggleSymptom = (s) => {
    setSelectedSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const renderDay = (i) => {
    const day = i - firstDay + 1;
    const isValid = day > 0 && day <= daysInMonth;
    const dateStr = month.date(day).format('YYYY-MM-DD');
    const symptoms = symptomMap[dateStr] || [];

    return (
      <div
        key={i}
        className="h-20 p-1 border rounded cursor-pointer hover:bg-blue-100"
        onClick={() => isValid && setSelectedDate(dateStr)}>
        {isValid && <div className="text-sm font-medium">{day}</div>}
        <div className="text-sm">
          {symptoms.map((s) => (
            <span key={s}>{symptomsList.find((e) => e.label === s)?.icon}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-center mb-4">Cycle Calendar</h2>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDay + daysInMonth }).map((_, i) => renderDay(i))}
      </div>

      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Symptoms for {selectedDate}</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {symptomsList.map((s) => (
                <button
                  key={s.label}
                  onClick={() => toggleSymptom(s.label)}
                  className={clsx(
                    'border rounded px-2 py-1 flex flex-col items-center text-sm',
                    selectedSymptoms.includes(s.label) ? 'bg-indigo-500 text-white' : 'bg-gray-100',
                  )}>
                  <span className="text-xl">{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setSelectedDate(null)}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
