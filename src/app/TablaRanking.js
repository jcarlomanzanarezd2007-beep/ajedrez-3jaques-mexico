'use client';

export default function TablaRanking({ jugadores, cargando, esAdmin, onEliminar }) {
  if (cargando) return <p style={{ color: '#94a3b8' }}>Cargando ranking...</p>;
  if (jugadores.length === 0) return <p style={{ color: '#94a3b8' }}>Aún no hay jugadores registrados.</p>;

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: esAdmin ? '50px 1fr 120px 120px 80px' : '50px 1fr 120px 120px', padding: '0.75rem', borderBottom: '1px solid #334155', color: '#94a3b8', fontWeight: 'bold' }}>
        <div>#</div>
        <div>Jugador</div>
        <div>Elo 3-Jaques</div>
        <div>Partidas</div>
        {esAdmin && <div style={{ textAlign: 'right' }}>Borrar</div>}
      </div>
      {jugadores.map((j, i) => (
        <div key={j.id} style={{ display: 'grid', gridTemplateColumns: esAdmin ? '50px 1fr 120px 120px 80px' : '50px 1fr 120px 120px', padding: '0.75rem', borderBottom: '1px solid #334155', alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold', color: i === 0 ? '#f59e0b' : '#cbd5e1' }}>{i + 1}</div>
          <div style={{ fontWeight: '500' }}>{j.nombre}</div>
          <div style={{ fontWeight: 'bold', color: '#38bdf8' }}>{j.elo}</div>
          <div style={{ color: '#94a3b8' }}>{j.partidas || 0} (K={(j.partidas || 0) < 30 ? 40 : 20})</div>
          {esAdmin && (
            <div style={{ textAlign: 'right' }}>
              <button onClick={() => onEliminar(j.id, j.nombre)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>✕</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
