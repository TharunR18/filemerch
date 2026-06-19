import { useState } from 'react';

const UserAvatar = ({ user, className = '', size = 40 }) => {
  const [error, setError] = useState(false);

  const initial = user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U';

  const hasAvatar = user?.avatar_url && 
    !user.avatar_url.includes('default-user-icon') && 
    !user.avatar_url.includes('/a/default') &&
    !error;

  if (hasAvatar) {
    return (
      <img
        src={user.avatar_url}
        alt={user.name || 'User'}
        className={className}
        style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', objectFit: 'cover' }}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div
      className={`${className}-placeholder`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        background: 'var(--color-primary-muted)',
        color: 'var(--color-primary)',
        fontSize: size > 48 ? '1.5rem' : size >= 40 ? '1.1rem' : '0.8rem'
      }}
    >
      {initial}
    </div>
  );
};

export default UserAvatar;
