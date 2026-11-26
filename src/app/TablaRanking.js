'use client';
import { useState } from 'react';

export default function TablaRanking({ jugadores, cargando, esAdmin, onEliminar }) {
  const [busqueda, setBusqueda] = useState('');

  if (cargando) return <p style={{ color: '#94a3b8' }}>Cargando ranking...</p>;
  if (jugadores.length === 0) return <p style={{ color: '#94a3b8' }}>Aún no hay jugadores registrados.</p>;

  // Guardamos el puesto real (#) antes de filtrar
  const jugadoresConPuesto = jugadores.map((j, index) => ({ ...j, puesto: index + 1 }));
  const filtrados = jugadoresConPuesto.filter((j) =>
    j.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      {/* Barra de búsqueda */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="🔍 Buscar jugador por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '0.65rem 0.9rem',
            borderRadius: '0.5rem',
            border: '1px solid #475569',
            background: '#0f172a',
            color: '#fff',
            fontSize: '0.95rem'
          }}
        />
      </div>

      {filtrados.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>No se encontró ningún jugador con "{busqueda}".</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: esAdmin ? '50px 1fr 120px 120px 80px' : '50px 1fr 120px 120px', padding: '0.75rem', borderBottom: '1px solid #334155', color: '#94a3b8', fontWeight: 'bold' }}>
            <div>#</div>
            <div>Jugador</div>
            <div>Elo 3-Jaques</div>
            <div>Partidas</div>
            {esAdmin && <div style={{ textAlign: 'right' }}>Borrar</div>}
          </div>
          {filtrados.map((j) => (
            <div key={j.id} style={{ display: 'grid', gridTemplateColumns: esAdmin ? '50px 1fr 120px 120px 80px' : '50px 1fr 120px 120px', padding: '0.75rem', borderBottom: '1px solid #334155', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold', color: j.puesto === 1 ? '#f59e0b' : '#cbd5e1' }}>{j.puesto}</div>
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
      )}
    </div>
  );
}
