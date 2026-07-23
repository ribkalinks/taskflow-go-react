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

  // Fetch tasks dari backend Go
  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Gagal mengambil data task:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      title,
      done: false,
    };

    try {
      const res = await fetch('http://localhost:8080/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      if (res.ok) {
        setTitle('');
        fetchTasks();
      }
    } catch (err) {
      console.error("Gagal menambah task:", err);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>TaskFlow Full-Stack</h1>
      
      <form onSubmit={addTask} style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Tambah task baru..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: '0.5rem', width: '70%', marginRight: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Simpan</button>
      </form>

      <ul>
        {tasks.map((task) => (
          <li key={task.id} style={{ marginBottom: '0.5rem' }}>
            <span style={{ textDecoration: task.done ? 'line-through' : 'none' }}>
              {task.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
