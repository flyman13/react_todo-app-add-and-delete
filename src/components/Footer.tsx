import React from 'react';
import classNames from 'classnames';
import FilterStatus from '../types/FilterStatus';

interface Props {
  activeCount: number;
  completedCount: number;
  filter: FilterStatus;
  setFilter: (f: FilterStatus) => void;
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
        <ul className="filters">
          {Object.values(FilterStatus).map(f => (
            <li key={f}>
              <button
                data-cy={`FilterLink${f[0].toUpperCase() + f.slice(1)}`}
                className={classNames({ selected: filter === f })}
                onClick={() => setFilter(f)}
                onMouseDown={() => setFilter(f)}
                type="button"
              >
                {f[0].toUpperCase() + f.slice(1)}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button
        data-cy="ClearCompletedButton"
        className="clear-completed"
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
