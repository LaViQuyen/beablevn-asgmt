// src/pages/student/DoAssignment.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

// --- HỆ THỐNG SVG ICONS TỐI GIẢN ---
const SvgIcons = {
  Submit: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
  Wait: () => <svg width="48" height="48" fill="none" stroke="#003366" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  Check: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
  CheckBig: () => <svg width="48" height="48" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
  Passage: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  LogOut: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
  Info: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>,
  Lock: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
  Menu: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  Close: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  User: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  Refresh: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>,
  Quiz: () => <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  Book: () => <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>,
  Timer: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  Race: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>,
  Flip: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>,
  RaceRocket: () => <span style={{ fontSize: '24px', display: 'inline-block', lineHeight: 1 }}>🚀</span>,
  RaceUFO: () => <span style={{ fontSize: '24px', display: 'inline-block', lineHeight: 1 }}>🛸</span>,
  RaceCar: () => <span style={{ fontSize: '24px', display: 'inline-block', transform: 'scaleX(-1)', lineHeight: 1 }}>🏎️</span>,
  RaceBug: () => <span style={{ fontSize: '24px', display: 'inline-block', transform: 'scaleX(-1)', lineHeight: 1 }}>🐛</span>,
  RaceDino: () => <span style={{ fontSize: '24px', display: 'inline-block', transform: 'scaleX(-1)', lineHeight: 1 }}>🦖</span>,
  RaceHorse: () => <span style={{ fontSize: '24px', display: 'inline-block', transform: 'scaleX(-1)', lineHeight: 1 }}>🐎</span>
};

const TEAM_COLORS = [
  { name: 'Xanh dương', hex: '#3b82f6' }, { name: 'Hồng', hex: '#ec4899' },
  { name: 'Xanh lá', hex: '#10b981' }, { name: 'Vàng', hex: '#eab308' },
  { name: 'Cam', hex: '#f97316' }, { name: 'Tím', hex: '#a855f7' },
  { name: 'Đỏ', hex: '#ef4444' }, { name: 'Xám', hex: '#64748b' },
  { name: 'Nâu', hex: '#78350f' }, { name: 'Đen', hex: '#1e293b' }
];

export default function DoAssignment() {
  const { roomId } = useParams(); 
  const navigate = useNavigate();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const [view, setView] = useState('DASHBOARD'); // WAITING_START, DASHBOARD, QUIZ, ...
  const [waitingMsg, setWaitingMsg] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const studentId = localStorage.getItem('currentStudentId');

  const [roomData, setRoomData] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [shuffledQuiz, setShuffledQuiz] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  
  const [localAnswers, setLocalAnswers] = useState({});
  const [lockedQuestions, setLockedQuestions] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const sessionsRef = useRef([]);

  const [studentTeam, setStudentTeam] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [studentStartTime, setStudentStartTime] = useState(null);
  const autoSubmitFired = useRef(false);

  const localAnswersRef = useRef(localAnswers);
  useEffect(() => { localAnswersRef.current = localAnswers; }, [localAnswers]);
  const shuffledQuizRef = useRef(shuffledQuiz);
  useEffect(() => { shuffledQuizRef.current = shuffledQuiz; }, [shuffledQuiz]);

  const [vocabSet, setVocabSet] = useState(null);
  const [vocabCardIndex, setVocabCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnQ, setLearnQ] = useState(null); 
  const [learnStats, setLearnStats] = useState({ correct: 0, total: 0 });
  const [matchItems, setMatchItems] = useState([]); 
  const [matchSelected, setMatchSelected] = useState(null);
  const [matchStartTime, setMatchStartTime] = useState(null);

  const [showVerification, setShowVerification] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentStudentId');
    navigate('/student/login'); 
  };

  useEffect(() => {
    const roomRef = doc(db, "rooms", roomId);
    const unsubscribe = onSnapshot(roomRef, async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setRoomData(data);
        
        const activeSess = data.activeSession;
        if (activeSess && activeSess.status === 'active') {
          setSessionInfo(activeSess);
        } else {
          setSessionInfo(null); setShuffledQuiz(null); setStudentTeam(null);
        }

        if (data.assignedVocabId) {
          const vocabSnap = await getDoc(doc(db, "vocab_sets", data.assignedVocabId));
          if (vocabSnap.exists()) setVocabSet({ id: vocabSnap.id, ...vocabSnap.data() });
        } else {
          setVocabSet(null);
        }
      }
    });
    return () => unsubscribe();
  }, [roomId]); 

  // Lắng nghe thay đổi trực tiếp từ Quiz để đồng bộ hiển thị cho Học viên
  useEffect(() => {
    let unsubQuiz = () => {};
    if (sessionInfo) {
      let activeQuizId = null;
      if (sessionInfo.mode === 'Weekly') {
          activeQuizId = sessionInfo.activeDays[sessionInfo.currentDayIndex]?.quizId;
      } else {
          activeQuizId = sessionInfo.quizId;
      }

      if (activeQuizId) {
        unsubQuiz = onSnapshot(doc(db, "quizzes", activeQuizId), (snap) => {
          if (snap.exists()) setQuiz({ id: activeQuizId, ...snap.data() });
        });
      }
    } else {
      setQuiz(null);
    }
    return () => unsubQuiz();
  }, [sessionInfo?.quizId, sessionInfo?.currentDayIndex, sessionInfo?.mode]);

  // LOGIC KIỂM TRA KHUNG GIỜ WEEKLY
  useEffect(() => {
     if (sessionInfo?.mode === 'Weekly') {
         const currentDay = sessionInfo.activeDays[sessionInfo.currentDayIndex];
         if (!currentDay) return;
         
         const checkWeeklyTime = () => {
            const now = Date.now();
            const startMs = new Date(currentDay.startTime).getTime();
            const endMs = new Date(currentDay.endTime).getTime();

            if (now < startMs) {
                setView('WAITING_START');
                const timeString = new Date(startMs).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                const dateString = new Date(startMs).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                setWaitingMsg(`Bài tập ${currentDay.day} sẽ mở vào lúc ${timeString} ngày ${dateString}`);
            } else if (now > endMs) {
                setView('WAITING_START');
                setWaitingMsg("Đã hết hạn làm bài. Đang chờ hệ thống tự động cập nhật bài mới...");
            } else {
                if (view === 'WAITING_START') setView('DASHBOARD');
            }
         };
         
         checkWeeklyTime();
         const int = setInterval(checkWeeklyTime, 5000);
         return () => clearInterval(int);
     }
  }, [sessionInfo, view]);

  // RESET KHI CHUYỂN BÀI MỚI HOẶC NGÀY MỚI (WEEKLY)
  useEffect(() => {
    if (sessionInfo?.startTime) {
      setIsInitialized(false);
      setLocalAnswers({});
      setLockedQuestions({});
      setCurrentSessionId(null);
      setIsSubmitted(false);
      sessionsRef.current = [];
      autoSubmitFired.current = false;
      setStudentStartTime(null);
      if(sessionInfo.mode !== 'Weekly' && view === 'WAITING_START') setView('DASHBOARD');
    }
  }, [sessionInfo?.startTime, sessionInfo?.currentDayIndex]);

  // Logic map questions thông minh, giúp giữ thứ tự khi Giáo viên chỉ sửa nội dung
  useEffect(() => {
    if (!quiz || !sessionInfo) { setShuffledQuiz(null); return; }

    if (shuffledQuiz && shuffledQuiz.id === quiz.id) {
        if (shuffledQuiz.originalQuestionsLength === (quiz.questions || []).length) {
            // Chỉ đồng bộ lại texts/options, không xáo trộn lại để tránh học viên bị loạn khi đang làm bài
            const updatedQuestions = shuffledQuiz.questions.map(sq => {
                const freshQ = quiz.questions.find(q => q.id === sq.id);
                if (!freshQ) return sq;
                return { ...freshQ, displayOptions: sq.displayOptions || freshQ.options?.map((text, idx) => ({text, originalIndex: idx})) };
            });
            setShuffledQuiz(prev => ({ ...prev, ...quiz, questions: updatedQuestions }));
            return;
        }
    }

    const shuffleArray = (array) => {
      const newArr = [...array];
      for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
      }
      return newArr;
    };

    let processedQuestions = [...(quiz.questions || [])];

    processedQuestions = processedQuestions.map(q => {
      let displayOptions = (q.options || []).map((text, originalIndex) => ({ text, originalIndex }));
      if (sessionInfo?.settings?.shuffleAnswers && q.type === 'MCQ') {
        displayOptions = shuffleArray(displayOptions);
      }
      return { ...q, displayOptions };
    });

    if (sessionInfo?.settings?.shuffleQuestions) {
      const sections = quiz.sections && quiz.sections.length > 0 ? quiz.sections : [{ id: 'default' }];
      let finalQuestions = [];
      const validSectionIds = sections.map(s => s.id);
      
      sections.forEach(sec => {
        // Fallback mapping giúp hiển thị cả những câu hỏi mồ côi (tránh lỗi ẩn câu hỏi)
        let secQs = processedQuestions.filter(q => 
          q.sectionId === sec.id || 
          (!q.sectionId && sec.id === 'default') ||
          (!validSectionIds.includes(q.sectionId) && sec.id === sections[0].id)
        );
        secQs = shuffleArray(secQs);
        finalQuestions = finalQuestions.concat(secQs);
      });
      processedQuestions = finalQuestions;
    }

    setShuffledQuiz({ ...quiz, questions: processedQuestions, originalQuestionsLength: (quiz.questions || []).length });
  }, [quiz, sessionInfo]);

  useEffect(() => {
    if (!shuffledQuiz || !sessionInfo || isInitialized || view === 'WAITING_START') return;

    const initSession = async () => {
      const subRef = doc(db, `rooms/${roomId}/submissions`, studentId);
      const subSnap = await getDoc(subRef);
      let prevRaw = {};
      let existingSessions = [];
      let isSub = false;
      let existingTeam = null;

      if (subSnap.exists()) {
        const data = subSnap.data();
        isSub = !!data.submittedAt;
        existingSessions = data.sessions || [];
        existingTeam = data.team || null;

        if (!isSub) {
          if (sessionInfo.settings?.oneAttempt || sessionInfo.mode === 'Space Race' || sessionInfo.mode === 'Weekly') {
            prevRaw = data.rawAnswers || {};
            const locks = {};
            Object.keys(prevRaw).forEach(k => {
              const ans = prevRaw[k];
              if (Array.isArray(ans) && ans.length > 0) locks[k] = true;
              else if (typeof ans === 'object' && Object.keys(ans).length > 0) locks[k] = true;
              else if (typeof ans === 'string' && ans.trim() !== '') locks[k] = true;
            });
            setLockedQuestions(locks);
          } else { prevRaw = {}; }
        } else { prevRaw = data.rawAnswers || {}; }
      }

      if (!isSub) {
        const newSessionId = Date.now().toString();
        const newSession = { sessionId: newSessionId, loginTime: new Date().toISOString(), exitTime: new Date().toISOString(), completedCount: Object.keys(prevRaw).length, score: 0 };
        existingSessions.push(newSession);
        setCurrentSessionId(newSessionId);
        sessionsRef.current = existingSessions;

        await setDoc(subRef, { studentId, studentName: studentId, rawAnswers: prevRaw, answers: {}, sessions: existingSessions, lastUpdated: new Date().toISOString() }, { merge: true });
      }
      
      if (existingSessions.length > 0) {
        setStudentStartTime(existingSessions[0].loginTime);
      }

      setLocalAnswers(prevRaw); 
      setStudentTeam(existingTeam); 
      setIsSubmitted(isSub); 
      setIsInitialized(true);
    };

    initSession();
  }, [shuffledQuiz, sessionInfo, isInitialized, roomId, studentId, view]);

  // --- LOGIC TIMER (ÁP DỤNG CHO NORMAL VÀ WEEKLY) ---
  useEffect(() => {
    let activeTimeLimit = null;
    let endMsCutoff = Infinity;

    if (sessionInfo?.mode === 'Weekly') {
       const currentDay = sessionInfo.activeDays[sessionInfo.currentDayIndex];
       if (currentDay) {
           activeTimeLimit = currentDay.timer;
           endMsCutoff = new Date(currentDay.endTime).getTime();
       }
    } else {
       activeTimeLimit = sessionInfo?.settings?.timeLimit;
    }

    if (!studentStartTime || isSubmitted || view !== 'QUIZ') {
      setTimeLeft(null);
      return;
    }

    const startMs = new Date(studentStartTime).getTime();
    let deadlineMs = activeTimeLimit ? (startMs + activeTimeLimit * 60000) : endMsCutoff;
    if (activeTimeLimit) deadlineMs = Math.min(deadlineMs, endMsCutoff);

    if (deadlineMs === Infinity) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, deadlineMs - now);
      setTimeLeft(remaining);

      if (remaining <= 0 && !autoSubmitFired.current) {
        clearInterval(interval);
        autoSubmitFired.current = true;
        alert("Đã hết thời gian làm bài! Hệ thống sẽ tự động thu bài của bạn.");
        submitQuizData();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionInfo, isSubmitted, view, studentStartTime]);

  const evaluateAnswer = (question, studentAnswer) => {
    if (!studentAnswer) return false;
    const ans = String(studentAnswer).trim().toLowerCase();
    if (question.type === 'MCQ') return ans === (question.correctOptions || []).sort().map(i => String.fromCharCode(65 + i)).join(', ').toLowerCase();
    if (['EVALUATION', 'MATCHING'].includes(question.type)) return ans === String(question.correctOption || question.correctMatch || '').trim().toLowerCase();
    if (question.type === 'SAQ') {
       const delimiter = (question.correctText || '').includes('|||') ? '|||' : ',';
       return (question.correctText || '').split(delimiter).map(s => s.trim().toLowerCase()).includes(ans);
    }
    if (question.type.startsWith('GAP_FILL')) {
       let allCorrect = true;
       const items = question.type === 'GAP_FILL_PARAGRAPH' ? question.gaps : question.labels;
       if (!items || items.length === 0) return false;
       items.forEach(item => {
         const correctAnsArray = (item.answerString || '').split(',').map(s => s.trim().toLowerCase());
         const match = studentAnswer.match(new RegExp(`\\[${item.id}\\]:\\s*([^|]+)`));
         if (match && !correctAnsArray.includes(match[1].trim().toLowerCase())) allCorrect = false;
         else if (!match) allCorrect = false;
       });
       return allCorrect;
    }
    return false;
  };

  const getCorrectAnswerDisplayForStudent = (q) => {
    if (q.type === 'MCQ') {
       if(!q.displayOptions) return '';
       const correctLetters = [];
       q.displayOptions.forEach((opt, index) => {
          if ((q.correctOptions || []).includes(opt.originalIndex)) {
             correctLetters.push(String.fromCharCode(65 + index));
          }
       });
       return correctLetters.join(', ');
    }
    if (['EVALUATION', 'MATCHING'].includes(q.type)) return q.correctOption || q.correctMatch || '';
    if (q.type === 'SAQ') {
      const delimiter = (q.correctText || '').includes('|||') ? '|||' : ',';
      return (q.correctText || '').split(delimiter).join(' hoặc ');
    }
    if (q.type.startsWith('GAP_FILL')) {
      const items = q.type === 'GAP_FILL_PARAGRAPH' ? q.gaps : q.labels;
      if (!items || items.length === 0) return '';
      return items.map(item => `[${item.id}]: ${item.answerString}`).join(' | ');
    }
    return '';
  };

  const handleSimpleAnswer = (qId, value) => { if (!lockedQuestions[qId]) setLocalAnswers(prev => ({ ...prev, [qId]: value })); };
  const handleToggleMCQ = (qId, originalIdx) => {
    if (lockedQuestions[qId]) return;
    setLocalAnswers(prev => {
      const current = prev[qId] || [];
      return current.includes(originalIdx) ? { ...prev, [qId]: current.filter(i => i !== originalIdx) } : { ...prev, [qId]: [...current, originalIdx].sort((a, b) => a - b) };
    });
  };
  const handleGapFillChange = (qId, gapId, value) => { if (!lockedQuestions[qId]) setLocalAnswers(prev => ({ ...prev, [qId]: { ...(prev[qId] || {}), [gapId]: value } })); };
  
  const handleLockQuestion = (qId) => {
    if (!localAnswers[qId] || (Array.isArray(localAnswers[qId]) && localAnswers[qId].length === 0) || (typeof localAnswers[qId] === 'object' && !Array.isArray(localAnswers[qId]) && Object.keys(localAnswers[qId]).length === 0)) {
      return alert("Vui lòng chọn hoặc nhập đáp án trước khi chốt!");
    }
    setLockedQuestions(prev => ({ ...prev, [qId]: true }));
  };

  useEffect(() => {
    if (!shuffledQuiz || !isInitialized || !currentSessionId || isSubmitted || view !== 'QUIZ') return;

    const syncAnswers = async () => {
      const formattedAnswers = {};
      let completedCount = 0;

      shuffledQuiz.questions.forEach(q => {
        const ans = localAnswers[q.id];
        if (ans === undefined || ans === null) return;
        let isEmpty = true;
        if (q.type === 'MCQ') {
          formattedAnswers[q.id] = ans.map(i => String.fromCharCode(65 + i)).join(', ');
          if (ans.length > 0) isEmpty = false;
        } else if (q.type === 'GAP_FILL_PARAGRAPH' || q.type === 'GAP_FILL_DIAGRAM') {
          const parts = [];
          Object.keys(ans).sort((a,b)=>parseInt(a)-parseInt(b)).forEach(k => {
             if (ans[k] && ans[k].trim() !== '') isEmpty = false;
             parts.push(`[${k}]: ${ans[k]}`);
          });
          formattedAnswers[q.id] = parts.join(' | ');
        } else {
          formattedAnswers[q.id] = ans;
          if (ans.trim() !== '') isEmpty = false;
        }
        if (!isEmpty) completedCount++;
      });

      let correctCount = 0;
      shuffledQuiz.questions.forEach(q => { if (evaluateAnswer(q, formattedAnswers[q.id])) correctCount++; });
      const currentScore = Math.round((correctCount / shuffledQuiz.questions.length) * 100) || 0;

      const updatedSessions = [...sessionsRef.current];
      const idx = updatedSessions.findIndex(s => s.sessionId === currentSessionId);
      if (idx >= 0) { 
        updatedSessions[idx].exitTime = new Date().toISOString(); 
        updatedSessions[idx].completedCount = completedCount; 
        updatedSessions[idx].score = currentScore; 
      }
      sessionsRef.current = updatedSessions; 

      try {
        await setDoc(doc(db, `rooms/${roomId}/submissions`, studentId), { 
          studentId, studentName: studentId, rawAnswers: localAnswers, answers: formattedAnswers, 
          sessions: updatedSessions, lastUpdated: new Date().toISOString(),
          team: studentTeam || null 
        }, { merge: true });
      } catch (error) { console.error(error); }
    };
    const timeoutId = setTimeout(() => { syncAnswers(); }, 800); 
    return () => clearTimeout(timeoutId);
  }, [localAnswers, shuffledQuiz, isInitialized, currentSessionId, isSubmitted, roomId, studentId, view, studentTeam]);

  const submitQuizData = async () => {
    const formattedAnswers = {};
    const currentQuiz = shuffledQuizRef.current;
    const currentAnswers = localAnswersRef.current;
    
    let correctCount = 0;
    let completedCount = 0;

    if (currentQuiz && currentQuiz.questions) {
      currentQuiz.questions.forEach(q => {
        const ans = currentAnswers[q.id];
        if (ans === undefined || ans === null) { formattedAnswers[q.id] = ''; return; }
        let isEmpty = true;
        
        if (q.type === 'MCQ') {
          formattedAnswers[q.id] = ans.map(i => String.fromCharCode(65 + i)).join(', ');
          if(ans.length > 0) isEmpty = false;
        }
        else if (q.type === 'GAP_FILL_PARAGRAPH' || q.type === 'GAP_FILL_DIAGRAM') {
          const parts = []; 
          Object.keys(ans).sort((a,b)=>parseInt(a)-parseInt(b)).forEach(k => {
            if(ans[k] && String(ans[k]).trim() !== '') isEmpty = false;
            parts.push(`[${k}]: ${ans[k]}`);
          });
          formattedAnswers[q.id] = parts.join(' | ');
        } else { 
          formattedAnswers[q.id] = ans; 
          if(String(ans).trim() !== '') isEmpty = false;
        }
        
        if (!isEmpty) completedCount++;
        if (evaluateAnswer(q, formattedAnswers[q.id])) correctCount++;
      });
    }

    const finalScore = currentQuiz && currentQuiz.questions.length > 0
      ? Math.round((correctCount / currentQuiz.questions.length) * 100)
      : 0;

    const updatedSessions = [...sessionsRef.current];
    const idx = updatedSessions.findIndex(s => s.sessionId === currentSessionId);
    if (idx >= 0) {
      updatedSessions[idx].exitTime = new Date().toISOString();
      updatedSessions[idx].completedCount = completedCount;
      updatedSessions[idx].score = finalScore;
    }

    try {
      await setDoc(doc(db, `rooms/${roomId}/submissions`, studentId), { 
        studentId, 
        studentName: studentId, 
        rawAnswers: currentAnswers,
        answers: formattedAnswers, 
        sessions: updatedSessions,
        submittedAt: new Date().toISOString(), 
        score: finalScore,
        team: studentTeam || null
      }, { merge: true });
      setIsSubmitted(true);
    } catch (error) { 
      console.error(error);
      alert("Lỗi nộp bài. Vui lòng kiểm tra lại kết nối mạng!"); 
    }
  };

  const handleQuizSubmit = async () => {
    // ---> THÊM CHECK OFFLINE VÀO ĐÂY <---
    if (isOffline) {
      alert("Bạn đang mất kết nối mạng! Vui lòng chờ có mạng lại để nộp bài nhé.");
      return; 
    }

    if (!window.confirm("Bạn có chắc chắn muốn nộp bài không?")) return;
    await submitQuizData();
  };

  const saveVocabReport = async (updateData) => {
    try {
      const ref = doc(db, `rooms/${roomId}/vocab_submissions`, studentId);
      await setDoc(ref, { lastActive: new Date().toISOString(), ...updateData }, { merge: true });
    } catch (err) { console.log(err); }
  };

  const initLearnMode = () => {
    if (!vocabSet || vocabSet.cards.length === 0) return;
    const cards = [...vocabSet.cards].sort(() => 0.5 - Math.random());
    const target = cards[0];
    let opts = [target.term];
    while(opts.length < 4 && opts.length < vocabSet.cards.length) {
      const randTerm = vocabSet.cards[Math.floor(Math.random() * vocabSet.cards.length)].term;
      if(!opts.includes(randTerm)) opts.push(randTerm);
    }
    opts.sort(() => 0.5 - Math.random());
    setLearnQ({ card: target, options: opts });
  };

  const handleLearnAnswer = (selectedTerm) => {
    const isCorrect = selectedTerm === learnQ.card.term;
    const newStats = { correct: learnStats.correct + (isCorrect ? 1 : 0), total: learnStats.total + 1 };
    setLearnStats(newStats);
    saveVocabReport({ learnCorrect: newStats.correct, learnTotal: newStats.total });
    if(isCorrect) {
      setTimeout(() => initLearnMode(), 800);
    } else {
      alert(`Sai rồi! Đáp án đúng là: ${learnQ.card.term}`);
      initLearnMode();
    }
  };

  const initMatchMode = () => {
    if (!vocabSet) return;
    const pairs = vocabSet.cards.slice(0, 6); 
    let items = [];
    pairs.forEach(c => {
      items.push({ id: `t_${c.id}`, text: c.term, type: 'term', cardId: c.id, matched: false });
      items.push({ id: `d_${c.id}`, text: c.definition, type: 'def', cardId: c.id, matched: false });
    });
    setMatchItems(items.sort(() => 0.5 - Math.random()));
    setMatchSelected(null);
    setMatchStartTime(Date.now());
  };

  const handleMatchClick = (item) => {
    if (item.matched) return;
    if (!matchSelected) { setMatchSelected(item); return; }
    if (matchSelected.id === item.id) { setMatchSelected(null); return; }

    if (matchSelected.cardId === item.cardId && matchSelected.type !== item.type) {
      const newItems = matchItems.map(i => i.cardId === item.cardId ? { ...i, matched: true } : i);
      setMatchItems(newItems);
      setMatchSelected(null);
      
      if (newItems.every(i => i.matched)) {
        const timeTaken = Math.round((Date.now() - matchStartTime) / 1000);
        alert(`Hoàn thành trong ${timeTaken} giây!`);
        saveVocabReport({ bestMatchTime: timeTaken }); 
      }
    } else {
      setMatchSelected(null);
    }
  };

  const formatTimeLeft = (ms) => {
    if (ms === null || ms < 0) return '00:00';
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const s = (totalSecs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ==========================================
  // RENDERS
  // ==========================================

  const appHeader = (titleText, showBack = false, backAction = null) => (
    <header style={{ backgroundColor: studentTeam ? `${studentTeam}15` : 'white', padding: isMobile ? '12px 20px' : '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', transition: 'background 0.3s' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', overflow: 'hidden', flex: 1 }}>
        {showBack && (
          <button onClick={backAction} style={{ background: 'none', border: 'none', cursor: 'pointer', color: studentTeam || '#003366', display: 'flex', padding: 0 }}><SvgIcons.Close /></button>
        )}
        <img src="/BA LOGO.png" alt="BA Logo" style={{ height: '32px', objectFit: 'contain', flexShrink: 0 }} />
        {!isMobile && <h1 style={{ fontSize: '22px', margin: 0, fontWeight: '800', color: studentTeam || '#003366', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{titleText}</h1>}
      </div>

      {view === 'QUIZ' && timeLeft !== null && !isSubmitted && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
           <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '6px 16px', borderRadius: '100px', fontWeight: '800', fontSize: isMobile ? '15px' : '18px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #fca5a5' }}>
              <SvgIcons.Timer /> {formatTimeLeft(timeLeft)}
           </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button onClick={() => setShowMenu(!showMenu)} style={{ background: 'none', border: 'none', color: studentTeam || '#003366', cursor: 'pointer', display: 'flex', padding: '8px' }}>
            <SvgIcons.Menu />
          </button>

          {showMenu && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', width: '220px', zIndex: 100, overflow: 'hidden' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: '#94a3b8', display: 'flex' }}><SvgIcons.User /></div>
                <span style={{ fontWeight: '700', color: '#003366', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{studentId}</span>
              </div>
              <button onClick={() => { setShowMenu(false); window.location.reload(); }} style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', color: '#334155', fontSize: '14px', fontWeight: '600', textAlign: 'left', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <span style={{ color: '#64748b', display: 'flex' }}><SvgIcons.Refresh /></span> Refresh
              </button>
              <button onClick={handleLogout} style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '14px', fontWeight: '600', textAlign: 'left', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <span style={{ color: '#ef4444', display: 'flex' }}><SvgIcons.LogOut /></span> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );

  const verificationModal = showVerification && (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 99999, paddingTop: '10vh', paddingLeft: '15px', paddingRight: '15px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ margin: 0, color: '#64748b', fontSize: '18px', fontWeight: '500' }}>Login Verification</h2>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}><SvgIcons.Close /></button>
        </div>
        <div style={{ padding: '24px 20px' }}>
          <p style={{ fontSize: '16px', color: '#334155', margin: '0 0 24px 0' }}>Are you <span style={{fontWeight: '700', color: '#003366'}}>{studentId}</span>?</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowVerification(false)} style={{ flex: 1, backgroundColor: '#003366', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 2px 4px rgba(0,51,102,0.2)', transition: 'background 0.2s' }}>YES</button>
            <button onClick={handleLogout} style={{ flex: 1, backgroundColor: 'white', color: '#003366', border: '1px solid #003366', padding: '12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s' }}>NO</button>
          </div>
        </div>
      </div>
    </div>
  );

  // MÀN HÌNH CHỜ WEEKLY PENDING
  if (view === 'WAITING_START') {
    return (
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {verificationModal} {appHeader(roomId)}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
          <div style={{ marginBottom: '24px', animation: 'pulse 2s infinite' }}><SvgIcons.Wait /></div>
          <h2 style={{ fontWeight: '800', margin: '0 0 12px 0', fontSize: '22px', color: '#003366' }}>{waitingMsg}</h2>
        </div>
      </div>
    );
  }

  // MÀN HÌNH CHỌN ĐỘI THI ĐUA (SPACE RACE)
  if (!showVerification && sessionInfo?.mode === 'Space Race' && !studentTeam && view === 'DASHBOARD') {
    const numTeams = sessionInfo.settings?.teamCount || 2;
    const teams = TEAM_COLORS.slice(0, numTeams);
    const raceIcon = sessionInfo.settings?.raceIcon || 'Rocket';
    
    return (
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Josefin Sans', sans-serif" }}>
        {appHeader('Space Race')}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', maxWidth: '600px', width: '100%', textAlign: 'center' }}>
            <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>
              {raceIcon === 'Rocket' && <SvgIcons.RaceRocket />}
              {raceIcon === 'UFO' && <SvgIcons.RaceUFO />}
              {raceIcon === 'Car' && <SvgIcons.RaceCar />}
              {raceIcon === 'Bug' && <SvgIcons.RaceBug />}
              {raceIcon === 'Dino' && <SvgIcons.RaceDino />}
              {raceIcon === 'Horse' && <SvgIcons.RaceHorse />}
            </div>
            <h2 style={{ color: '#003366', fontSize: '28px', fontWeight: '800', marginBottom: '10px' }}>Chọn đội của bạn!</h2>
            <p style={{ color: '#64748b', marginBottom: '40px', fontSize: '16px' }}>Hãy chọn màu đại diện cho đội của bạn để bắt đầu cuộc đua.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
              {teams.map(t => (
                <button 
                  key={t.name}
                  onClick={() => { setStudentTeam(t.hex); setView('QUIZ'); }}
                  style={{ backgroundColor: t.hex, color: 'white', padding: '20px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '16px', boxShadow: `0 4px 10px ${t.hex}66`, transition: 'transform 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  ĐỘI {t.name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'DASHBOARD') {
    if (!quiz && !vocabSet) {
      return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {verificationModal} {appHeader(roomId)}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ marginBottom: '24px', animation: 'pulse 2s infinite' }}><SvgIcons.Wait /></div>
            <h2 style={{ fontWeight: '800', margin: '0 0 12px 0', textAlign: 'center', fontSize: '22px', color: '#003366' }}>Đang chờ giáo viên phát bài...</h2>
          </div>
        </div>
      );
    }

    let displayTitle = shuffledQuiz?.title || quiz?.title;
    if (sessionInfo?.mode === 'Weekly') {
        const d = sessionInfo.activeDays[sessionInfo.currentDayIndex];
        if (d) displayTitle = `${d.day}: ${d.quizTitle}`;
    }

    return (
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Josefin Sans', sans-serif" }}>
        {verificationModal} {appHeader(`Hello, ${studentId}`)}
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', width: '100%', boxSizing: 'border-box' }}>
          <h2 style={{ color: '#003366', textAlign: 'center', marginBottom: '40px', fontSize: '26px', fontWeight: '800' }}>Hôm nay bạn muốn học gì?</h2>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px', justifyContent: 'center' }}>
            
            {vocabSet && (
              <button onClick={() => setView('VOCAB_HOME')} style={{ flex: 1, backgroundColor: 'white', border: '2px solid #0ea5e9', borderRadius: '20px', padding: '40px 20px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 15px -3px rgba(14,165,233,0.1)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ color: '#0ea5e9', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}><SvgIcons.Book /></div>
                <h3 style={{ margin: 0, color: '#003366', fontSize: '22px', fontWeight: '800' }}>Ôn Từ Vựng</h3>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '10px' }}>{vocabSet.title}</p>
              </button>
            )}

            {quiz && (
              <button onClick={() => setView('QUIZ')} style={{ flex: 1, backgroundColor: 'white', border: '2px solid #e67e22', borderRadius: '20px', padding: '40px 20px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 15px -3px rgba(230,126,34,0.1)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ color: '#e67e22', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}><SvgIcons.Quiz /></div>
                <h3 style={{ margin: 0, color: '#003366', fontSize: '22px', fontWeight: '800' }}>Làm bài kiểm tra</h3>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '10px' }}>{displayTitle}</p>
              </button>
            )}

          </div>
        </div>
      </div>
    );
  }

  if (view.startsWith('VOCAB')) {
    if (view === 'VOCAB_HOME') {
      return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Josefin Sans', sans-serif" }}>
          {appHeader('Vocabulary', true, () => setView('DASHBOARD'))}
          <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', width: '100%', boxSizing: 'border-box', textAlign: 'center' }}>
            <h2 style={{ color: '#003366', fontSize: '28px', fontWeight: '800', marginBottom: '10px' }}>{vocabSet.title}</h2>
            <p style={{ color: '#64748b', marginBottom: '40px', fontWeight: '600' }}>{vocabSet?.cards?.length || 0} terms</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button onClick={() => setView('VOCAB_FLASHCARDS')} style={{ padding: '20px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '16px', fontSize: '18px', fontWeight: '700', color: '#003366', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#003366'} onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}>Flashcards</button>
              <button onClick={() => { initLearnMode(); setView('VOCAB_LEARN'); }} style={{ padding: '20px', backgroundColor: '#003366', border: 'none', borderRadius: '16px', fontSize: '18px', fontWeight: '700', color: 'white', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,51,102,0.2)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#002244'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#003366'}>Learn Mode</button>
              <button onClick={() => { initMatchMode(); setView('VOCAB_MATCH'); }} style={{ padding: '20px', backgroundColor: 'white', border: '2px solid #003366', borderRadius: '16px', fontSize: '18px', fontWeight: '700', color: '#003366', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f0f9ff'; }} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>Match Mode</button>
            </div>
          </div>
        </div>
      );
    }

    if (view === 'VOCAB_FLASHCARDS') {
      if (!vocabSet || !vocabSet.cards || vocabSet.cards.length === 0) {
        return (
          <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Josefin Sans', sans-serif" }}>
            {appHeader('Vocabulary', true, () => setView('VOCAB_HOME'))}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#94a3b8', fontSize: '16px' }}>Bộ thẻ này chưa có từ vựng nào.</p>
            </div>
          </div>
        );
      }

      const validIndex = Math.min(Math.max(0, vocabCardIndex), vocabSet.cards.length - 1);
      const card = vocabSet.cards[validIndex] || {};

      return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Josefin Sans', sans-serif" }}>
          {appHeader(`${validIndex + 1} / ${vocabSet.cards.length}`, true, () => setView('VOCAB_HOME'))}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              style={{ width: '100%', maxWidth: '600px', height: '400px', perspective: '1000px', cursor: 'pointer' }}
            >
              <div style={{ width: '100%', height: '100%', position: 'relative', transition: 'transform 0.6s', transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)' }}>
                {/* Front */}
                <div style={{ width: '100%', height: '100%', position: 'absolute', backfaceVisibility: 'hidden', backgroundColor: 'white', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                  <h2 style={{ fontSize: '40px', color: '#003366', fontWeight: '800', textAlign: 'center', padding: '20px' }}>{card.term || 'No Term'}</h2>
                  <div style={{ position: 'absolute', bottom: '20px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600' }}><SvgIcons.Flip /> Click to flip</div>
                </div>
                {/* Back */}
                <div style={{ width: '100%', height: '100%', position: 'absolute', backfaceVisibility: 'hidden', backgroundColor: '#003366', color: 'white', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', boxSizing: 'border-box', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', transform: 'rotateX(180deg)' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px', textAlign: 'center' }}>{card.definition || 'No Definition'}</h3>
                  {card.imageUrl && (
                    <img 
                      src={card.imageUrl} 
                      alt="Vocab illustration" 
                      style={{ maxHeight: '140px', maxWidth: '100%', objectFit: 'contain', borderRadius: '12px', marginBottom: '20px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '5px' }} 
                    />
                  )}
                  {card.example && <p style={{ fontSize: '16px', color: '#cbd5e1', textAlign: 'center', fontStyle: 'italic', lineHeight: '1.6' }}>"{card.example}"</p>}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
              <button onClick={() => { setVocabCardIndex(Math.max(0, validIndex - 1)); setIsFlipped(false); }} disabled={validIndex === 0} style={{ padding: '16px 32px', borderRadius: '100px', border: '1px solid #cbd5e1', background: 'white', color: '#003366', fontWeight: '700', cursor: validIndex === 0 ? 'not-allowed' : 'pointer', opacity: validIndex === 0 ? 0.5 : 1 }}>Prev</button>
              <button onClick={() => { setVocabCardIndex(Math.min(vocabSet.cards.length - 1, validIndex + 1)); setIsFlipped(false); }} disabled={validIndex === vocabSet.cards.length - 1} style={{ padding: '16px 32px', borderRadius: '100px', border: 'none', background: '#003366', color: 'white', fontWeight: '700', cursor: validIndex === vocabSet.cards.length - 1 ? 'not-allowed' : 'pointer', opacity: validIndex === vocabSet.cards.length - 1 ? 0.5 : 1 }}>Next</button>
            </div>
          </div>
        </div>
      );
    }

    if (view === 'VOCAB_LEARN') {
      if(!learnQ || !learnQ.card) return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Josefin Sans', sans-serif" }}>
          {appHeader(`Learn Mode`, true, () => setView('VOCAB_HOME'))}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: '16px' }}>Đang tải hoặc chưa đủ từ vựng để học...</p>
          </div>
        </div>
      );

      return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Josefin Sans', sans-serif" }}>
          {appHeader(`Learn Mode (${learnStats.correct}/${learnStats.total})`, true, () => setView('VOCAB_HOME'))}
          <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 20px', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ color: '#64748b', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>Definition</h3>
              <p style={{ color: '#003366', fontSize: '24px', fontWeight: '700', margin: 0 }}>{learnQ.card.definition}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
              {learnQ.options.map(opt => (
                <button key={opt} onClick={() => handleLearnAnswer(opt)} style={{ padding: '24px', backgroundColor: 'white', border: '2px solid #cbd5e1', borderRadius: '16px', fontSize: '18px', fontWeight: '700', color: '#334155', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#003366'} onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (view === 'VOCAB_MATCH') {
      return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Josefin Sans', sans-serif" }}>
          {appHeader(`Match Mode`, true, () => setView('VOCAB_HOME'))}
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', width: '100%', boxSizing: 'border-box' }}>
            {matchItems.length > 0 && matchItems.every(i => i.matched) ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#15803d', fontSize: '32px', fontWeight: '800' }}>Tuyệt vời!</h2>
                <button onClick={initMatchMode} style={{ marginTop: '20px', padding: '16px 40px', backgroundColor: '#003366', color: 'white', border: 'none', borderRadius: '100px', fontWeight: '700', fontSize: '18px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>Chơi lại</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
                {matchItems.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => handleMatchClick(item)}
                    style={{ 
                      padding: '24px', backgroundColor: 'white', borderRadius: '16px', cursor: item.matched ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '100px',
                      border: matchSelected?.id === item.id ? '3px solid #0ea5e9' : '1px solid #cbd5e1',
                      opacity: item.matched ? 0 : 1, pointerEvents: item.matched ? 'none' : 'auto',
                      transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                      fontSize: item.type === 'term' ? '20px' : '15px', fontWeight: item.type === 'term' ? '800' : '600', color: '#003366'
                    }}
                  >
                    {item.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  // ==========================================
  // RENDER QUIZ 
  // ==========================================
  if (isSubmitted) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', color: '#003366', padding: '20px', fontFamily: "'Josefin Sans', sans-serif" }}>
        <div style={{ marginBottom: '24px' }}><SvgIcons.CheckBig /></div>
        <h2 style={{ fontWeight: '800', margin: '0 0 12px 0', fontSize: '22px' }}>Đã nộp bài thành công!</h2>
        <p style={{ color: '#64748b', textAlign: 'center', maxWidth: '400px', lineHeight: '1.6' }}>Kết quả của bạn đã được ghi nhận.</p>
        <button onClick={() => setView('DASHBOARD')} style={{ marginTop: '30px', padding: '12px 24px', borderRadius: '100px', backgroundColor: 'white', border: '1px solid #cbd5e1', fontWeight: '700', cursor: 'pointer', color: '#003366', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>Quay lại Trang chủ</button>
      </div>
    );
  }

  const isTeacherPaced = sessionInfo?.mode === 'Teacher Paced';
  const isInstantFeedback = sessionInfo?.mode === 'Instant Feedback' || sessionInfo?.mode === 'Space Race' || sessionInfo?.mode === 'Weekly';
  const requiresLocking = isInstantFeedback || isTeacherPaced;
  const currentQuestionIndex = sessionInfo?.currentQuestionIndex || 0;
  const showFeedback = sessionInfo?.settings?.showFeedback;
  let globalQuestionIndex = 1;

  let displayTitle = shuffledQuiz?.title || 'Quiz Assignment';
  if (sessionInfo?.mode === 'Weekly' && sessionInfo.activeDays) {
     const d = sessionInfo.activeDays[sessionInfo.currentDayIndex];
     if (d) displayTitle = `${d.day}: ${d.quizTitle}`;
  }

  const sections = shuffledQuiz?.sections && shuffledQuiz.sections.length > 0 
    ? shuffledQuiz.sections 
    : [{ id: 'default', type: shuffledQuiz?.quizMode === 'PASSAGE' ? 'PASSAGE' : 'SINGLE', title: displayTitle, passageContent: shuffledQuiz?.passage }];

  const renderTextWithGapsQuiz = (q) => {
    if (!q.text) return null;
    const formattedText = q.text.replace(/\n/g, '<br/>');
    const parts = formattedText.split(/\[(\d+)\]/g);

    return (
      <div style={{ lineHeight: '2.4', fontSize: '15px', color: '#334155', wordBreak: 'break-word' }}>
        {parts.map((part, index) => {
          if (index % 2 === 1) { 
            const gapId = part;
            const isLocked = lockedQuestions[q.id];
            
            let isCorrect = false;
            if (isLocked) {
               const gapDef = (q.gaps || []).find(g => String(g.id) === String(gapId));
               if (gapDef) {
                   const correctAnsArray = (gapDef.answerString || '').split(',').map(s => s.trim().toLowerCase());
                   const stAns = (localAnswers[q.id] && localAnswers[q.id][gapId]) || '';
                   isCorrect = correctAnsArray.includes(stAns.trim().toLowerCase());
               }
            }

            const bgColor = isLocked ? (isCorrect ? '#dcfce7' : '#fee2e2') : '#f0f9ff';
            const borderColor = isLocked ? (isCorrect ? '#15803d' : '#b91c1c') : '#cbd5e1';
            const textColor = isLocked ? (isCorrect ? '#15803d' : '#b91c1c') : '#003366';

            return (
              <input
                key={index} type="text" placeholder={gapId} value={(localAnswers[q.id] && localAnswers[q.id][gapId]) || ''}
                onChange={(e) => handleGapFillChange(q.id, gapId, e.target.value)} disabled={isLocked}
                style={{ 
                  minWidth: '80px', maxWidth: '100%', margin: '0 6px', padding: '6px 12px', border: 'none', 
                  borderBottom: `2px solid ${borderColor}`, outline: 'none', textAlign: 'center', 
                  fontSize: '15px', color: textColor, fontWeight: 'bold', 
                  backgroundColor: bgColor, borderRadius: '6px 6px 0 0', 
                  cursor: isLocked ? 'not-allowed' : 'text', opacity: isLocked ? 0.9 : 1 
                }}
              />
            );
          }
          return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
        })}
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '80px', fontFamily: "'Josefin Sans', sans-serif" }}>
      {appHeader(displayTitle, true, () => setView('DASHBOARD'))}
      {isOffline && (
        <div style={{ backgroundColor: '#ffcc00', color: '#000', padding: '10px', textAlign: 'center', position: 'sticky', top: '72px', zIndex: 1000, fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          ⚠️ Mất kết nối mạng! Đừng lo, bài làm của bạn đang được lưu tạm. Vui lòng không đóng trình duyệt và chờ có mạng lại.
        </div>
      )}
      <div style={{ maxWidth: '840px', margin: '0 auto', padding: isMobile ? '20px 15px' : '40px 20px' }}>
        
        {sections.map((section) => {
          const targetQ = shuffledQuiz?.questions && shuffledQuiz.questions[currentQuestionIndex];
          if (isTeacherPaced && (!targetQ || (section.id !== targetQ.sectionId && !(section.id === 'default' && !targetQ.sectionId)))) return null;

          let secQuestions = (shuffledQuiz?.questions || []).filter(q => q.sectionId === section.id || (!q.sectionId && section.id === 'default'));
          if (isTeacherPaced && targetQ) secQuestions = [targetQ];
          if (secQuestions.length === 0 && !section.passageContent) return null;

          return (
            <div key={section.id} style={{ marginBottom: '50px' }}>
              
              {section.type === 'PASSAGE' && (
                <div style={{ backgroundColor: 'white', padding: isMobile ? '24px' : '32px', borderRadius: '20px', border: '1px solid #cbd5e1', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0ea5e9', marginBottom: '16px' }}>
                    <SvgIcons.Passage />
                    <span style={{ fontWeight: '800', fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase' }}>Reading Passage</span>
                  </div>
                  <h2 style={{ color: '#003366', marginTop: 0, marginBottom: '24px', fontSize: isMobile ? '22px' : '26px', fontWeight: '800' }}>{section.title}</h2>
                  <div style={{ color: '#334155', fontSize: '16px', lineHeight: '1.8', whiteSpace: 'pre-wrap', textAlign: 'justify', wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: section.passageContent }} />
                </div>
              )}

              {section.type === 'SINGLE' && section.title && section.title !== 'Quiz Assignment' && (
                <h2 style={{ color: '#003366', fontSize: '20px', fontWeight: '800', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>{section.title}</h2>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {secQuestions.map((q) => {
                  const isLocked = lockedQuestions[q.id];
                  const currentQNum = isTeacherPaced ? currentQuestionIndex + 1 : globalQuestionIndex++;

                  let isCorrectSAQ_MATCH = false;
                  const stAnsSAQ_MATCH = localAnswers[q.id] || '';
                  if (isLocked && stAnsSAQ_MATCH) {
                    if (q.type === 'MATCHING') isCorrectSAQ_MATCH = stAnsSAQ_MATCH.trim().toLowerCase() === String(q.correctMatch || '').trim().toLowerCase();
                    if (q.type === 'SAQ') {
                       const delimiter = (q.correctText || '').includes('|||') ? '|||' : ',';
                       isCorrectSAQ_MATCH = (q.correctText || '').split(delimiter).map(s => s.trim().toLowerCase()).includes(stAnsSAQ_MATCH.trim().toLowerCase());
                    }
                  }
                  
                  const saqBg = isLocked ? (isCorrectSAQ_MATCH ? '#dcfce7' : '#fee2e2') : '#f8fafc';
                  const saqBorder = isLocked ? (isCorrectSAQ_MATCH ? '#15803d' : '#b91c1c') : '#cbd5e1';
                  const saqColor = isLocked ? (isCorrectSAQ_MATCH ? '#15803d' : '#b91c1c') : '#003366';

                  return (
                    <div key={q.id} style={{ backgroundColor: 'white', padding: isMobile ? '20px' : '30px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <span style={{ backgroundColor: '#003366', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '15px' }}>{currentQNum}</span>
                        {q.wordLimit && <span style={{ backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '13px', fontWeight: '700', padding: '4px 12px', borderRadius: '100px', whiteSpace: 'nowrap' }}>NO MORE THAN {q.wordLimit} WORDS</span>}
                        {isLocked && <span style={{ backgroundColor: '#fef3c7', color: '#d97706', fontSize: '13px', fontWeight: '700', padding: '4px 12px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '4px' }}><SvgIcons.Check /> Đã chốt</span>}
                      </div>

                      {q.optionsList && (
                        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '20px', fontSize: '15px', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                          <div style={{ fontWeight: '800', color: '#003366', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><SvgIcons.Info /> Reference List:</div>
                          {q.optionsList}
                        </div>
                      )}

                      {q.text && q.type !== 'GAP_FILL_PARAGRAPH' && <div style={{ fontSize: '16px', color: '#003366', fontWeight: '500', marginBottom: '24px', lineHeight: '1.6', wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: q.text }} />}

                      {/* MCQ */}
                      {q.type === 'MCQ' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {(q.displayOptions || []).map((optObj, i) => {
                            const originalIdx = optObj.originalIndex;
                            const isChecked = (localAnswers[q.id] || []).includes(originalIdx);
                            const isCorrectOption = (q.correctOptions || []).includes(originalIdx);

                            let bgColor = isChecked ? '#f0f9ff' : 'white';
                            let borderColor = isChecked ? '#003366' : '#e2e8f0';
                            let checkBgColor = isChecked ? '#003366' : 'transparent';
                            let checkBorderColor = isChecked ? 'none' : '2px solid #cbd5e1';

                            if (isLocked && isChecked) {
                                if (isCorrectOption) {
                                    bgColor = '#dcfce7'; borderColor = '#15803d'; checkBgColor = '#15803d'; checkBorderColor = 'none';
                                } else {
                                    bgColor = '#fee2e2'; borderColor = '#b91c1c'; checkBgColor = '#b91c1c'; checkBorderColor = 'none';
                                }
                            }

                            return (
                              <div key={originalIdx} onClick={() => !isLocked && handleToggleMCQ(q.id, originalIdx)} style={{ display: 'flex', alignItems: 'flex-start', padding: '16px', border: `1px solid ${borderColor}`, borderRadius: '12px', cursor: isLocked ? 'not-allowed' : 'pointer', backgroundColor: bgColor, transition: 'all 0.2s', color: '#334155' }}>
                                <div style={{ marginTop: '2px', width: '22px', height: '22px', borderRadius: '6px', border: checkBorderColor, backgroundColor: checkBgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', flexShrink: 0 }}>
                                  {isChecked && <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                </div>
                                <div style={{ fontSize: '15px', fontWeight: isChecked ? '700' : '500', lineHeight: '1.6', pointerEvents: 'none', display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                                  <span style={{ fontWeight: '800', marginRight: '8px' }}>{String.fromCharCode(65 + i)}.</span>
                                  <div dangerouslySetInnerHTML={{ __html: optObj.text }} style={{ flex: 1, margin: 0, padding: 0, wordBreak: 'break-word' }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* EVALUATION */}
                      {q.type === 'EVALUATION' && (
                        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
                          {(q.evalType === 'YNNG' ? ['Yes', 'No', 'Not Given'] : ['True', 'False', 'Not Given']).map(opt => {
                            const isSelected = localAnswers[q.id] === opt;
                            const isCorrectOption = q.correctOption === opt;

                            let bgColor = isSelected ? '#f0f9ff' : 'white';
                            let borderColor = isSelected ? '#003366' : '#e2e8f0';
                            let textColor = isSelected ? '#003366' : '#64748b';

                            if (isLocked && isSelected) {
                                if (isCorrectOption) {
                                    bgColor = '#dcfce7'; borderColor = '#15803d'; textColor = '#15803d';
                                } else {
                                    bgColor = '#fee2e2'; borderColor = '#b91c1c'; textColor = '#b91c1c';
                                }
                            }

                            return (
                              <div key={opt} onClick={() => !isLocked && handleSimpleAnswer(q.id, opt)} style={{ flex: 1, textAlign: 'center', padding: '16px', border: `2px solid ${borderColor}`, borderRadius: '12px', cursor: isLocked ? 'not-allowed' : 'pointer', fontWeight: '700', color: textColor, backgroundColor: bgColor, transition: 'all 0.2s' }}>
                                {opt}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* MATCHING & SAQ */}
                      {['MATCHING', 'SAQ'].includes(q.type) && (
                        <input 
                          type="text" placeholder="Nhập câu trả lời của bạn..." value={localAnswers[q.id] || ''} 
                          onChange={(e) => handleSimpleAnswer(q.id, e.target.value)} disabled={isLocked} 
                          style={{ width: '100%', padding: '16px', borderRadius: '12px', border: `1px solid ${saqBorder}`, outline: 'none', fontSize: '15px', color: saqColor, fontWeight: '700', boxSizing: 'border-box', backgroundColor: saqBg, transition: 'all 0.2s' }} 
                        />
                      )}

                      {/* GAP FILL DIAGRAM */}
                      {q.type === 'GAP_FILL_DIAGRAM' && (
                        <div style={{ marginBottom: '15px' }}>
                          {q.imageUrl && (
                            <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', marginBottom: '20px', width: '100%' }}>
                              <img src={q.imageUrl} alt="Diagram" style={{ display: 'block', maxWidth: '100%', height: 'auto', opacity: isLocked ? 0.8 : 1 }} />
                              {(q.labels || []).map(lbl => (
                                <div key={lbl.id} style={{ position: 'absolute', left: `${lbl.x}%`, top: `${lbl.y}%`, transform: 'translate(-50%, -50%)', background: '#0ea5e9', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>{lbl.id}</div>
                              ))}
                            </div>
                          )}
                          {(q.labels && q.labels.length > 0) && (
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                              {q.labels.map(lbl => {
                                let isLabelCorrect = false;
                                const stLblAns = (localAnswers[q.id] && localAnswers[q.id][lbl.id]) || '';
                                if (isLocked) {
                                    const correctAnsArray = (lbl.answerString || '').split(',').map(s => s.trim().toLowerCase());
                                    isLabelCorrect = correctAnsArray.includes(stLblAns.trim().toLowerCase());
                                }
                                const lblBg = isLocked ? (isLabelCorrect ? '#dcfce7' : '#fee2e2') : 'white';
                                const lblBorder = isLocked ? (isLabelCorrect ? '#15803d' : '#b91c1c') : '#cbd5e1';
                                const lblText = isLocked ? (isLabelCorrect ? '#15803d' : '#b91c1c') : '#003366';

                                return (
                                  <div key={lbl.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: lblBg, padding: '10px 16px', borderRadius: '10px', border: `1px solid ${lblBorder}`, transition: 'all 0.2s' }}>
                                    <span style={{ backgroundColor: '#0ea5e9', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px', flexShrink: 0 }}>{lbl.id}</span>
                                    <input type="text" placeholder={`Nhập đáp án nhãn ${lbl.id}...`} value={stLblAns} onChange={(e) => handleGapFillChange(q.id, lbl.id, e.target.value)} disabled={isLocked} style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px', color: lblText, fontWeight: '700', width: '100%', minWidth: '0', backgroundColor: 'transparent' }} />
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* GAP FILL PARAGRAPH */}
                      {q.type === 'GAP_FILL_PARAGRAPH' && (
                        <div style={{ padding: isMobile ? '16px' : '24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #cbd5e1', overflowX: 'auto' }}>
                          {renderTextWithGapsQuiz(q)}
                        </div>
                      )}

                      {/* --- NÚT CHỐT ĐÁP ÁN --- */}
                      {requiresLocking && !isLocked && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #e2e8f0' }}>
                          <button 
                            onClick={() => handleLockQuestion(q.id)} 
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0ea5e9', color: 'white', fontWeight: '700', padding: '10px 20px', borderRadius: '100px', cursor: 'pointer', border: 'none', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(14,165,233,0.2)' }}
                          >
                            <SvgIcons.Lock /> Chốt đáp án
                          </button>
                        </div>
                      )}

                      {/* --- HIỂN THỊ ĐÁP ÁN ĐÚNG & GIẢI THÍCH KHI ĐÃ CHỐT --- */}
                      {requiresLocking && isLocked && (
                        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd', color: '#0369a1', fontSize: '14px', lineHeight: '1.6' }}>
                          <div style={{ fontWeight: '800', marginBottom: showFeedback ? '12px' : '0', color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <SvgIcons.Check /> Đáp án đúng: {getCorrectAnswerDisplayForStudent(q)}
                          </div>
                          
                          {showFeedback && (
                            <>
                              <div style={{ fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <SvgIcons.Info /> Giải thích / Feedback:
                              </div>
                              {q.explanation ? <div dangerouslySetInnerHTML={{ __html: q.explanation }} style={{ wordBreak: 'break-word' }} /> : <div>Không có giải thích chi tiết cho câu hỏi này.</div>}
                            </>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {isTeacherPaced ? (
          <div style={{ textAlign: 'center', marginTop: '40px', padding: '20px', backgroundColor: '#e0f2fe', borderRadius: '12px', border: '1px solid #bae6fd', color: '#0369a1', fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ animation: 'pulse 2s infinite' }}><SvgIcons.Wait /></div>
            Chế độ Teacher Paced: Vui lòng đợi giáo viên chuyển sang câu hỏi tiếp theo...
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            <button onClick={handleQuizSubmit} style={{ width: isMobile ? '100%' : 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', backgroundColor: '#003366', color: 'white', fontWeight: '800', padding: '16px 40px', fontSize: '16px', borderRadius: '100px', cursor: 'pointer', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,51,102,0.3)', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <SvgIcons.Submit /> Submit Assignment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}