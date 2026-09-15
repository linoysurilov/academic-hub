import { useState, useEffect, useMemo } from 'react';
import { CalendarDays, Plus, Trash2, Award, Clock, Calendar as CalendarIcon, X } from 'lucide-react';
import { COLLECTIONS } from '../firebase';
import { migrateLocalArray } from '../lib/migrateLocal';
import { useFirestoreCollection } from '../lib/useFirestoreCollection';

interface ExamItem {
  id: string;
  courseName: string;
  date: string;
  time: string;
  grade: string;
}

export function ExamsPage() {
  const { items, add, remove } = useFirestoreCollection<ExamItem>(COLLECTIONS.exams);
  const exams = useMemo(() => {
    return [...items].sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [items]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [courseName, setCourseName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('');
  const [examGrade, setExamGrade] = useState('');

  useEffect(() => {
    void migrateLocalArray('academic-hub-exams-data', COLLECTIONS.exams);
  }, []);

  const addExam = async () => {
    if (!courseName.trim()) return;

    await add({
      courseName: courseName.trim(),
      date: examDate.trim(),
      time: examTime.trim(),
      grade: examGrade.trim(),
    });

    setCourseName('');
    setExamDate('');
    setExamTime('');
    setExamGrade('');
    setIsModalOpen(false);
  };

  const deleteExam = (id: string) => {
    void remove(id);
  };

  return (
    <div dir="rtl" className="w-full max-w-6xl mx-auto bg-white rounded-2xl md:rounded-3xl shadow-sm border border-stone-100 p-4 md:p-8 font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-stone-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 md:w-7 md:h-7 text-indigo-600" />
            לוח מבחנים
          </h1>
          <p className="text-stone-500 text-xs md:text-sm mt-1">מעקב אחר כל מועדי המבחנים, השעות והציונים בתואר.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-2xl font-medium hover:bg-stone-800 transition shadow-xs cursor-pointer text-sm"
        >
          <Plus size={18} />
          הוספת מבחן חדש
        </button>
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
          <CalendarDays className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-stone-700 font-bold text-base">אין עדיין מבחנים ברשימה</h3>
          <p className="text-stone-400 text-xs mt-1 mb-4">הוסיפי את המבחן הראשון שלך כדי לעקוב אחרי התאריכים והציונים.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-indigo-700 transition cursor-pointer"
          >
            הוסף מבחן ראשון
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-stone-50/60 p-5 rounded-3xl border border-stone-200/80 shadow-2xs flex flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-stone-900 text-base">{exam.courseName}</h3>
                  <div className="flex items-center gap-2 mt-2 text-xs text-stone-600 flex-wrap">
                    <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-stone-200/60">
                      <CalendarIcon size={14} className="text-indigo-600" />
                      {exam.date ? exam.date : 'טרם נקבע תאריך'}
                    </span>
                    {exam.time && (
                      <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-stone-200/60">
                        <Clock size={14} className="text-amber-600" />
                        {exam.time}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteExam(exam.id)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-white transition cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-200/60 text-xs">
                <span className="text-stone-400 flex items-center gap-1">
                  <Award size={14} />
                  ציון מבחן:
                </span>
                <span className={`font-bold px-3 py-1 rounded-xl ${exam.grade ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200/70 text-stone-600'}`}>
                  {exam.grade ? `${exam.grade} נק'` : 'טרם פורסם'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* מודאל הוספת מבחן */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 space-y-4 border border-stone-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-stone-900 text-base">הוספת מבחן חדש</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">שם הקורס / מבחן (חובה)</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="למשל: מבני נתונים"
                  className="w-full text-sm border border-stone-200 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">תאריך (אופציונלי)</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full text-sm border border-stone-200 rounded-2xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">שעה (אופציונלי)</label>
                  <input
                    type="text"
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    placeholder="למשל: 09:00"
                    className="w-full text-sm border border-stone-200 rounded-2xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">ציון סופי (אופציונלי)</label>
                <input
                  type="text"
                  value={examGrade}
                  onChange={(e) => setExamGrade(e.target.value)}
                  placeholder="למשל: 92"
                  className="w-full text-sm border border-stone-200 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={addExam}
                disabled={!courseName.trim()}
                className="bg-stone-900 text-white text-sm font-medium px-5 py-2.5 rounded-2xl hover:bg-stone-800 transition disabled:opacity-30 cursor-pointer shadow-xs"
              >
                שמור מבחן
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}