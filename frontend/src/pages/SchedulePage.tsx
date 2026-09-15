import { useState } from 'react';
import { Clock, Plus, Trash2, MapPin } from 'lucide-react';
import { COLLECTIONS } from '../firebase';
import { useFirestoreCollection } from '../lib/useFirestoreCollection';

interface ScheduleItem {
  id: string;
  day: string;
  courseName: string;
  time: string;
  location: string;
  lecturer: string;
}

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'];

export function SchedulePage() {
  const { items: schedule, loading, add, remove } = useFirestoreCollection<ScheduleItem>(COLLECTIONS.schedule);
  const [day, setDay] = useState('ראשון');
  const [courseName, setCourseName] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [lecturer, setLecturer] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName || !time) return;

    try {
      await add({
        day,
        courseName,
        time,
        location,
        lecturer,
      });
      setCourseName('');
      setTime('');
      setLocation('');
      setLecturer('');
    } catch (error) {
      console.error('Error adding schedule item:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-stone-200/80 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="text-stone-700" size={20} />
          הוספת שיעור למערכת השעות
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">יום בשבוע</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">שם הקורס</label>
            <input
              type="text"
              required
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              placeholder="לדוגמה: מבני נתונים"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">שעות (לדוגמה: 10:00 - 12:00)</label>
            <input
              type="text"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              placeholder="10:00 - 12:00"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">מיקום / חדר</label>
            <div className="relative">
              <MapPin className="absolute right-3.5 top-3 text-stone-400" size={16} />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pr-10 pl-3 py-2 bg-stone-50/50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                placeholder="בניין 35, חדר 105"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-stone-600 mb-1">מרצה / מתרגל</label>
            <input
              type="text"
              value={lecturer}
              onChange={(e) => setLecturer(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              placeholder="שם המרצה"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-[#1D1D1F] text-white rounded-xl font-medium hover:bg-stone-800 transition cursor-pointer text-sm flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              הוסף למערכת השעות
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {DAYS.map((currentDay) => {
          const dayItems = schedule.filter((item) => item.day === currentDay);
          if (dayItems.length === 0) return null;

          return (
            <div key={currentDay} className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-stone-200/80 shadow-sm">
              <h3 className="text-lg font-medium mb-3 text-stone-800 border-b border-stone-100 pb-2">{currentDay}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dayItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-stone-50/60 border border-stone-200/60 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm text-stone-900 mb-1">{item.courseName}</h4>
                      <p className="text-xs text-stone-500 flex items-center gap-1 mb-1">
                        <Clock size={12} /> {item.time}
                      </p>
                      {item.location && (
                        <p className="text-xs text-stone-500 flex items-center gap-1">
                          <MapPin size={12} /> {item.location}
                        </p>
                      )}
                      {item.lecturer && <p className="text-xs text-stone-400 mt-1">מרצה: {item.lecturer}</p>}
                    </div>
                    <button
                      onClick={() => remove(item.id)}
                      className="p-2 text-stone-400 hover:text-red-600 transition cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {schedule.length === 0 && !loading && (
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-stone-200/80 shadow-sm text-center text-stone-400 text-sm">
            אין שיעורים במערכת כרגע.
          </div>
        )}
      </div>
    </div>
  );
}
