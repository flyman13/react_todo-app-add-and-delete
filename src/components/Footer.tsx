import React from 'react';
import classNames from 'classnames';

interface Props {
  activeCount: number;
  completedCount: number;
  filter: 'all' | 'active' | 'completed';
  setFilter: (f: 'all' | 'active' | 'completed') => void;
  onClearCompleted: () => void;
}

export const Footer: React.FC<Props> = ({
  activeCount,
  completedCount,
  filter,
  setFilter,
  onClearCompleted,
}) => {
  return (
    <footer className="footer">
      <div data-cy="TodosCounter">
        {activeCount} {activeCount === 1 ? 'item' : 'items'} left
      </div>

      <div data-cy="Filter">
        <button
          data-cy="FilterLinkAll"
          className={classNames({ selected: filter === 'all' })}
          onClick={() => setFilter('all')}
          onMouseDown={() => setFilter('all')}
          type="button"
        >
          All
        </button>

        <button
          data-cy="FilterLinkActive"
          className={classNames({ selected: filter === 'active' })}
          onClick={() => setFilter('active')}
          onMouseDown={() => setFilter('active')}
          type="button"
        >
          Active
        </button>

        <button
          data-cy="FilterLinkCompleted"
          className={classNames({ selected: filter === 'completed' })}
          onClick={() => setFilter('completed')}
          onMouseDown={() => setFilter('completed')}
          type="button"
        >
          Completed
        </button>
      </div>

      <button
        data-cy="ClearCompletedButton"
        type="button"
        disabled={completedCount === 0}
        onClick={onClearCompleted}
      >
        Clear completed
      </button>
    </footer>
  );
};

export default Footer;
