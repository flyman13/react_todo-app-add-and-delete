import React from 'react';
// classNames not required in header

interface Props {
  onAdd: (title: string) => void;
  newTodoTitle: string;
  setNewTodoTitle: (v: string) => void;
  isAdding: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}

export const Header: React.FC<Props> = ({
  onAdd,
  newTodoTitle,
  setNewTodoTitle,
  isAdding,
  inputRef,
}) => {
  return (
    <header className="header">
      <h1 className="todoapp__title">Todos</h1>

      <form
        onSubmit={e => {
          e.preventDefault();
          onAdd(newTodoTitle);
        }}
      >
        <label htmlFor="new-todo" className="visually-hidden">
          Add todo
        </label>

        <input
          id="new-todo"
          data-cy="NewTodoField"
          ref={inputRef}
          value={newTodoTitle}
          onChange={e => setNewTodoTitle(e.target.value)}
          disabled={isAdding}
        />
      </form>
    </header>
  );
};

export default Header;
