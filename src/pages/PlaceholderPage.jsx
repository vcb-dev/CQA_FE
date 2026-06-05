import { HardHat } from '@phosphor-icons/react';

export default function PlaceholderPage({ title, icon: Icon = HardHat }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '16px',
        color: 'var(--color-neutral-400)',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          background: 'var(--color-primary-50)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={40} weight="duotone" style={{ color: 'var(--color-primary-300)' }} />
      </div>
      <h2 style={{ fontSize: '21px', fontWeight: 600, color: 'var(--color-neutral-700)' }}>
        {title}
      </h2>
      <p style={{ fontSize: '15px', color: 'var(--color-neutral-400)' }}>
        Trang này đang được phát triển...
      </p>
    </div>
  );
}
