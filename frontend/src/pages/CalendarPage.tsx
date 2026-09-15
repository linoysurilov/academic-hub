import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar as CalendarIcon, Plus, Trash2, Clock } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'exam' | 'submission' | 'personal' | 'study';
  description?: string;
}

const EVENT_COLORS = [
  { id: 'exam', label: 'מבחן', dot: 'bg-red-500', bg: 'bg-red-50/50', text: 'text-red-700', ring: 'ring-red-200' },
  { id: 'submission', label: 'הגשה', dot: 'bg-amber-500', bg: 'bg-amber-50/50', text: 'text-amber-700', ring: 'ring-amber-200' },
  { id: 'study', label: 'למידה', dot: 'bg-blue-500', bg: 'bg-blue-50/50', text: 'text-blue-700', ring: 'ring-blue-200' },
  { id: 'personal', label: 'אישי', dot: 'bg-emerald-500', bg: 'bg-emerald-50/50', text: 'text-emerald-700', ring: 'ring-emerald-200' },
];

export function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<'exam' | 'submission' | 'personal' | 'study'>('study');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'calendar_events'));
      const eventsList: CalendarEvent[] = [];
      querySnapshot.forEach((docSnap) => {
        eventsList.push({ id: docSnap.id, ...docSnap.data() } as CalendarEvent);
      });
      setEvents(eventsList);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    try {
      await addDoc(collection(db, 'calendar_events'), {
        title,
        date,
        time: time || '00:00',
        type,
        description,
      });
      setTitle('');
      setDate('');
      setTime('');
      setDescription('');
      fetchEvents();
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'calendar_events', id));
      setEvents(events.filter((ev) => ev.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-stone-200/80 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CalendarIcon className="text-stone-700" size={20} />
          לוח שנה ואירועים
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">כותרת האירוע</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              placeholder="לדוגמה: הגשת פרויקט ב-DB"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">סוג אירוע</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            >
              {EVENT_COLORS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">תאריך</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">שעה</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-stone-600 mb-1">תיאור (אופציונלי)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50/50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              placeholder="פרטים נוספים..."
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-[#1D1D1F] text-white rounded-xl font-medium hover:bg-stone-800 transition cursor-pointer text-sm flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              הוסף אירוע
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-stone-200/80 shadow-sm">
        <h3 className="text-lg font-medium mb-4">האירועים שלי</h3>
        {loading ? (
          <p className="text-stone-400 text-sm">טוען אירועים...</p>
        ) : sortedEvents.length === 0 ? (
          <p className="text-stone-400 text-sm">אין אירועים קרובים.</p>
        ) : (
          <div className="space-y-3">
            {sortedEvents.map((ev) => {
              const colorConfig = EVENT_COLORS.find((c) => c.id === ev.type) || EVENT_COLORS[2];
              return (
                <div key={ev.id} className={`p-4 rounded-2xl border border-stone-200/60 ${colorConfig.bg} flex items-center justify-between`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${colorConfig.dot}`} />
                      <h4 className="font-medium text-sm">{ev.title}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${colorConfig.text} bg-white/80 border border-stone-200/40`}>
                        {colorConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-stone-500">
                      <span>{ev.date}</span>
                      {ev.time && <span className="flex items-center gap-1"><Clock size={12} />{ev.time}</span>}
                    </div>
                    {ev.description && <p className="text-xs text-stone-600 mt-1">{ev.description}</p>}
                  </div>
                  <button
                    onClick={() => handleDelete(ev.id)}
                    className="p-2 text-stone-400 hover:text-red-600 transition cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}