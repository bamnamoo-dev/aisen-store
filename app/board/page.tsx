'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Plus, 
  Search, 
  Trash2, 
  X, 
  User, 
  MessageSquare, 
  HelpCircle, 
  Megaphone, 
  Edit3, 
  ChevronRight, 
  Clock, 
  Share2,
  Lock,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Post {
  id: string;
  board_type: string;
  title: string;
  content: string;
  author_email: string;
  category: string;
  created_at: string;
}

const BOARDS = [
  { id: 'notice', name: '공지사항', icon: <Megaphone size={16} />, color: 'text-blue-400' },
  { id: 'work_share', name: '업무공유', icon: <Share2 size={16} />, color: 'text-emerald-400' },
  { id: 'free', name: '자유게시판', icon: <MessageSquare size={16} />, color: 'text-sky-400' },
  { id: 'qna', name: '질의응답', icon: <HelpCircle size={16} />, color: 'text-purple-400' },
];

const CATEGORIES = ["전체", "공지", "협조", "긴급", "질문", "정보", "일반"];

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [activeBoard, setActiveBoard] = useState('notice');
  const [activeCategory, setActiveCategory] = useState("전체");

  const [showWriteModal, setShowWriteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Form State
  const [newPost, setNewPost] = useState({ 
    title: '', 
    content: '', 
    category: '일반',
    nickname: '',
    password: ''
  });
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const isAdmin = user?.email === 'bamnamoo@gmail.com';

  useEffect(() => {
    fetchPosts();
    checkUser();
  }, [activeBoard]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('board_type', activeBoard)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWriteModal = (post?: Post) => {
    if (post) {
      setEditingPostId(post.id);
      setNewPost({ 
        title: post.title, 
        content: post.content, 
        category: post.category,
        nickname: '',
        password: ''
      });
    } else {
      setEditingPostId(null);
      setNewPost({ 
        title: '', 
        content: '', 
        category: activeBoard === 'notice' ? '공지' : '일반',
        nickname: '',
        password: ''
      });
    }
    setShowWriteModal(true);
    setShowViewModal(false);
  };

  const handleOpenViewModal = (post: Post) => {
    setSelectedPost(post);
    setShowViewModal(true);
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();

    // Notice board is admin only
    if (activeBoard === 'notice' && !isAdmin) {
      return alert('공지사항은 관리자만 작성할 수 있습니다. 다른 게시판을 이용해주세요.');
    }

    // Guest validation
    if (!user && (!newPost.nickname.trim() || !newPost.password.trim())) {
      return alert('닉네임과 4자리 비밀번호를 입력해주세요.');
    }

    try {
      const authorIdentifier = user 
        ? user.email 
        : `guest:${newPost.nickname.trim()}#${newPost.password.trim()}`;

      if (editingPostId) {
        const { error } = await supabase
          .from('posts')
          .update({
            title: newPost.title,
            content: newPost.content,
            category: newPost.category
          })
          .eq('id', editingPostId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('posts').insert([{ 
          title: newPost.title,
          content: newPost.content,
          category: newPost.category,
          board_type: activeBoard, 
          author_email: authorIdentifier 
        }]);
        if (error) throw error;
      }
      
      setShowWriteModal(false);
      setEditingPostId(null);
      fetchPosts();
    } catch (error: any) {
      console.error('Save error:', error);
      alert(`저장 실패: ${error.message}`);
    }
  };

  const handleDeletePost = async (post: Post) => {
    if (isAdmin) {
      if (!confirm('관리자 권한으로 삭제하시겠습니까?')) return;
      try {
        const { error } = await supabase.from('posts').delete().eq('id', post.id);
        if (error) throw error;
        setShowViewModal(false);
        fetchPosts();
      } catch (error: any) {
        alert(`삭제 실패: ${error.message}`);
      }
      return;
    }

    if (user && user.email === post.author_email) {
      if (!confirm('게시글을 삭제하시겠습니까?')) return;
      try {
        const { error } = await supabase.from('posts').delete().eq('id', post.id);
        if (error) throw error;
        setShowViewModal(false);
        fetchPosts();
      } catch (error: any) {
        alert(`삭제 실패: ${error.message}`);
      }
      return;
    }

    // Guest post delete with password
    if (post.author_email && post.author_email.startsWith('guest:')) {
      const parts = post.author_email.replace('guest:', '').split('#');
      const savedPw = parts[1];
      const inputPw = prompt('작성 시 입력한 4자리 비밀번호를 입력하세요:');
      if (!inputPw) return;

      if (inputPw === savedPw) {
        try {
          const { error } = await supabase.from('posts').delete().eq('id', post.id);
          if (error) throw error;
          setShowViewModal(false);
          fetchPosts();
        } catch (error: any) {
          alert(`삭제 실패: ${error.message}`);
        }
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
      return;
    }

    alert('삭제 권한이 없습니다.');
  };

  const getAuthorDisplay = (authorEmail: string) => {
    if (!authorEmail) return { name: '익명', isOfficial: false };
    if (authorEmail === 'bamnamoo@gmail.com') return { name: '관리자', isOfficial: true };
    if (authorEmail.startsWith('guest:')) {
      const nick = authorEmail.replace('guest:', '').split('#')[0];
      return { name: nick || '익명', isOfficial: false };
    }
    return { name: authorEmail.split('@')[0], isOfficial: false };
  };

  const filteredPosts = posts.filter(post => {
    const titleMatch = post.title.toLowerCase().includes(search.toLowerCase()) || 
                       post.content.toLowerCase().includes(search.toLowerCase());
    const catMatch = activeCategory === "전체" || post.category === activeCategory;
    return titleMatch && catMatch;
  });

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 px-4 md:px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-[1200px] flex flex-col gap-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-xs font-bold text-emerald-300 mb-2">
              <LayoutDashboard size={14} className="text-emerald-400" />
              <span>실시간 소통 광장</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">교육행정 업무 소통 게시판</h1>
            <p className="text-sm text-slate-400 mt-1">
              로그인 없이도 닉네임과 비밀번호로 자유롭게 실무 질의와 팁을 공유할 수 있습니다.
            </p>
          </div>

          <button 
            onClick={() => handleOpenWriteModal()} 
            className="btn-primary py-2.5 px-5 self-start md:self-auto text-xs font-bold"
          >
            <Plus size={16} />
            <span>글쓰기</span>
          </button>
        </div>

        {/* Board Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BOARDS.map((board) => {
            const isActive = activeBoard === board.id;
            return (
              <button
                key={board.id}
                onClick={() => {
                  setActiveBoard(board.id);
                  setActiveCategory("전체");
                }}
                className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${
                  isActive 
                    ? 'bg-slate-900 border-blue-500/60 shadow-lg shadow-blue-500/10' 
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center ${board.color}`}>
                    {board.icon}
                  </div>
                  <span className={`text-sm font-bold ${isActive ? 'text-white' : ''}`}>
                    {board.name}
                  </span>
                </div>
                {isActive && <span className="w-2 h-2 rounded-full bg-blue-400"></span>}
              </button>
            );
          })}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="게시글 검색..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Posts Table / List */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">게시글을 불러오는 중...</div>
        ) : filteredPosts.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {filteredPosts.map((post) => {
              const author = getAuthorDisplay(post.author_email);
              return (
                <div 
                  key={post.id}
                  onClick={() => handleOpenViewModal(post)}
                  className="glass-card p-4 md:p-5 flex items-center justify-between cursor-pointer group border-slate-800 hover:border-blue-500/40"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-blue-300 border border-slate-800 shrink-0">
                      {post.category || '일반'}
                    </span>
                    <span className="text-sm md:text-base font-bold text-slate-200 group-hover:text-blue-300 transition-colors truncate">
                      {post.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <div className="flex items-center gap-1.5">
                      {author.isOfficial ? (
                        <span className="text-[11px] font-black px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
                          👑 {author.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">
                          {author.name}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    <ChevronRight size={16} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 bg-slate-900/30 rounded-2xl border border-slate-800/60">
            등록된 게시물이 없습니다. 첫 번째 글을 작성해보세요!
          </div>
        )}

      </div>

      {/* View Post Modal */}
      {showViewModal && selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-950 border border-slate-800 p-6 md:p-8 max-w-[650px] w-full rounded-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-blue-500/15 text-blue-300">
                  {selectedPost.category}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(selectedPost.created_at).toLocaleString()}
                </span>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 leading-snug">
              {selectedPost.title}
            </h2>

            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-800/60 text-xs text-slate-400">
              <span>작성자:</span>
              <span className="font-bold text-slate-200">
                {getAuthorDisplay(selectedPost.author_email).name}
              </span>
            </div>

            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[140px]">
              {selectedPost.content}
            </div>

            <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-800">
              <button 
                onClick={() => handleDeletePost(selectedPost)}
                className="btn-ghost text-red-400 hover:text-red-300 text-xs flex items-center gap-1.5"
              >
                <Trash2 size={15} />
                <span>삭제하기</span>
              </button>

              <button 
                onClick={() => setShowViewModal(false)}
                className="btn-secondary py-2 px-5 text-xs font-bold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Write / Edit Modal */}
      {showWriteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-950 border border-slate-800 p-6 md:p-8 max-w-[600px] w-full rounded-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-lg font-bold text-white">
                {editingPostId ? '게시글 수정' : `새 글 작성 (${BOARDS.find(b => b.id === activeBoard)?.name})`}
              </h3>
              <button onClick={() => setShowWriteModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitPost} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">분류</label>
                  <select 
                    value={newPost.category}
                    onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.filter(c => c !== "전체").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {!user && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-300 mb-1.5 block">닉네임</label>
                      <input 
                        type="text" 
                        required
                        value={newPost.nickname}
                        onChange={(e) => setNewPost({...newPost, nickname: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        placeholder="홍길동"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 mb-1.5 block">비밀번호 (4자리)</label>
                      <input 
                        type="password" 
                        required
                        maxLength={8}
                        value={newPost.password}
                        onChange={(e) => setNewPost({...newPost, password: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        placeholder="****"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">제목</label>
                <input 
                  type="text" 
                  required
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="제목을 입력하세요"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">내용</label>
                <textarea 
                  rows={6}
                  required
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="내용을 작성하세요..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowWriteModal(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="btn-primary py-2 px-5 text-xs font-bold"
                >
                  {editingPostId ? '수정 완료' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
