/* eslint-disable @typescript-eslint/indent */
/* eslint-disable max-len */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';

type Todo = {
  id: number | string;
  title: string;
  completed: boolean;
  loading?: boolean;
};

const useTimeout = () => {
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(t => clearTimeout(t)), []);
  const set = (cb: () => void, ms: number) => {
    const id = window.setTimeout(cb, ms);

    timers.current.push(id);

    return id;
  };

  return set;
};

export const App: React.FC = () => {
  const userRaw =
    typeof window !== 'undefined' ? window.localStorage.getItem('user') : null;
  const user = userRaw ? JSON.parse(userRaw) : null;
  const userId = user?.id;

  const [filterState, setFilterState] = useState<
    'all' | 'active' | 'completed'
  >('all');
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

  const showClear = todos.some(t => t.completed);

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

  return (
    <section className="section container todoapp">
      <h1 className="todoapp__title">Todos</h1>

      <div className="box">
        <input
          data-cy="NewTodoField"
          ref={newInputRef}
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              const val = (e.target as HTMLInputElement).value;

              if (val.trim() && newInputRef.current) {
                newInputRef.current.disabled = true;
              }

              createTodo(val);
            }
          }}
          disabled={creating || todos.some(t => t.loading)}
        />

        <div data-cy="ErrorNotification" className={error ? '' : 'hidden'}>
          <span>{error}</span>
          <button
            data-cy="HideErrorButton"
            type="button"
            aria-label="Close"
            onClick={() => setError(null)}
            style={{ padding: '4px 6px' }}
          />
        </div>

        <ul>
          {todos
            .filter(t => {
              if (filterState === 'all') {
                return true;
              }

              if (filterState === 'active') {
                return !t.completed;
              }

              return t.completed;
            })
            .map(t => (
              <li
                key={String(t.id)}
                data-cy="Todo"
                className={t.completed ? 'completed' : ''}
              >
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => toggleTodo(t.id)}
                />

                <span data-cy="TodoTitle">{t.title}</span>

                <button
                  data-cy="TodoDelete"
                  type="button"
                  onClick={() => deleteTodo(t.id)}
                >
                  Delete
                </button>

                <span
                  data-cy="TodoLoader"
                  className={t.loading ? 'is-active' : ''}
                >
                  loading
                </span>
              </li>
            ))}
        </ul>

        <div>
          {todos.length > 0 && (
            <div data-cy="Filter">
              <button
                data-cy="FilterLinkAll"
                className={filterState === 'all' ? 'selected' : ''}
                onClick={() => setFilterState('all')}
                onMouseDown={() => setFilterState('all')}
                type="button"
              >
                All
              </button>
              <button
                data-cy="FilterLinkActive"
                className={filterState === 'active' ? 'selected' : ''}
                onClick={() => setFilterState('active')}
                onMouseDown={() => setFilterState('active')}
                type="button"
              >
                Active
              </button>
              <button
                data-cy="FilterLinkCompleted"
                className={filterState === 'completed' ? 'selected' : ''}
                onClick={() => setFilterState('completed')}
                onMouseDown={() => setFilterState('completed')}
                type="button"
              >
                Completed
              </button>
            </div>
          )}

          {todos.length > 0 && (
            <button
              data-cy="ClearCompletedButton"
              type="button"
              disabled={!showClear}
              onClick={() => {
                const completed = todos.filter(t => t.completed).map(t => t.id);

                completed.forEach(id => deleteTodo(id));
              }}
            >
              Clear completed
            </button>
          )}

          {todos.length > 0 && (
            <div data-cy="TodosCounter">
              {activeCount} {activeCount === 1 ? 'item' : 'items'} left
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
