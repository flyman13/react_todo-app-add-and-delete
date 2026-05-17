import React from 'react';
import classNames from 'classnames';

interface TodoItem {
  id: number | string;
  title: string;
  completed: boolean;
  loading?: boolean;
}

interface Props {
  visibleTodos: TodoItem[];
  onDelete: (id: number | string) => void;
  onUpdate: (id: number | string) => void;
  editingId: number | string | null;
  setEditingId: (id: number | string | null) => void;
  loadingIds: Array<number | string>;
}

export const Main: React.FC<Props> = ({ visibleTodos, onDelete, onUpdate }) => {
  return (
    <section className="main">
      <ul className="todo-list">
        {visibleTodos.map(t => (
          <li
            key={String(t.id)}
            data-cy="Todo"
            className={classNames('todo', { completed: t.completed })}
          >
            <input
              data-cy="TodoStatus"
              className="toggle"
              id={`todo-status-${t.id}`}
              type="checkbox"
              checked={t.completed}
              onChange={() => onUpdate(t.id)}
            />

            <label htmlFor={`todo-status-${t.id}`} className="todo-title">
              <span data-cy="TodoTitle">{t.title}</span>
            </label>

            <button
              data-cy="TodoDelete"
              className="destroy"
              type="button"
              onClick={() => onDelete(t.id)}
              aria-label={`Delete ${t.title}`}
            />

            <span
              data-cy="TodoLoader"
              className={classNames('loader', { 'is-active': t.loading })}
            >
              loading
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Main;
