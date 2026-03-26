export default function Nav() {
  return (
    <nav style={{
      height: 'var(--nav-h)',
      background: 'var(--charcoal)',
      borderBottom: '1px solid var(--panel-border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: '14px',
      flexShrink: 0,
      zIndex: 1000
    }}>
      <div style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: '20px',
        color: 'var(--white)',
        letterSpacing: '-0.3px'
      }}>
        NU<span style={{ color: 'var(--red)' }}>Campus</span>360
      </div>

      <div style={{
        fontSize: '11px',
        color: 'var(--text-dim)',
        background: 'var(--panel)',
        border: '1px solid var(--panel-border)',
        padding: '3px 9px',
        borderRadius: '20px',
        letterSpacing: '0.5px',
        textTransform: 'uppercase'
      }}>Seattle</div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '7px', height: '7px',
          background: 'var(--green)',
          borderRadius: '50%',
          boxShadow: '0 0 6px var(--green)',
          animation: 'pulse 2s infinite'
        }} />
        <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>AI Guide Online</span>
      </div>
    </nav>
  );
}
