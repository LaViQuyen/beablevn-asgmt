// src/pages/teacher/VocabularyManager.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const SvgIcons = {
  Folder: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#003366" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>,
  Plus: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Trash: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Back: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
  Save: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>,
  Import: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
};

export default function VocabularyManager() {
  const [activeTab, setActiveTab] = useState('SETS'); 
  const [vocabSets, setVocabSets] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [reports, setReports] = useState([]);
  
  const [editingSet, setEditingSet] = useState(null); 
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // --- CÁC STATE QUẢN LÝ THƯ MỤC FLASHCARD (ĐỘC LẬP) ---
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderInputValue, setFolderInputValue] = useState('');
  
  // State phục vụ tính năng Di chuyển bộ thẻ vào Folder
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [movingSet, setMovingSet] = useState(null);
  const [selectedTargetFolder, setSelectedTargetFolder] = useState('');

  // ---> THÊM STATE NÀY ĐỂ NHỚ THƯ MỤC NÀO ĐANG ĐÓNG/MỞ <---
  const [expandedFolders, setExpandedFolders] = useState({});

  // ---> THÊM 2 STATE NÀY CHO TÍNH NĂNG CHỌN NHIỀU <---
  const [selectedSetIds, setSelectedSetIds] = useState([]); 
  const [isMultiMove, setIsMultiMove] = useState(false);

  // States for Bulk Import feature
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importDelimiter, setImportDelimiter] = useState('tab'); // 'tab', 'comma', 'custom'
  const [customDelimiter, setCustomDelimiter] = useState('-');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async () => {
    try {
      const setsSnap = await getDocs(collection(db, "vocab_sets"));
      setVocabSets(setsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const roomsSnap = await getDocs(collection(db, "rooms"));
      setRooms(roomsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Tải dữ liệu từ bảng thư mục từ vựng riêng biệt
      const foldersSnap = await getDocs(collection(db, "vocab_folders"));
      setFolders(foldersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateNewSet = () => {
    setEditingSet({
      id: 'vs_' + Date.now(),
      title: '',
      programme: '',
      folderId: currentFolder, // Tự động nằm trong folder đang đứng nếu có
      cards: [{ id: Date.now(), term: '', definition: '', example: '', imageUrl: '' }]
    });
  };

  // Hàm tạo thư mục từ vựng mới
  const handleCreateFolder = async () => {
    if (!folderInputValue.trim()) return alert("Vui lòng nhập tên thư mục!");
    const newFolderId = 'vfolder_' + Date.now();
    const newFolder = {
      name: folderInputValue.trim(),
      modified: new Date().toISOString().split('T')[0],
      parentId: currentFolder
    };
    try {
      await setDoc(doc(db, "vocab_folders", newFolderId), newFolder);
      setFolders(prev => [...prev, { id: newFolderId, ...newFolder }]);
      setFolderInputValue('');
      setShowFolderModal(false);
    } catch (error) {
      console.error(error); alert("Lỗi khi tạo thư mục!");
    }
  };

  // Hàm xóa thư mục từ vựng (Đã nâng cấp để giải cứu cả folder con)
  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thư mục này? (Các thư mục con và bộ thẻ bên trong sẽ KHÔNG bị xóa, chúng sẽ được chuyển ra màn hình gốc)")) return;

    try {
      // 1. Giải cứu các BỘ THẺ (Flashcard Sets) đang nằm trực tiếp trong thư mục này
      const orphanedSets = vocabSets.filter(s => s.folderId === folderId);
      for (let set of orphanedSets) {
        await setDoc(doc(db, "vocab_sets", set.id), { folderId: null }, { merge: true });
      }

      // 2. Giải cứu các THƯ MỤC CON (Child Folders) đang nằm trong thư mục này
      const orphanedFolders = folders.filter(f => f.parentId === folderId);
      for (let childFolder of orphanedFolders) {
        await setDoc(doc(db, "vocab_folders", childFolder.id), { parentId: null }, { merge: true });
      }

      // 3. Xóa thư mục hiện tại trên Firebase
      await deleteDoc(doc(db, "vocab_folders", folderId));

      // 4. Cập nhật lại giao diện ngay lập tức
      setFolders(prev => prev
        .filter(f => f.id !== folderId) // Xóa folder cha khỏi giao diện
        .map(f => f.parentId === folderId ? { ...f, parentId: null } : f) // Cập nhật các folder con ra màn hình chính
      );
      if (orphanedSets.length > 0) fetchData(); // Tải lại dữ liệu nếu có bộ thẻ vừa được dời ra
      
    } catch (error) {
      console.error(error); 
      alert("Lỗi khi xóa thư mục!");
    }
  };

  // 1. Hàm tick/bỏ tick chọn một bộ thẻ
  const handleToggleSelect = (setId) => {
    setSelectedSetIds(prev => prev.includes(setId) ? prev.filter(id => id !== setId) : [...prev, setId]);
  };

  // 2. Kích hoạt popup di chuyển (Phân biệt di chuyển 1 cái hay nhiều cái)
  const handleOpenMoveModal = (set = null) => {
    if (set) {
      setMovingSet(set);
      setIsMultiMove(false);
    } else {
      setIsMultiMove(true);
    }
    setSelectedTargetFolder('');
    setShowMoveModal(true);
  };

  // 3. Xác nhận lưu folderId mới lên Firebase
  const handleConfirmMove = async () => {
    const targetFolderId = selectedTargetFolder === '' ? null : selectedTargetFolder;
    try {
      if (isMultiMove) {
        // DI CHUYỂN NHIỀU THẺ CÙNG LÚC
        await Promise.all(selectedSetIds.map(id => setDoc(doc(db, "vocab_sets", id), { folderId: targetFolderId }, { merge: true })));
        setVocabSets(prev => prev.map(s => selectedSetIds.includes(s.id) ? { ...s, folderId: targetFolderId } : s));
        setSelectedSetIds([]); // Xóa tick sau khi xong
      } else {
        // DI CHUYỂN 1 THẺ
        if (!movingSet) return;
        await setDoc(doc(db, "vocab_sets", movingSet.id), { folderId: targetFolderId }, { merge: true });
        setVocabSets(prev => prev.map(s => s.id === movingSet.id ? { ...s, folderId: targetFolderId } : s));
      }
      
      setShowMoveModal(false);
      setMovingSet(null);
      setIsMultiMove(false);
    } catch (error) {
      console.error(error); alert("Lỗi khi di chuyển bộ thẻ.");
    }
  };

  // ==========================================
  // LOGIC RENDER CÂY THƯ MỤC (VS CODE STYLE)
  // ==========================================
  const toggleFolderExpand = (e, folderId) => {
    e.stopPropagation();
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const renderFolderTree = (parentId = null, level = 0) => {
    const children = folders.filter(f => (f.parentId || null) === parentId);
    children.sort((a, b) => a.name.localeCompare(b.name));

    if (children.length === 0) return null;

    return children.map(folder => {
      const hasChildren = folders.some(f => (f.parentId || null) === folder.id);
      const isExpanded = expandedFolders[folder.id];
      const isSelected = selectedTargetFolder === folder.id;

      return (
        <div key={folder.id}>
          <div
            onClick={() => setSelectedTargetFolder(folder.id)}
            style={{ 
              display: 'flex', alignItems: 'center', 
              padding: '4px 8px', 
              paddingLeft: `${level * 20 + 4}px`, 
              cursor: 'pointer', 
              backgroundColor: isSelected ? '#e0f2fe' : 'transparent', 
              borderRadius: '6px', 
              marginBottom: '2px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {/* Nút mũi tên */}
            <div 
              onClick={(e) => hasChildren ? toggleFolderExpand(e, folder.id) : null}
              style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: hasChildren ? 'pointer' : 'default', color: '#94a3b8', borderRadius: '4px', marginRight: '4px' }}
              onMouseEnter={e => { if(hasChildren) e.currentTarget.style.color = '#334155'; }}
              onMouseLeave={e => { if(hasChildren) e.currentTarget.style.color = '#94a3b8'; }}
            >
              {hasChildren ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease-in-out' }}>
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              ) : null}
            </div>

            {/* Icon Thư mục */}
            <span style={{ marginRight: '8px', display: 'flex', color: isSelected ? '#0ea5e9' : '#94a3b8' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isSelected ? "#bae6fd" : (isExpanded && hasChildren ? "#f1f5f9" : "none")} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </span>
            
            {/* Tên Thư mục */}
            <span style={{ fontWeight: isSelected ? '700' : '500', color: isSelected ? '#0369a1' : '#334155', fontSize: '14px', userSelect: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {folder.name}
            </span>
          </div>

          {hasChildren && isExpanded && (
            <div>
              {renderFolderTree(folder.id, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const handleSaveSet = async () => {
    if (!editingSet.title) return alert("Vui lòng nhập tên bộ thẻ!");
    try {
      await setDoc(doc(db, "vocab_sets", editingSet.id), {
        ...editingSet,
        modified: new Date().toISOString()
      });
      alert("Lưu bộ thẻ thành công!");
      setEditingSet(null);
      fetchData();
    } catch (error) {
      console.error(error); alert("Lỗi khi lưu bộ thẻ.");
    }
  };

  const handleDeleteSet = async (id) => {
    if(!window.confirm("Xóa bộ thẻ này?")) return;
    try {
      await deleteDoc(doc(db, "vocab_sets", id));
      fetchData();
    } catch (error) {
      console.error(error); alert("Lỗi khi xóa bộ thẻ.");
    }
  };

  // --- LOGIC BULK IMPORT ---
  const handleBulkImport = () => {
    if (!importText.trim()) {
      alert("Vui lòng nhập dữ liệu cần import!");
      return;
    }

    let delimiterChar = '\t';
    if (importDelimiter === 'comma') delimiterChar = ',';
    if (importDelimiter === 'custom') delimiterChar = customDelimiter;

    const rows = importText.split('\n');
    const newCards = [];

    rows.forEach(row => {
      if (row.trim() !== '') {
        const parts = row.split(delimiterChar);
        if (parts.length >= 2) {
          newCards.push({
            id: Date.now() + Math.random(), // Unique ID
            term: parts[0].trim(),
            definition: parts[1].trim(),
            example: parts[2] ? parts[2].trim() : ''
          });
        }
      }
    });

    if (newCards.length > 0) {
      setEditingSet({
        ...editingSet,
        cards: [...editingSet.cards.filter(c => c.term || c.definition), ...newCards] // Filter empty blank cards before appending
      });
      alert(`Đã nhập thành công ${newCards.length} thẻ!`);
      setShowImportModal(false);
      setImportText('');
    } else {
      alert("Không tìm thấy dữ liệu hợp lệ. Vui lòng kiểm tra lại ký tự phân cách.");
    }
  };

  // --- LOGIC CHO TAB "CLASSES" ---
  const handleAssignSetToRoom = async (actualRoomId, setId) => {
    try {
      await setDoc(doc(db, "rooms", actualRoomId), { assignedVocabId: setId }, { merge: true });
      fetchData();
      alert("Gán bộ thẻ cho lớp thành công!");
    } catch (error) {
      console.error(error); alert("Lỗi khi gán. Chi tiết: " + error.message);
    }
  };

  // --- LOGIC CHO TAB "REPORTS" ---
  useEffect(() => {
    if (activeTab === 'REPORTS') {
      const fetchReports = async () => {
        let allRep = [];
        for (let r of rooms) {
          const targetRoomId = r.roomId || r.id;
          try {
            const subSnap = await getDocs(collection(db, `rooms/${targetRoomId}/vocab_submissions`));
            subSnap.docs.forEach(d => {
              allRep.push({ roomId: targetRoomId, studentId: d.id, ...d.data() });
            });
          } catch (err) {
            console.error(`Không lấy được báo cáo cho phòng ${targetRoomId}`);
          }
        }
        setReports(allRep);
      };
      fetchReports();
    }
  }, [activeTab, rooms]);

  const renderTabs = () => (
    <div style={{ display: 'flex', gap: isMobile ? '15px' : '25px', borderBottom: '2px solid #e2e8f0', marginBottom: '30px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      {['SETS', 'CLASSES', 'REPORTS'].map(tab => (
        <button 
          key={tab} onClick={() => { setActiveTab(tab); setEditingSet(null); }}
          style={{ background: 'none', border: 'none', padding: '12px 0', fontSize: '15px', fontWeight: '800', cursor: 'pointer', color: activeTab === tab ? '#003366' : '#94a3b8', borderBottom: activeTab === tab ? '3px solid #003366' : '3px solid transparent', marginBottom: '-2px', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
        >
          {tab === 'SETS' ? 'Flashcard Sets' : tab === 'CLASSES' ? 'Classes Assignment' : 'Student Reports'}
        </button>
      ))}
    </div>
  );

  // --- GIAO DIỆN EDIT SET ---
  if (editingSet) {
    return (
      <div style={{ padding: isMobile ? '15px' : '30px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Josefin Sans', sans-serif", paddingBottom: '100px' }}>
        
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '30px', gap: '15px' }}>
          <button onClick={() => setEditingSet(null)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: '700', fontSize: '15px', padding: 0 }}>
            <SvgIcons.Back /> Back to Library
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setShowImportModal(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: 'white', color: '#003366', padding: '12px 20px', borderRadius: '100px', border: '1px solid #cbd5e1', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', flex: 1 }}>
              <SvgIcons.Import /> Import
            </button>
            <button onClick={handleSaveSet} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#003366', color: 'white', padding: '12px 24px', borderRadius: '100px', fontWeight: '700', border: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,51,102,0.2)', flex: 1 }}>
              <SvgIcons.Save /> Save Set
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: isMobile ? '20px' : '24px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#003366', marginBottom: '8px', fontSize: '13px' }}>Title (Tên bộ thẻ)</label>
              <input type="text" value={editingSet.title} onChange={e => setEditingSet({...editingSet, title: e.target.value})} placeholder="VD: IELTS Vocabulary Unit 1" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#003366', marginBottom: '8px', fontSize: '13px' }}>Programme (Chương trình)</label>
              <input type="text" value={editingSet.programme} onChange={e => setEditingSet({...editingSet, programme: e.target.value})} placeholder="VD: IELTS / THPTQG" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {editingSet.cards.map((card, idx) => (
            <div key={card.id} style={{ backgroundColor: 'white', padding: isMobile ? '20px' : '24px', borderRadius: '16px', border: '1px solid #cbd5e1', position: 'relative' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '12px' }}>
                <div style={{ fontWeight: '800', color: '#003366' }}>{idx + 1}</div>
                <button onClick={() => setEditingSet({...editingSet, cards: editingSet.cards.filter(c => c.id !== card.id)})} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}><SvgIcons.Trash /></button>
              </div>
              
              {/* ==================================================== */}
              {/* KHỐI 2 CỘT: TERM (TRÁI) VÀ DEFINITION + IMAGE (PHẢI) */}
              {/* ==================================================== */}
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px', marginBottom: '16px' }}>
                
                {/* CỘT 1: TERM (Đã được dọn dẹp sạch sẽ phần code thừa) */}
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: '700', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Term (Thuật ngữ)</label>
                  <input 
                    type="text" 
                    value={card.term} 
                    onChange={e => { 
                      const newCards = [...editingSet.cards]; 
                      newCards[idx].term = e.target.value; 
                      setEditingSet({...editingSet, cards: newCards}); 
                    }} 
                    style={{ width: '100%', border: 'none', borderBottom: '2px solid #cbd5e1', padding: '8px 0', outline: 'none', fontSize: '16px', fontWeight: '700', color: '#003366', boxSizing: 'border-box' }} 
                    placeholder="Nhập từ vựng..." 
                  />
                </div>
                
                {/* CỘT 2: DEFINITION VÀ HÌNH ẢNH */}
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: '700', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Definition (Định nghĩa)</label>
                  <input 
                    type="text" 
                    value={card.definition} 
                    onChange={e => { 
                      const newCards = [...editingSet.cards]; 
                      newCards[idx].definition = e.target.value; 
                      setEditingSet({...editingSet, cards: newCards}); 
                    }} 
                    style={{ width: '100%', border: 'none', borderBottom: '2px solid #cbd5e1', padding: '8px 0', outline: 'none', fontSize: '15px', color: '#334155', boxSizing: 'border-box' }} 
                    placeholder="Nhập định nghĩa..." 
                  />
                  
                  {/* Ô NHẬP LINK HÌNH ẢNH ĐƯỢC CHUYỂN SANG ĐÂY */}
                  <div style={{ marginTop: '16px' }}>
                    <input 
                      type="text" 
                      placeholder="Dán link hình ảnh minh họa (URL)..." 
                      value={card.imageUrl || ''} 
                      onChange={e => { 
                        const newCards = [...editingSet.cards]; 
                        newCards[idx].imageUrl = e.target.value; 
                        setEditingSet({...editingSet, cards: newCards}); 
                      }}
                      style={{ 
                        width: '100%', 
                        padding: '10px 12px', 
                        borderRadius: '8px', 
                        border: '1px solid #cbd5e1', 
                        fontSize: '13px', 
                        boxSizing: 'border-box',
                        outlineColor: '#003366',
                        backgroundColor: '#f8fafc'
                      }}
                    />
                    
                    {/* XEM TRƯỚC HÌNH ẢNH (PREVIEW) */}
                    {card.imageUrl && (
                      <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'center' }}>
                        <img 
                          src={card.imageUrl} 
                          alt="Preview" 
                          style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain', borderRadius: '6px' }} 
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>
                </div>

              </div>
              {/* ==================================================== */}
              
              <div>
                <label style={{ fontWeight: '700', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Example (Ví dụ)</label>
                <textarea value={card.example} onChange={e => { const newCards = [...editingSet.cards]; newCards[idx].example = e.target.value; setEditingSet({...editingSet, cards: newCards}); }} style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', outline: 'none', fontSize: '14px', resize: 'vertical', minHeight: '60px', marginTop: '8px', boxSizing: 'border-box', fontFamily: 'inherit' }} placeholder="Ví dụ trong câu..." />
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => setEditingSet({...editingSet, cards: [...editingSet.cards, { id: Date.now(), term: '', definition: '', example: '' }]})} style={{ width: '100%', padding: '20px', marginTop: '20px', backgroundColor: 'white', border: '2px dashed #003366', borderRadius: '16px', color: '#003366', fontWeight: '800', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <SvgIcons.Plus /> Thêm thẻ (Add Card)
        </button>

        {/* MODAL IMPORT */}
        {showImportModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '15px', boxSizing: 'border-box', backdropFilter: 'blur(4px)' }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ color: '#003366', marginTop: 0, marginBottom: '20px', fontWeight: '800', fontSize: '22px' }}>Nhập thẻ hàng loạt (Bulk Import)</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: '700', color: '#334155', marginBottom: '8px', fontSize: '14px' }}>Dán dữ liệu của bạn vào đây:</label>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 10px 0' }}>Định dạng chuẩn: <b>Từ vựng</b> [phân cách] <b>Định nghĩa</b> [phân cách] <b>Ví dụ</b> (nếu có)</p>
                <textarea 
                  value={importText} 
                  onChange={e => setImportText(e.target.value)} 
                  placeholder={`Word 1\tDefinition 1\tExample 1\nWord 2\tDefinition 2\tExample 2`}
                  style={{ width: '100%', height: '200px', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '24px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontWeight: '700', color: '#334155', marginBottom: '12px', fontSize: '14px' }}>Ký tự phân cách giữa từ và định nghĩa:</label>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                    <input type="radio" checked={importDelimiter === 'tab'} onChange={() => setImportDelimiter('tab')} style={{ accentColor: '#003366' }} /> Dấu Tab (Copy từ Excel)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                    <input type="radio" checked={importDelimiter === 'comma'} onChange={() => setImportDelimiter('comma')} style={{ accentColor: '#003366' }} /> Dấu phẩy (,)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                    <input type="radio" checked={importDelimiter === 'custom'} onChange={() => setImportDelimiter('custom')} style={{ accentColor: '#003366' }} /> Tùy chỉnh:
                    <input type="text" value={customDelimiter} onChange={e => { setCustomDelimiter(e.target.value); setImportDelimiter('custom'); }} style={{ width: '40px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', textAlign: 'center' }} disabled={importDelimiter !== 'custom'} />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button style={{ padding: '14px 24px', borderRadius: '100px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => { setShowImportModal(false); setImportText(''); }}>Hủy</button>
                <button onClick={handleBulkImport} style={{ padding: '14px 24px', borderRadius: '100px', border: 'none', backgroundColor: '#003366', color: 'white', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,51,102,0.2)', transition: 'all 0.2s' }}>Nhập dữ liệu</button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // --- GIAO DIỆN CHÍNH ---
  return (
    <div style={{ padding: isMobile ? '15px' : '30px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Josefin Sans', sans-serif" }}>
      <h2 style={{ color: '#003366', margin: '0 0 24px 0', fontSize: isMobile ? '24px' : '28px', fontWeight: '800' }}>Vocabulary Studio</h2>
      {renderTabs()}

      {/* TAB SETS */}
      {activeTab === 'SETS' && (
        <div>
          {/* THANH ĐIỀU HƯỚNG/NÚT BẤM TẠO MỚI VÀ THANH CÔNG CỤ CHỌN NHIỀU */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => setShowFolderModal(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#003366', color: 'white', padding: '12px 24px', borderRadius: '100px', fontWeight: '700', border: '1px solid #003366', cursor: 'pointer', flex: isMobile ? 1 : 'none' }}>
                <SvgIcons.Plus /> Tạo Thư Mục
              </button>
              <button onClick={handleCreateNewSet} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#003366', color: 'white', padding: '12px 24px', borderRadius: '100px', fontWeight: '700', border: 'none', cursor: 'pointer', flex: isMobile ? 1 : 'none', boxShadow: '0 4px 6px -1px rgba(0,51,102,0.2)' }}>
                <SvgIcons.Plus /> Tạo Bộ Thẻ Mới
              </button>
            </div>

            {/* THANH CÔNG CỤ CHỌN NHIỀU (Sẽ hiện ra khi tick chọn thẻ) */}
            {selectedSetIds.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#e0f2fe', padding: '8px 16px', borderRadius: '100px', border: '1px solid #bae6fd', animation: 'fadeIn 0.2s ease-in-out' }}>
                <span style={{ color: '#0369a1', fontWeight: '800', fontSize: '14px' }}>Đã chọn {selectedSetIds.length}</span>
                <button onClick={() => handleOpenMoveModal(null)} style={{ backgroundColor: '#0ea5e9', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '100px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', boxShadow: '0 2px 4px rgba(14,165,233,0.2)' }}>
                  Di chuyển
                </button>
                <button onClick={() => setSelectedSetIds([])} style={{ backgroundColor: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                  Hủy
                </button>
              </div>
            )}
          </div>

          {/* NÚT QUAY LẠI CẤP CHA (Đã sửa lỗi logic nhảy từng nấc) */}
          {currentFolder && (
            <div 
              onClick={() => {
                // 1. Tìm thông tin của thư mục đang đứng hiện tại
                const currentFolderData = folders.find(f => f.id === currentFolder);
                // 2. Lấy ID của thư mục cha (Nếu không có cha thì trả về null - tức là ra Root)
                const parentId = currentFolderData?.parentId || null;
                // 3. Chuyển hướng về thư mục cha
                setCurrentFolder(parentId);
              }} 
              style={{ padding: '10px 18px', marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#003366', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
            >
              <SvgIcons.Back /> <span style={{ fontWeight: '700' }}>Quay lại cấp trước</span>
            </div>
          )}
          
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            
            {/* 1. HIỂN THỊ CÁC FOLDERS THUỘC CẤP HIỆN TẠI */}
            {folders.filter(f => (f.parentId || null) === (currentFolder || null)).map(folder => (
              <div 
                key={folder.id} 
                style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'all 0.2s', height: '100%', boxSizing: 'border-box' }}
              >
                
                {/* Khu vực bấm để MỞ thư mục (Được đẩy lên trên cùng) */}
                <div onClick={() => setCurrentFolder(folder.id)} style={{ display: 'flex', gap: '15px', flex: 1, marginBottom: '20px' }}>
                  <div style={{ marginTop: '2px' }}><SvgIcons.Folder /></div>
                  <h3 style={{ color: '#003366', margin: 0, fontSize: '18px', fontWeight: '800' }}>{folder.name}</h3>
                </div>

                {/* Khu vực bấm để XÓA thư mục */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      handleDeleteFolder(folder.id);
                    }} 
                    style={{ padding: '10px 14px', backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    title="Xóa thư mục"
                  >
                    <SvgIcons.Trash />
                  </button>
                </div>

              </div>
            ))}

            {/* 2. HIỂN THỊ CÁC BỘ FLASHCARDS THUỘC CẤP HIỆN TẠI */}
            {vocabSets.filter(s => (s.folderId || null) === (currentFolder || null)).map(set => {
              const isSelected = selectedSetIds.includes(set.id);
              
              return (
                <div key={set.id} style={{ backgroundColor: isSelected ? '#f0f9ff' : 'white', padding: '24px', borderRadius: '16px', border: isSelected ? '2px solid #0ea5e9' : '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', position: 'relative', transition: 'all 0.2s' }}>
                  
                  {/* Ô CHECKBOX GÓC TRÊN CÙNG BÊN PHẢI */}
                  <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => handleToggleSelect(set.id)} 
                      style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#003366' }} 
                    />
                  </div>

                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', backgroundColor: '#f1f5f9', display: 'inline-block', padding: '4px 10px', borderRadius: '100px', marginBottom: '12px' }}>{set.programme || 'General'}</div>
                  <h3 style={{ color: '#003366', margin: '0 0 10px 0', fontSize: '18px', fontWeight: '800', paddingRight: '25px' }}>{set.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px 0' }}>{set.cards?.length || 0} terms</p>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setEditingSet(set)} style={{ flex: 1, padding: '10px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>Sửa</button>
                    <button onClick={() => handleOpenMoveModal(set)} style={{ flex: 1, padding: '10px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>Di chuyển</button>
                    <button onClick={() => handleDeleteSet(set.id)} style={{ padding: '10px 14px', backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><SvgIcons.Trash /></button>
                  </div>
                </div>
              );
            })}

            {/* TRẠNG THÁI THƯ MỤC TRỐNG */}
            {folders.filter(f => (f.parentId || null) === (currentFolder || null)).length === 0 && vocabSets.filter(s => (s.folderId || null) === (currentFolder || null)).length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '15px', fontWeight: '500', gridColumn: '1 / -1' }}>Thư mục này hiện đang trống.</div>
            )}
          </div>

          {/* POPMODAL 1: TẠO THƯ MỤC MỚI */}
          {showFolderModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '15px' }}>
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ color: '#003366', marginTop: 0, marginBottom: '20px', fontWeight: '800', fontSize: '20px' }}>Tạo thư mục từ vựng mới</h3>
                <input 
                  type="text" autoFocus placeholder="VD: IELTS, THPT Quốc Gia..." value={folderInputValue} onChange={(e) => setFolderInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px', boxSizing: 'border-box', marginBottom: '24px' }}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => { setShowFolderModal(false); setFolderInputValue(''); }} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}>Hủy</button>
                  <button onClick={handleCreateFolder} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#003366', color: 'white', fontWeight: '700', cursor: 'pointer' }}>Tạo mới</button>
                </div>
              </div>
            </div>
          )}

          {/* POPMODAL 2: GIAO DIỆN DI CHUYỂN BỘ THẺ */}
          {showMoveModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '15px', boxSizing: 'border-box' }}>
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ backgroundColor: '#e0f2fe', color: '#0ea5e9', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><polyline points="9 14 12 17 15 14"></polyline></svg>
                  </div>
                  <h3 style={{ color: '#003366', margin: 0, fontWeight: '800', fontSize: '20px' }}>Di chuyển đến</h3>
                </div>

                {/* GIAO DIỆN CÂY THƯ MỤC KIỂU VS CODE */}
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '8px', maxHeight: '250px', overflowY: 'auto', marginBottom: '24px', backgroundColor: '#f8fafc', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                  
                  {/* Lựa chọn thư mục gốc */}
                  <div 
                    onClick={() => setSelectedTargetFolder('')}
                    style={{ display: 'flex', alignItems: 'center', padding: '4px 8px', cursor: 'pointer', backgroundColor: selectedTargetFolder === '' ? '#e0f2fe' : 'transparent', borderRadius: '6px', marginBottom: '6px', transition: 'background 0.2s' }}
                    onMouseEnter={e => { if (selectedTargetFolder !== '') e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                    onMouseLeave={e => { if (selectedTargetFolder !== '') e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <div style={{ width: '24px' }}></div>
                    <span style={{ marginRight: '8px', display: 'flex', color: selectedTargetFolder === '' ? '#0ea5e9' : '#64748b' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    </span> 
                    <span style={{ fontWeight: selectedTargetFolder === '' ? '700' : '500', color: selectedTargetFolder === '' ? '#0369a1' : '#334155', fontSize: '14px', userSelect: 'none' }}>
                      Thư mục Gốc (Root)
                    </span>
                  </div>

                  {/* Khối gọi hàm đệ quy tự động render các thư mục */}
                  {renderFolderTree(null, 0)}

                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#64748b', fontWeight: '700', cursor: 'pointer' }} onClick={() => setShowMoveModal(false)}>Hủy</button>
                  <button onClick={handleConfirmMove} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#003366', color: 'white', fontWeight: '700', cursor: 'pointer' }}>Xác nhận</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CLASSES */}
      {activeTab === 'CLASSES' && (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ minWidth: '500px', width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
              <tr>
                <th style={{ padding: '16px', color: '#475569', fontWeight: '800', width: '30%' }}>Class (Room)</th>
                <th style={{ padding: '16px', color: '#475569', fontWeight: '800' }}>Assigned Vocabulary Set</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => {
                const actualRoomId = room.roomId || room.id; // Chắc chắn đồng bộ ID
                return (
                  <tr key={room.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px', color: '#003366', fontWeight: '700' }}>{actualRoomId}</td>
                    <td style={{ padding: '16px' }}>
                      <select 
                        value={room.assignedVocabId || ''} 
                        onChange={(e) => handleAssignSetToRoom(actualRoomId, e.target.value)}
                        style={{ width: '100%', minWidth: '200px', maxWidth: '400px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '600', color: '#334155', backgroundColor: 'white', appearance: 'none', cursor: 'pointer' }}
                      >
                        <option value="">-- Không gán thẻ --</option>
                        {vocabSets.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB REPORTS */}
      {activeTab === 'REPORTS' && (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ minWidth: '700px', width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
              <tr>
                <th style={{ padding: '16px', color: '#475569', fontWeight: '800' }}>Room</th>
                <th style={{ padding: '16px', color: '#475569', fontWeight: '800' }}>Student</th>
                <th style={{ padding: '16px', color: '#475569', fontWeight: '800' }}>Learn Mode (Acc/Total)</th>
                <th style={{ padding: '16px', color: '#475569', fontWeight: '800' }}>Match Mode (Time)</th>
                <th style={{ padding: '16px', color: '#475569', fontWeight: '800' }}>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Chưa có dữ liệu học tập.</td></tr> : reports.map((rep, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', fontWeight: '700', color: '#e67e22' }}>{rep.roomId}</td>
                  <td style={{ padding: '16px', fontWeight: '700', color: '#003366' }}>{rep.studentId}</td>
                  <td style={{ padding: '16px', color: '#15803d', fontWeight: '600' }}>{rep.learnCorrect || 0} / {rep.learnTotal || 0}</td>
                  <td style={{ padding: '16px', color: '#b91c1c', fontWeight: '600' }}>{rep.bestMatchTime ? `${rep.bestMatchTime}s` : '--'}</td>
                  <td style={{ padding: '16px', color: '#64748b' }}>{rep.lastActive ? new Date(rep.lastActive).toLocaleString('vi-VN') : '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}