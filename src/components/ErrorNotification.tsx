import React from 'react';

interface Props {
  errorMessage: string | null;
  onClose: () => void;
}

export const ErrorNotification: React.FC<Props> = ({
  errorMessage,
  onClose,
}) => {
  return (
    <div data-cy="ErrorNotification" className={errorMessage ? '' : 'hidden'}>
      <span>{errorMessage}</span>
      <button
        data-cy="HideErrorButton"
        type="button"
        aria-label="Close"
        onClick={onClose}
        style={{ padding: '4px 6px' }}
      />
    </div>
  );
};

export default ErrorNotification;
