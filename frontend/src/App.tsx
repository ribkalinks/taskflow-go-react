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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks dari backend Go dengan indikator loading & error
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

  // Fungsi hapus task (DELETE)
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

  // Menghitung just task yang belum selesai
  const unresolvedTaskCount = tasks.filter((task) => !task.done).length;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>TaskFlow Full-Stack</h1>

      {/* Form Tambah Task */}
      <form onSubmit={addTask} style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Tambah task baru..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Simpan</button>
      </form>

      {/* Indikator Loading & Error */}
      {loading && <p style={{ color: '#666' }}>Memuat data...</p>}
      {error && <p style={{ color: '#ff4d4f' }}>{error}</p>}

      <p style={{ color: '#555', marginBottom: '1rem' }}>
  Task belum selesai: {unresolvedTaskCount}
</p>

      {/* Daftar Task */}
      {!loading && !error && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tasks.map((task) => (
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
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
