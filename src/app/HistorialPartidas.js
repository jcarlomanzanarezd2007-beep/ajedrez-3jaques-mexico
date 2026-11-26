'use client';
import { useState } from 'react';

export default function HistorialPartidas({ partidas }) {
  const [filtro, setFiltro] = useState('');

  if (!partidas || partidas.length === 0) {
    return <p style={{ color: '#94a3b8' }}>Aún no hay partidas oficiales registradas.</p>;
  }

  const terminos = filtro.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const filtradas = partidas.filter((p) => {
    const textoPartida = `${p.blancas} ${p.negras}`.toLowerCase();
    return terminos.every((t) => textoPartida.includes(t));
  });

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="🔍 Filtrar partidas por jugador (o escribe 2 nombres para ver duelos entre ellos)..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.9rem', borderRadius: '0.5rem', border: '1px solid #475569', background: '#0f172a', color: '#fff', fontSize: '0.9rem' }}
        />
      </div>

      {filtradas.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>No se encontraron partidas con "{filtro}".</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {filtradas.map((p) => (
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
      )}
    </div>
  );
}
