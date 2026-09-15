import { useState, useEffect, useMemo } from 'react';
import { BookOpen, Plus, Trash2, CheckCircle2, FileText, Edit3, X, TrendingUp } from 'lucide-react';
import { COLLECTIONS } from '../firebase';
import { migrateLocalArray } from '../lib/migrateLocal';
import { useFirestoreCollection } from '../lib/useFirestoreCollection';

interface LectureItem {
  id: string;
  type: 'הרצאה' | 'תרגול' | 'מעבדה';
  number: number;
  topic: string;
  watched: boolean;
}

interface AssignmentItem {
  id: string;
  title: string;
  weight: string;
  grade: string;
  status: 'לביצוע' | 'בעבודה' | 'הוגש' | 'נבדק';
  teamSize: string;
}

interface Course {
  id: string;
  name: string;
  lecturesCount: number;
  labsCount: number;
  practicumsCount: number;
  items: LectureItem[];
  assignments: AssignmentItem[];
}

export function AcademicHub() {
  const { items, save, remove } = useFirestoreCollection<Course>(COLLECTIONS.tasks);
  const courses = useMemo(
    () =>
      items.map((course) => ({
        ...course,
        items: course.items ?? [],
        assignments: course.assignments ?? [],
      })),
    [items],
  );
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newLecturesCount, setNewLecturesCount] = useState(5);
  const [newLabsCount, setNewLabsCount] = useState(3);
  const [newPracticumsCount, setNewPracticumsCount] = useState(0);

  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  const [assTitle, setAssTitle] = useState('');
  const [assWeight, setAssWeight] = useState('');
  const [assGrade, setAssGrade] = useState('');
  const [assStatus, setAssStatus] = useState<'לביצוע' | 'בעבודה' | 'הוגש' | 'נבדק'>('לביצוע');
  const [assTeamSize, setAssTeamSize] = useState('לבד');

  const [editingItem, setEditingItem] = useState<{ courseId: string; itemId: string; topic: string } | null>(null);

  useEffect(() => {
    void migrateLocalArray('academic-hub-courses-data', COLLECTIONS.tasks);
  }, []);

  useEffect(() => {
    if (!activeCourseId && courses.length > 0) {
      setActiveCourseId(courses[0].id);
    }
  }, [courses, activeCourseId]);

  const persistCourse = (course: Course) => {
    void save(course);
  };

  const addCourse = () => {
    if (!newCourseName.trim()) return;

    const items: LectureItem[] = [];
    for (let i = 1; i <= newLecturesCount; i++) {
      items.push({ id: crypto.randomUUID(), type: 'הרצאה', number: i, topic: '', watched: false });
    }
    for (let i = 1; i <= newLabsCount; i++) {
      items.push({ id: crypto.randomUUID(), type: 'תרגול', number: i, topic: '', watched: false });
    }
    for (let i = 1; i <= newPracticumsCount; i++) {
      items.push({ id: crypto.randomUUID(), type: 'מעבדה', number: i, topic: '', watched: false });
    }

    const newCourse: Course = {
      id: crypto.randomUUID(),
      name: newCourseName.trim(),
      lecturesCount: newLecturesCount,
      labsCount: newLabsCount,
      practicumsCount: newPracticumsCount,
      items,
      assignments: [],
    };

    persistCourse(newCourse);
    setActiveCourseId(newCourse.id);
    setNewCourseName('');
    setIsAddCourseOpen(false);
  };

  const deleteCourse = (courseId: string) => {
    void remove(courseId);
    if (activeCourseId === courseId) {
      const remaining = courses.filter((c) => c.id !== courseId);
      setActiveCourseId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const toggleWatched = (courseId: string, itemId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;
    persistCourse({
      ...course,
      items: course.items.map((it) => (it.id === itemId ? { ...it, watched: !it.watched } : it)),
    });
  };

  const saveTopic = () => {
    if (!editingItem) return;
    const course = courses.find((c) => c.id === editingItem.courseId);
    if (!course) return;
    persistCourse({
      ...course,
      items: course.items.map((it) => (it.id === editingItem.itemId ? { ...it, topic: editingItem.topic } : it)),
    });
    setEditingItem(null);
  };

  const addAssignment = (courseId: string) => {
    if (!assTitle.trim()) return;
    const newAss: AssignmentItem = {
      id: crypto.randomUUID(),
      title: assTitle.trim(),
      weight: assWeight.trim(),
      grade: assGrade.trim(),
      status: assStatus,
      teamSize: assTeamSize.trim(),
    };

    const course = courses.find((c) => c.id === courseId);
    if (!course) return;
    persistCourse({ ...course, assignments: [...course.assignments, newAss] });
    setAssTitle('');
    setAssWeight('');
    setAssGrade('');
    setAssStatus('לביצוע');
    setAssTeamSize('לבד');
    setIsAddAssignmentOpen(false);
  };

  const deleteAssignment = (courseId: string, assId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;
    persistCourse({
      ...course,
      assignments: course.assignments.filter((a) => a.id !== assId),
    });
  };

  const activeCourse = courses.find((c) => c.id === activeCourseId);

  // חישוב אחוזי צפייה לקורס הפעיל
  const totalItems = activeCourse ? activeCourse.items.length : 0;
  const watchedItems = activeCourse ? activeCourse.items.filter((i) => i.watched).length : 0;
  const progressPercent = totalItems > 0 ? Math.round((watchedItems / totalItems) * 100) : 0;

  // הפרדה ל-3 קטגוריות
  const lectures = activeCourse ? activeCourse.items.filter((i) => i.type === 'הרצאה') : [];
  const labs = activeCourse ? activeCourse.items.filter((i) => i.type === 'תרגול') : [];
  const practicums = activeCourse ? activeCourse.items.filter((i) => i.type === 'מעבדה') : [];

  return (
    <div dir="rtl" className="w-full max-w-6xl mx-auto bg-white rounded-2xl md:rounded-3xl shadow-sm border border-stone-100 p-4 md:p-8 font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-stone-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-indigo-600" />
            מרכז לימודים וקורסים
          </h1>
          <p className="text-stone-500 text-xs md:text-sm mt-1">ניהול מעקב הרצאות, תרגולים, מעבדות ועבודות לכל קורס בתואר.</p>
        </div>
        <button
          onClick={() => setIsAddCourseOpen(true)}
          className="flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-2xl font-medium hover:bg-stone-800 transition shadow-xs cursor-pointer text-sm"
        >
          <Plus size={18} />
          הוספת קורס חדש
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-stone-700 font-bold text-base">אין עדיין קורסים במערכת</h3>
          <p className="text-stone-400 text-xs mt-1 mb-4">הוסיפי את הקורס הראשון שלך כדי להתחיל לעקוב אחרי הרצאות ועבודות.</p>
          <button
            onClick={() => setIsAddCourseOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-indigo-700 transition cursor-pointer"
          >
            הוסף קורס ראשון
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {courses.map((c) => {
              const cTotal = c.items.length;
              const cWatched = c.items.filter((i) => i.watched).length;
              const cPerc = cTotal > 0 ? Math.round((cWatched / cTotal) * 100) : 0;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCourseId(c.id)}
                  className={`px-5 py-3 rounded-2xl font-medium text-sm transition whitespace-nowrap cursor-pointer flex items-center gap-3 ${
                    activeCourseId === c.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200/60'
                  }`}
                >
                  <span>{c.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeCourseId === c.id ? 'bg-indigo-500 text-white' : 'bg-stone-200 text-stone-700'}`}>
                    {cPerc}%
                  </span>
                </button>
              );
            })}
          </div>

          {activeCourse && (
            <div className="space-y-8 bg-stone-50/50 p-4 md:p-6 rounded-3xl border border-stone-200/60">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-200/80 pb-6">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-stone-900">{activeCourse.name}</h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {lectures.length} הרצאות · {labs.length} תרגולים · {practicums.length} מעבדות
                  </p>
                </div>

                {/* גרף התקדמות ויזואלי */}
                <div className="bg-white px-4 py-3 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center gap-4 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs font-bold text-stone-700">התקדמות בקורס:</span>
                  </div>
                  <div className="flex items-center gap-3 flex-1 md:flex-initial">
                    <div className="w-32 md:w-40 bg-stone-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full transition-all duration-500 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-indigo-600">{progressPercent}%</span>
                  </div>
                </div>

                <button
                  onClick={() => deleteCourse(activeCourse.id)}
                  className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition cursor-pointer border border-rose-200"
                >
                  <Trash2 size={14} />
                  מחק קורס
                </button>
              </div>

              {/* רשימת תצוגה: 1. הרצאות, 2. תרגולים, 3. מעבדות */}
              <div className="space-y-6">
                {/* קטגוריה א': הרצאות */}
                {lectures.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      הרצאות ({lectures.filter(i => i.watched).length}/{lectures.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {lectures.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-2xl border transition flex flex-col justify-between gap-2 ${
                            item.watched ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-stone-200/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                              הרצאה {item.number}
                            </span>
                            <button
                              onClick={() => toggleWatched(activeCourse.id, item.id)}
                              className={`p-1.5 rounded-xl transition cursor-pointer ${
                                item.watched ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-400 hover:text-stone-600'
                              }`}
                              title={item.watched ? 'סמן כטרם נצפה' : 'סמן שצפיתי'}
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100">
                            <span className="text-xs text-stone-700 font-medium truncate flex-1">
                              {item.topic ? `נושא: ${item.topic}` : <span className="text-stone-400 italic">לא הוגדר נושא שיעור</span>}
                            </span>
                            <button
                              onClick={() => setEditingItem({ courseId: activeCourse.id, itemId: item.id, topic: item.topic })}
                              className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-indigo-600 transition cursor-pointer shrink-0"
                            >
                              <Edit3 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* קטגוריה ב': תרגולים */}
                {labs.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      תרגולים ({labs.filter(i => i.watched).length}/{labs.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {labs.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-2xl border transition flex flex-col justify-between gap-2 ${
                            item.watched ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-stone-200/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                              תרגול {item.number}
                            </span>
                            <button
                              onClick={() => toggleWatched(activeCourse.id, item.id)}
                              className={`p-1.5 rounded-xl transition cursor-pointer ${
                                item.watched ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-400 hover:text-stone-600'
                              }`}
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100">
                            <span className="text-xs text-stone-700 font-medium truncate flex-1">
                              {item.topic ? `נושא: ${item.topic}` : <span className="text-stone-400 italic">לא הוגדר נושא תרגול</span>}
                            </span>
                            <button
                              onClick={() => setEditingItem({ courseId: activeCourse.id, itemId: item.id, topic: item.topic })}
                              className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-indigo-600 transition cursor-pointer shrink-0"
                            >
                              <Edit3 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* קטגוריה ג': מעבדות */}
                {practicums.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      מעבדות ({practicums.filter(i => i.watched).length}/{practicums.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {practicums.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-2xl border transition flex flex-col justify-between gap-2 ${
                            item.watched ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-stone-200/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                              מעבדה {item.number}
                            </span>
                            <button
                              onClick={() => toggleWatched(activeCourse.id, item.id)}
                              className={`p-1.5 rounded-xl transition cursor-pointer ${
                                item.watched ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-400 hover:text-stone-600'
                              }`}
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100">
                            <span className="text-xs text-stone-700 font-medium truncate flex-1">
                              {item.topic ? `נושא: ${item.topic}` : <span className="text-stone-400 italic">לא הוגדר נושא מעבדה</span>}
                            </span>
                            <button
                              onClick={() => setEditingItem({ courseId: activeCourse.id, itemId: item.id, topic: item.topic })}
                              className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-indigo-600 transition cursor-pointer shrink-0"
                            >
                              <Edit3 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ניהול עבודות */}
              <div className="space-y-4 pt-6 border-t border-stone-200/80">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    עבודות ומטלות בקורס
                  </h3>
                  <button
                    onClick={() => setIsAddAssignmentOpen(true)}
                    className="flex items-center gap-1.5 text-xs bg-indigo-600 text-white px-3.5 py-2 rounded-xl font-medium hover:bg-indigo-700 transition cursor-pointer shadow-xs"
                  >
                    <Plus size={14} />
                    הוספת עבודה
                  </button>
                </div>

                {activeCourse.assignments.length === 0 ? (
                  <div className="text-center py-6 bg-white rounded-2xl border border-stone-200/60 text-stone-400 text-xs">
                    אין עדיין עבודות רשומות לקורס זה.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeCourse.assignments.map((ass) => (
                      <div key={ass.id} className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col justify-between gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-stone-900 text-sm">{ass.title}</h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-stone-500 flex-wrap">
                              {ass.weight && <span className="bg-stone-100 px-2 py-0.5 rounded-md font-medium">משקל: {ass.weight}%</span>}
                              {ass.grade && <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-medium">ציון: {ass.grade}</span>}
                              <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-md font-medium">{ass.teamSize}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteAssignment(activeCourse.id, ass.id)}
                            className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-stone-50 transition cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                          <span className="text-stone-400">סטטוס:</span>
                          <span className={`px-2.5 py-1 rounded-full font-medium ${
                            ass.status === 'הוגש' || ass.status === 'נבדק' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ass.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* מודאל הוספת קורס */}
      {isAddCourseOpen && (
        <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={() => setIsAddCourseOpen(false)}>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 space-y-4 border border-stone-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-stone-900 text-base">הוספת קורס חדש</h3>
              <button onClick={() => setIsAddCourseOpen(false)} className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">שם הקורס</label>
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="למשל: אלגברה לינארית"
                  className="w-full text-sm border border-stone-200 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-stone-500 mb-1">הרצאות</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={newLecturesCount}
                    onChange={(e) => setNewLecturesCount(Number(e.target.value))}
                    className="w-full text-sm border border-stone-200 rounded-2xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-500 mb-1">תרגולים</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={newLabsCount}
                    onChange={(e) => setNewLabsCount(Number(e.target.value))}
                    className="w-full text-sm border border-stone-200 rounded-2xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-500 mb-1">מעבדות</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={newPracticumsCount}
                    onChange={(e) => setNewPracticumsCount(Number(e.target.value))}
                    className="w-full text-sm border border-stone-200 rounded-2xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={addCourse}
                disabled={!newCourseName.trim()}
                className="bg-stone-900 text-white text-sm font-medium px-5 py-2.5 rounded-2xl hover:bg-stone-800 transition disabled:opacity-30 cursor-pointer shadow-xs"
              >
                צור קורס
              </button>
            </div>
          </div>
        </div>
      )}

      {/* מודאל הוספת עבודה */}
      {isAddAssignmentOpen && activeCourse && (
        <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={() => setIsAddAssignmentOpen(false)}>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 space-y-4 border border-stone-100 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-stone-900 text-base">הוספת עבודה ל-{activeCourse.name}</h3>
              <button onClick={() => setIsAddAssignmentOpen(false)} className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">שם העבודה</label>
                <input
                  type="text"
                  value={assTitle}
                  onChange={(e) => setAssTitle(e.target.value)}
                  placeholder="למשל: תרגיל בית 1"
                  className="w-full text-sm border border-stone-200 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">אחוז מהציון (%)</label>
                  <input
                    type="text"
                    value={assWeight}
                    onChange={(e) => setAssWeight(e.target.value)}
                    placeholder="למשל: 15"
                    className="w-full text-sm border border-stone-200 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">ציון סופי (אם יש)</label>
                  <input
                    type="text"
                    value={assGrade}
                    onChange={(e) => setAssGrade(e.target.value)}
                    placeholder="למשל: 95"
                    className="w-full text-sm border border-stone-200 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">סטטוס עבודה</label>
                  <select
                    value={assStatus}
                    onChange={(e: any) => setAssStatus(e.target.value)}
                    className="w-full text-sm border border-stone-200 rounded-2xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="לביצוע">לביצוע</option>
                    <option value="בעבודה">בעבודה</option>
                    <option value="הוגש">הוגש</option>
                    <option value="נבדק">נבדק</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">הערת צוות (לבד/זוגות...)</label>
                  <input
                    type="text"
                    value={assTeamSize}
                    onChange={(e) => setAssTeamSize(e.target.value)}
                    placeholder="לבד / זוגות"
                    className="w-full text-sm border border-stone-200 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => addAssignment(activeCourse.id)}
                disabled={!assTitle.trim()}
                className="bg-stone-900 text-white text-sm font-medium px-5 py-2.5 rounded-2xl hover:bg-stone-800 transition disabled:opacity-30 cursor-pointer shadow-xs"
              >
                הוסף עבודה
              </button>
            </div>
          </div>
        </div>
      )}

      {/* מודאל עריכת נושא */}
      {editingItem && (
        <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={() => setEditingItem(null)}>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 space-y-4 border border-stone-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-stone-900 text-base">עריכת נושא שיעור</h3>
              <button onClick={() => setEditingItem(null)} className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">נושא (הרצאה / תרגול / מעבדה)</label>
              <input
                type="text"
                value={editingItem.topic}
                onChange={(e) => setEditingItem({ ...editingItem, topic: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && saveTopic()}
                placeholder="למשל: אלגוריתמי חיפוש"
                className="w-full text-sm border border-stone-200 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                autoFocus
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={saveTopic}
                className="bg-stone-900 text-white text-sm font-medium px-5 py-2.5 rounded-2xl hover:bg-stone-800 transition cursor-pointer shadow-xs"
              >
                שמור נושא
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}