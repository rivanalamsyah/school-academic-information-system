import React, { useState, useEffect, useCallback } from "react";
import {
  MessageSquare, ThumbsUp, Trash2, Plus, Search,
  ExternalLink, Tag, Send, X, BookOpen
} from "lucide-react";
import { User, ForumPost, ForumResource } from "../types";

interface DiscussionForumProps {
  user: User;
  showToast: (text: string, type: "success" | "warning" | "error" | "info") => void;
}

export function DiscussionForum({ user, showToast }: DiscussionForumProps) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  // New Post Form States
  const [isNewPostOpen, setIsNewPostOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newContent, setNewContent] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("Tanya Jawab");
  const [newResources, setNewResources] = useState<ForumResource[]>([{ name: "", url: "" }]);

  // Reply Form States (postId -> content string)
  const [replyContents, setReplyContents] = useState<Record<string, string>>({});
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

  const categories = [
    "Semua", "Matematika", "Bahasa Indonesia", "Bahasa Inggris", "Sains", "Sejarah",
    "Tanya Jawab", "Bahan Belajar", "Umum"
  ];

  // Fetch posts from API
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/forum");
      if (!res.ok) throw new Error("Gagal mengambil data forum");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
      showToast("Gagal memuat postingan forum.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Handle Create Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      showToast("Judul dan isi postingan wajib diisi.", "warning");
      return;
    }

    // Filter out blank resources
    const validResources = newResources.filter(r => r.name.trim() && r.url.trim());

    const payload = {
      title: newTitle,
      content: newContent,
      category: newCategory,
      resources: validResources,
      author: {
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    };

    try {
      const res = await fetch("/api/forum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": user.role,
          "x-user-id": user.id
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Gagal menyimpan postingan");
      const result = await res.json();

      if (result.success) {
        showToast("Postingan Anda berhasil dibagikan!", "success");
        setIsNewPostOpen(false);
        // Reset Form
        setNewTitle("");
        setNewContent("");
        setNewCategory("Tanya Jawab");
        setNewResources([{ name: "", url: "" }]);
        // Reload posts
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan saat membagikan postingan.", "error");
    }
  };

  // Add Dynamic Resource Field
  const addResourceField = () => {
    setNewResources([...newResources, { name: "", url: "" }]);
  };

  // Remove Dynamic Resource Field
  const removeResourceField = (index: number) => {
    const updated = [...newResources];
    updated.splice(index, 1);
    setNewResources(updated);
  };

  // Handle Resource Change
  const handleResourceChange = (index: number, field: "name" | "url", value: string) => {
    const updated = [...newResources];
    updated[index][field] = value;
    setNewResources(updated);
  };

  // Handle Toggle Upvote
  const handleToggleUpvote = async (postId: string) => {
    try {
      const res = await fetch(`/api/forum/${postId}/upvote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": user.role,
          "x-user-id": user.id
        },
        body: JSON.stringify({ userId: user.id })
      });

      if (!res.ok) throw new Error("Gagal upvote");
      const result = await res.json();

      if (result.success) {
        // Optimistically update the UI
        setPosts(posts.map(p => {
          if (p.id === postId) {
            return { ...p, upvotes: result.upvotes };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Create Reply
  const handleCreateReply = async (postId: string) => {
    const replyContent = replyContents[postId];
    if (!replyContent || !replyContent.trim()) return;

    const payload = {
      content: replyContent,
      author: {
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    };

    try {
      const res = await fetch(`/api/forum/${postId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": user.role,
          "x-user-id": user.id
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Gagal menyimpan balasan");
      const result = await res.json();

      if (result.success) {
        // Clear input
        setReplyContents({ ...replyContents, [postId]: "" });
        // Auto-expand replies to show the new one
        setExpandedReplies({ ...expandedReplies, [postId]: true });
        // Reload posts to update UI
        fetchPosts();
        showToast("Balasan terkirim!", "success");
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal mengirimkan balasan.", "error");
    }
  };

  // Handle Delete Post
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus postingan diskusi ini?")) return;

    try {
      const res = await fetch(`/api/forum/${postId}`, {
        method: "DELETE",
        headers: {
          "x-user-role": user.role,
          "x-user-id": user.id
        }
      });

      if (!res.ok) throw new Error("Gagal menghapus postingan");

      setPosts(posts.filter(p => p.id !== postId));
      showToast("Postingan berhasil dihapus.", "success");
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus postingan.", "error");
    }
  };

  // Handle Delete Reply
  const handleDeleteReply = async (postId: string, replyId: string) => {
    if (!window.confirm("Hapus balasan ini?")) return;

    try {
      const res = await fetch(`/api/forum/${postId}/reply/${replyId}`, {
        method: "DELETE",
        headers: {
          "x-user-role": user.role,
          "x-user-id": user.id
        }
      });

      if (!res.ok) throw new Error("Gagal menghapus balasan");

      // Reload posts
      fetchPosts();
      showToast("Balasan dihapus.", "success");
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus balasan.", "error");
    }
  };

  // Toggle replies expanded state
  const toggleReplies = (postId: string) => {
    setExpandedReplies({
      ...expandedReplies,
      [postId]: !expandedReplies[postId]
    });
  };

  // Filter & Search logic
  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === "Semua" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "super_admin": return "bg-red-50 text-red-700 border-red-100";
      case "admin": return "bg-blue-50 text-blue-700 border-blue-100";
      case "guru": return "bg-amber-50 text-amber-700 border-amber-100";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case "super_admin": return "Super Admin";
      case "admin": return "Admin";
      case "guru": return "Guru";
      default: return "Siswa";
    }
  };

  return (
    <div className="space-y-6" id="discussion-forum-root">

      {/* HEADER SECTION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2" id="forum-main-heading">
            <MessageSquare className="w-5 h-5 text-blue-600" /> Forum Diskusi & Resource Sharing
          </h3>
          <p className="text-xs text-slate-500 font-medium">Wadah tanya jawab materi pelajaran, koordinasi tugas, dan berbagi bahan referensi belajar interaktif antar siswa dan guru.</p>
        </div>
        <button
          onClick={() => setIsNewPostOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2 transition-all shrink-0 self-start md:self-auto"
          id="btn-new-discussion-post"
        >
          <Plus className="w-4 h-4" /> Mulai Diskusi Baru
        </button>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari topik diskusi, pertanyaan, atau nama pembuat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Clean selection categories counter */}
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
            Ditemukan: {filteredPosts.length} Topik
          </span>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap border ${selectedCategory === cat
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* NEW DISCUSSION POST MODAL / DRAWER */}
      {isNewPostOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95 duration-150">

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" /> Mulai Diskusi Akademik Baru
              </h4>
              <button
                onClick={() => setIsNewPostOpen(false)}
                className="w-7 h-7 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Judul / Pertanyaan Diskusi</label>
                <input
                  type="text"
                  placeholder="Misal: Cara cepat merasionalkan penyebut akar di Matematika?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Grid: Category & Tag */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Kategori Mata Pelajaran</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {categories.filter(c => c !== "Semua").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Content text */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Uraian / Isi Pertanyaan</label>
                <textarea
                  placeholder="Tuliskan pertanyaan, penjelasan tugas, atau materi diskusi Anda secara detail di sini..."
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Resources Sharing Section */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> Berbagi Academic Resources / Link (Opsional)
                  </span>
                  <button
                    type="button"
                    onClick={addResourceField}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                  >
                    + Tambah Link
                  </button>
                </div>

                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {newResources.map((res, idx) => (
                    <div key={idx} className="flex gap-2 items-center animate-in fade-in duration-100">
                      <input
                        type="text"
                        placeholder="Nama Bahan Belajar (contoh: PDF Catatan Fungsi)"
                        value={res.name}
                        onChange={(e) => handleResourceChange(idx, "name", e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-[11px] font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="Tautan URL Link (https://...)"
                        value={res.url}
                        onChange={(e) => handleResourceChange(idx, "url", e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-[11px] font-semibold font-mono"
                      />
                      {newResources.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeResourceField(idx)}
                          className="w-7 h-7 text-rose-500 hover:bg-rose-50 rounded-lg flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Form Button */}
              <button
                type="submit"
                className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" /> Bagikan Topik Ke Forum
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POSTS LIST */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-12 bg-slate-50 rounded" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700">Belum ada topik diskusi di kategori ini.</p>
          <p className="text-[11px] text-slate-400">Jadilah yang pertama untuk memulai percakapan atau membagikan referensi belajar!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const hasUpvoted = post.upvotes?.includes(user.id);
            const isAuthor = post.author.id === user.id;
            const isAdmin = user.role === "admin" || user.role === "super_admin";

            return (
              <div
                key={post.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 md:p-6 shadow-xs space-y-4 transition-all"
                id={`forum-post-${post.id}`}
              >

                {/* AUTHOR DETAILS & ACTION BAR */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author.avatar || "/default-avatar.png"}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-100 referrerPolicy='no-referrer'"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-extrabold text-slate-800">{post.author.name}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-wider font-mono ${getRoleBadgeColor(post.author.role)}`}>
                          {getRoleLabel(post.author.role)}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(post.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Right: Tag and optional Delete */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50/50 px-2.5 py-1 rounded-lg border border-blue-100/50">
                      <Tag className="w-3 h-3" /> {post.category}
                    </span>
                    {(isAuthor || isAdmin) && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center cursor-pointer transition-colors"
                        title="Hapus topik diskusi ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* POST CONTENT */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight leading-snug md:text-sm">
                    {post.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                    {post.content}
                  </p>
                </div>

                {/* ATTACHED ACADEMIC RESOURCES */}
                {post.resources && post.resources.length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                      Academic Resources yang Dibagikan:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {post.resources.map((res, rIdx) => (
                        <a
                          key={rIdx}
                          href={res.url.startsWith("http") ? res.url : `https://${res.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-500 rounded-lg text-[10px] font-bold text-slate-700 hover:text-blue-600 transition-all cursor-pointer group"
                        >
                          <span className="truncate max-w-[80%]">{res.name}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* FOOTER ACTIONS */}
                <div className="flex items-center gap-4 border-t border-slate-100 pt-3 flex-wrap">

                  {/* Upvote Toggle */}
                  <button
                    onClick={() => handleToggleUpvote(post.id)}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-colors ${hasUpvoted
                      ? "text-blue-600"
                      : "text-slate-500 hover:text-slate-800"
                      }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? "fill-blue-100" : ""}`} />
                    <span>Membantu ({post.upvotes?.length || 0})</span>
                  </button>

                  {/* Replies toggle */}
                  <button
                    onClick={() => toggleReplies(post.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Tanggapan ({post.replies?.length || 0})</span>
                  </button>
                </div>

                {/* EXPANDED REPLIES & RESPONSES BOX */}
                {expandedReplies[post.id] && (
                  <div className="border-t border-slate-100 pt-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-150">

                    {/* Nested replies list */}
                    {post.replies && post.replies.length > 0 && (
                      <div className="space-y-3 pl-3 border-l-2 border-slate-100">
                        {post.replies.map((reply) => {
                          const isReplyAuthor = reply.author.id === user.id;
                          return (
                            <div key={reply.id} className="bg-slate-50/70 p-3.5 rounded-xl space-y-1.5 relative group">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={reply.author.avatar || "/default-avatar.png"}
                                    className="w-6 h-6 rounded-full object-cover"
                                    alt="avatar"
                                  />
                                  <span className="text-[11px] font-extrabold text-slate-800">{reply.author.name}</span>
                                  <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold border uppercase tracking-wider font-mono ${getRoleBadgeColor(reply.author.role)}`}>
                                    {getRoleLabel(reply.author.role)}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] text-slate-400 font-mono">
                                    {new Date(reply.createdAt).toLocaleDateString('id-ID', {
                                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                    })}
                                  </span>
                                  {(isReplyAuthor || isAdmin) && (
                                    <button
                                      onClick={() => handleDeleteReply(post.id, reply.id)}
                                      className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-rose-50 rounded cursor-pointer"
                                      title="Hapus tanggapan ini"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                {reply.content}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Write new reply row */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Tuliskan tanggapan atau jawaban penjelasan akademik Anda di sini..."
                        value={replyContents[post.id] || ""}
                        onChange={(e) => setReplyContents({ ...replyContents, [post.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateReply(post.id);
                        }}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleCreateReply(post.id)}
                        disabled={!replyContents[post.id]?.trim()}
                        className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
