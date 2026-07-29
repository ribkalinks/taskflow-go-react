import { useEffect, useState } from 'react';
import './App.css';

interface Task {
  id: string;
  title: string;
  done: boolean;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Fetch tasks dari backend Go
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('http://localhost:8080/api/tasks');
      if (!res.ok) {
        throw new Error("Gagal mengambil data dari server");
      }
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Gagal mengambil data task:", err);
      setError("Tidak dapat terhubung ke server backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Fungsi tambah task (POST)
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      title: title,
      done: false,
    };

    try {
      const res = await fetch('http://localhost:8080/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      if (res.ok) {
        setTasks([...tasks, newTask]);
        setTitle('');
      }
    } catch (err) {
      console.error("Gagal menambah task:", err);
    }
  };

  // Fungsi toggle status selesai (PUT)
  const toggleTask = async (id: string, currentDone: boolean) => {
    try {
      const res = await fetch(`http://localhost:8080/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: !currentDone }),
      });

      if (res.ok) {
        setTasks(
          tasks.map((task) =>
            task.id === id ? { ...task, done: !currentDone } : task
          )
        );
      }
    } catch (err) {
      console.error("Gagal mengubah status task:", err);
    }
  };

  // Fungsi hapus task tunggal (DELETE)
  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setTasks(tasks.filter((task) => task.id !== id));
      }
    } catch (err) {
      console.error("Gagal menghapus task:", err);
    }
  };

  // Fungsi baru: Menghapus semua task yang sudah selesai
  const clearCompletedTasks = async () => {
    const completedTasks = tasks.filter((task) => task.done);
    try {
      // Hapus satu per satu dari backend (atau buat endpoint khusus batch delete jika ada)
      await Promise.all(
        completedTasks.map((task) =>
          fetch(`http://localhost:8080/api/tasks/${task.id}`, { method: 'DELETE' })
        )
      );
      setTasks(tasks.filter((task) => !task.done));
    } catch (err) {
      console.error("Gagal membersihkan task selesai:", err);
    }
  };

  // Menghitung task yang belum selesai
  const unresolvedTaskCount = tasks.filter((task) => !task.done).length;

  // Logika Filter Status + Pencarian Teks
  const filteredTasks = tasks
    .filter((task) => {
      if (filter === 'active') return !task.done;
      if (filter === 'completed') return task.done;
      return true; // 'all'
    })
    .filter((task) => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>TaskFlow Full-Stack</h1>

      {/* Form Tambah Task */}
      <form onSubmit={addTask} style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Tambah task baru..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Simpan</button>
      </form>

      {/* Input Pencarian */}
      <input
        type="text"
        placeholder="Cari task..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1.5rem', boxSizing: 'border-box' }}
      />

      {/* Indikator Loading & Error */}
      {loading && <p style={{ color: '#666' }}>Memuat data...</p>}
      {error && <p style={{ color: '#ff4d4f' }}>{error}</p>}

      {/* Informasi Jumlah Task & Tombol Clear */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p style={{ color: '#555', margin: 0 }}>
          Task belum selesai: {unresolvedTaskCount}
        </p>
        {tasks.some((task) => task.done) && (
          <button
            onClick={clearCompletedTasks}
            style={{ background: 'transparent', color: '#007bff', border: 'none', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}
          >
            Hapus yang Selesai
          </button>
        )}
      </div>

      {/* Tombol Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button 
          onClick={() => setFilter('all')}
          style={{ background: filter === 'all' ? '#007bff' : '#eee', color: filter === 'all' ? '#fff' : '#000', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}
        >
          Semua
        </button>
        <button 
          onClick={() => setFilter('active')}
          style={{ background: filter === 'active' ? '#007bff' : '#eee', color: filter === 'active' ? '#fff' : '#000', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}
        >
          Belum Selesai
        </button>
        <button 
          onClick={() => setFilter('completed')}
          style={{ background: filter === 'completed' ? '#007bff' : '#eee', color: filter === 'completed' ? '#fff' : '#000', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}
        >
          Selesai
        </button>
      </div>

      {/* Daftar Task */}
      {!loading && !error && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredTasks.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic' }}>Tidak ada task yang ditemukan.</p>
          ) : (
            filteredTasks.map((task) => (
              <li
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid #ddd',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(task.id, task.done)}
                  />
                  <span style={{ textDecoration: task.done ? 'line-through' : 'none', color: task.done ? '#888' : '#000' }}>
                    {task.title}
                  </span>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  style={{ background: '#ff4d4f', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', cursor: 'pointer', borderRadius: '4px' }}
                >
                  Hapus
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default App;
