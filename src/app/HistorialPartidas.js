'use client';

export default function HistorialPartidas({ partidas }) {
  if (!partidas || partidas.length === 0) {
    return <p style={{ color: '#94a3b8' }}>Aún no hay partidas oficiales registradas.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {partidas.map((p) => (
        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', padding: '0.75rem', background: '#0f172a', borderRadius: '0.5rem', border: '1px solid #334155' }}>
          <div>
            <strong>{p.blancas}</strong> <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>({p.cambio_blancas >= 0 ? `+${p.cambio_blancas}` : p.cambio_blancas})</span>
            <span style={{ margin: '0 0.6rem', color: '#f59e0b', fontWeight: 'bold' }}>{p.resultado}</span>
            <strong>{p.negras}</strong> <span style={{ color: '#f43f5e', fontWeight: 'bold' }}>({p.cambio_negras >= 0 ? `+${p.cambio_negras}` : p.cambio_negras})</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {new Date(p.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
      ))}
    </div>
  );
}
