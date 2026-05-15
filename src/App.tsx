/* eslint-disable @typescript-eslint/indent */
/* eslint-disable max-len */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import Main from './components/Main';
import Footer from './components/Footer';
import ErrorNotification from './components/ErrorNotification';

type Todo = {
  id: number | string;
  title: string;
  completed: boolean;
  loading?: boolean;
};

type FilterState = 'all' | 'active' | 'completed';

const useTimeout = () => {
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const saved = timers.current;

    return () => saved.forEach(t => clearTimeout(t));
  }, []);

  const set = useCallback((cb: () => void, ms: number) => {
    const id = window.setTimeout(cb, ms);

    timers.current.push(id);

    return id;
  }, []);

  return set;
};

export const App: React.FC = () => {
  const userRaw =
    typeof window !== 'undefined' ? window.localStorage.getItem('user') : null;
  const user = userRaw ? JSON.parse(userRaw) : null;
  const userId = user?.id;

  const [filterState, setFilterState] = useState<FilterState>('all');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const newInputRef = useRef<HTMLInputElement | null>(null);
  const setTimeoutSafe = useTimeout();

  useEffect(() => {
    setTimeout(() => newInputRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => newInputRef.current?.focus(), 0);
    }
  }, [loading]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);

      return;
    }

    const controller = new AbortController();

    fetch(`/todos?userId=${userId}`, { signal: controller.signal })
      .then(async res => {
        if (!res.ok) {
          throw new Error('Unable to load');
        }

        const body = await res.json();

        setTodos(Array.isArray(body) ? body : []);

        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError('Unable to load todos');
        setTimeoutSafe(() => setError(null), 3000);
      });

    return () => controller.abort();
  }, [userId, setTimeoutSafe]);

  const activeCount = todos.filter(t => !t.completed && !t.loading).length;

  const completedCount = todos.filter(t => t.completed).length;

  const createTodo = (titleRaw: string) => {
    const title = titleRaw.trim();

    if (!title) {
      setError('Title should not be empty');
      setTimeoutSafe(() => setError(null), 3000);

      return;
    }

    const tempId = `temp-${Date.now()}`;
    const temp: Todo = { id: tempId, title, completed: false, loading: true };

    setTodos(prev => [...prev, temp]);
    setCreating(true);
    if (newInputRef.current) {
      newInputRef.current.disabled = true;
    }

    setTimeoutSafe(() => {
      fetch('/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, userId }),
      })
        .then(async res => {
          if (!res.ok) {
            throw new Error('Unable to add');
          }

          const body = await res.json();

          setTodos(prev =>
            prev.map(t => (t.id === tempId ? { ...body, loading: false } : t)),
          );

          setNewTitle('');

          setCreating(false);

          if (newInputRef.current) {
            newInputRef.current.disabled = false;
            // clear the real DOM value immediately to avoid races with rapid typing in tests
            try {
              // keep React state in sync
              newInputRef.current.value = '';
            } catch (e) {
              // ignore
            }

            newInputRef.current.focus();
          }
        })
        .catch(() => {
          setTodos(prev => prev.filter(t => t.id !== tempId));
          setError('Unable to add a todo');
          setTimeoutSafe(() => setError(null), 3000);
          setNewTitle(titleRaw);
          setCreating(false);
          if (newInputRef.current) {
            newInputRef.current.disabled = false;
            newInputRef.current.focus();
          }
        });
    }, 500);
  };

  const deleteTodo = (id: number | string) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, loading: true } : t)),
    );

    setTimeoutSafe(() => {
      fetch(`/todos/${id}`, { method: 'DELETE' })
        .then(async res => {
          if (!res.ok) {
            throw new Error('Unable to delete');
          }

          setTodos(prev => prev.filter(t => t.id !== id));

          setTimeoutSafe(() => newInputRef.current?.focus(), 0);
        })
        .catch(() => {
          setTodos(prev =>
            prev.map(t => (t.id === id ? { ...t, loading: false } : t)),
          );
          setError('Unable to delete a todo');
          setTimeoutSafe(() => setError(null), 3000);
        });
    }, 0);
  };

  const toggleTodo = (id: number | string) => {
    const target = todos.find(t => t.id === id);

    if (!target) {
      return;
    }

    const newCompleted = !target.completed;

    // optimistic
    setTodos(prev =>
      prev.map(t =>
        t.id === id ? { ...t, completed: newCompleted, loading: true } : t,
      ),
    );

    fetch(`/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: newCompleted }),
    })
      .then(async res => {
        if (!res.ok) {
          throw new Error('Unable to update');
        }

        const body = await res.json();

        setTodos(prev =>
          prev.map(t => (t.id === id ? { ...t, ...body, loading: false } : t)),
        );
      })
      .catch(() => {
        setTodos(prev =>
          prev.map(t =>
            t.id === id
              ? { ...t, completed: target.completed, loading: false }
              : t,
          ),
        );
        setError('Unable to update a todo');
        setTimeoutSafe(() => setError(null), 3000);
      });
  };

  if (loading) {
    return (
      <section className="section container">
        <h1 className="todoapp__title">Todos</h1>
      </section>
    );
  }

  const visibleTodos = todos.filter(t => {
    if (filterState === 'all') {
      return true;
    }

    if (filterState === 'active') {
      return !t.completed;
    }

    return t.completed;
  });

  return (
    <section className="section container todoapp">
      <div className="box">
        <Header
          onAdd={v => createTodo(v)}
          newTodoTitle={newTitle}
          setNewTodoTitle={setNewTitle}
          isAdding={creating || todos.some(t => t.loading)}
          inputRef={newInputRef}
        />

        <ErrorNotification
          errorMessage={error}
          onClose={() => setError(null)}
        />

        <Main
          visibleTodos={visibleTodos}
          onDelete={deleteTodo}
          onUpdate={toggleTodo}
          editingId={null}
          setEditingId={() => {}}
          loadingIds={todos.filter(t => t.loading).map(t => t.id)}
        />

        {todos.length > 0 && (
          <Footer
            activeCount={activeCount}
            completedCount={completedCount}
            filter={filterState}
            setFilter={f => setFilterState(f)}
            onClearCompleted={() => {
              todos.filter(t => t.completed).forEach(t => deleteTodo(t.id));
            }}
          />
        )}
      </div>
    </section>
  );
};
