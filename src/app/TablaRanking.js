'use client';
import { useState } from 'react';

const TITULOS = ['GM', 'IM', 'FM', 'CM', 'WGM', 'WIM', 'WFM', 'WCM', 'MN'];

export default function TablaRanking({ jugadores, partidas = [], cargando, esAdmin, onEliminar, onCambiarTitulo }) {
  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);

  if (cargando) return <p style={{ color: '#94a3b8' }}>Cargando ranking...</p>;
  if (jugadores.length === 0) return <p style={{ color: '#94a3b8' }}>Aún no hay jugadores registrados.</p>;

  const jugadoresConPuesto = jugadores.map((j, index) => ({ ...j, puesto: index + 1 }));
  const top3 = jugadoresConPuesto.slice(0, 3);
  const filtrados = jugadoresConPuesto.filter((j) =>
    j.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  function obtenerMedalla(puesto) {
    if (puesto === 1) return '🥇';
    if (puesto === 2) return '🥈';
    if (puesto === 3) return '🥉';
    return puesto;
  }

  function renderTitulo(titulo) {
    if (!titulo) return null;
    return (
      <span style={{ background: '#78350f', color: '#fbbf24', border: '1px solid #f59e0b', fontSize: '0.72rem', fontWeight: 'bold', padding: '0.1rem 0.35rem', borderRadius: '0.3rem', marginRight: '0.45rem' }}>
        {titulo}
      </span>
    );
  }

  function obtenerEstadisticas(nombreJugador) {
    let victorias = 0, empates = 0, derrotas = 0;
    const historial = partidas.filter((p) => p.blancas === nombreJugador || p.negras === nombreJugador);

    historial.forEach((p) => {
      const esBlancas = p.blancas === nombreJugador;
      if (p.resultado === '½ - ½') empates++;
      else if ((esBlancas && p.resultado === '1 - 0') || (!esBlancas && p.resultado === '0 - 1')) victorias++;
      else derrotas++;
    });

    let rachaTexto = 'Sin partidas';
    if (historial.length > 0) {
      const primera = historial[0];
      const tipoPrimero = primera.resultado === '½ - ½'
        ? 'E'
        : ((primera.blancas === nombreJugador && primera.resultado === '1 - 0') || (primera.negras === nombreJugador && primera.resultado === '0 - 1'))
          ? 'V' : 'D';
      let conteo = 0;
      for (const p of historial) {
        const tipo = p.resultado === '½ - ½'
          ? 'E'
          : ((p.blancas === nombreJugador && p.resultado === '1 - 0') || (p.negras === nombreJugador && p.resultado === '0 - 1'))
            ? 'V' : 'D';
        if (tipo === tipoPrimero) conteo++;
        else break;
      }
      rachaTexto = tipoPrimero === 'V' ? `🔥 ${conteo} Victoria${conteo > 1 ? 's' : ''}` : tipoPrimero === 'E' ? `🤝 ${conteo} Empate${conteo > 1 ? 's' : ''}` : `❄️ ${conteo} Derrota${conteo > 1 ? 's' : ''}`;
    }

    const total = victorias + empates + derrotas;
    const efectividad = total > 0 ? Math.round(((victorias + empates * 0.5) / total) * 100) : 0;
    return { victorias, empates, derrotas, rachaTexto, efectividad };
  }

  const stats = seleccionado ? obtenerEstadisticas(seleccionado.nombre) : null;

  return (
    <div>
      {!busqueda && top3.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {top3.map((j) => {
            const borde = j.puesto === 1 ? '#f59e0b' : j.puesto === 2 ? '#94a3b8' : '#b45309';
            return (
              <div key={j.id} onClick={() => setSeleccionado(j)} style={{ background: '#0f172a', border: `1px solid ${borde}`, borderRadius: '0.65rem', padding: '0.9rem', textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>{obtenerMedalla(j.puesto)}</div>
                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '0.2rem' }}>{renderTitulo(j.titulo)}{j.nombre}</div>
                <div style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '1.05rem' }}>{j.elo} Elo</div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <input type="text" placeholder="🔍 Buscar jugador por nombre (haz clic para ver estadísticas)..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.9rem', borderRadius: '0.5rem', border: '1px solid #475569', background: '#0f172a', color: '#fff', fontSize: '0.95rem' }} />
      </div>

      {seleccionado && stats && (
        <div style={{ background: '#0f172a', border: '1px solid #38bdf8', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <span style={{ color: '#f59e0b', fontWeight: 'bold', marginRight: '0.5rem' }}>{obtenerMedalla(seleccionado.puesto)}</span>
              {renderTitulo(seleccionado.titulo)}
              <strong style={{ fontSize: '1.15rem' }}>{seleccionado.nombre}</strong>
              <span style={{ marginLeft: '0.75rem', color: '#38bdf8', fontWeight: 'bold' }}>{seleccionado.elo} Elo</span>
            </div>
            <button onClick={() => setSeleccionado(null)} style={{ background: '#1e293b', border: '1px solid #475569', color: '#cbd5e1', borderRadius: '0.4rem', padding: '0.25rem 0.6rem', cursor: 'pointer' }}>Cerrar ✕</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem', textAlign: 'center' }}>
            <div style={{ background: '#1e293b', padding: '0.6rem', borderRadius: '0.5rem' }}><div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Victorias</div><div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>{stats.victorias}</div></div>
            <div style={{ background: '#1e293b', padding: '0.6rem', borderRadius: '0.5rem' }}><div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Empates</div><div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.empates}</div></div>
            <div style={{ background: '#1e293b', padding: '0.6rem', borderRadius: '0.5rem' }}><div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Derrotas</div><div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ef4444' }}>{stats.derrotas}</div></div>
            <div style={{ background: '#1e293b', padding: '0.6rem', borderRadius: '0.5rem' }}><div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Efectividad</div><div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#38bdf8' }}>{stats.efectividad}%</div></div>
            <div style={{ background: '#1e293b', padding: '0.6rem', borderRadius: '0.5rem' }}><div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Racha Actual</div><div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#f8fafc', marginTop: '0.2rem' }}>{stats.rachaTexto}</div></div>
          </div>
        </div>
      )}

      {filtrados.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>No se encontró ningún jugador con "{busqueda}".</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: esAdmin ? '50px 1fr 120px 120px 130px' : '50px 1fr 120px 120px', padding: '0.75rem', borderBottom: '1px solid #334155', color: '#94a3b8', fontWeight: 'bold' }}>
            <div>#</div>
            <div>Jugador</div>
            <div>Elo 3-Jaques</div>
            <div>Partidas</div>
            {esAdmin && <div style={{ textAlign: 'right' }}>Título / Borrar</div>}
          </div>
          {filtrados.map((j) => (
            <div key={j.id} onClick={() => setSeleccionado(j)} title="Haz clic para ver estadísticas" style={{ display: 'grid', gridTemplateColumns: esAdmin ? '50px 1fr 120px 120px 130px' : '50px 1fr 120px 120px', padding: '0.75rem', borderBottom: '1px solid #334155', alignItems: 'center', cursor: 'pointer', background: seleccionado?.id === j.id ? '#0f172a' : 'transparent' }}>
              <div style={{ fontWeight: 'bold', fontSize: j.puesto <= 3 ? '1.15rem' : '1rem', color: '#cbd5e1' }}>{obtenerMedalla(j.puesto)}</div>
              <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center' }}>{renderTitulo(j.titulo)}<span style={{ textDecoration: 'underline dotted #475569' }}>{j.nombre}</span></div>
              <div style={{ fontWeight: 'bold', color: '#38bdf8' }}>{j.elo}</div>
              <div style={{ color: '#94a3b8' }}>{j.partidas || 0} (K={(j.partidas || 0) < 30 ? 40 : 20})</div>
                            {esAdmin && (
                <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center' }} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                  <select
                    value={j.titulo || ''}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      onCambiarTitulo(j.id, e.target.value);
                    }}
                    style={{ background: '#0f172a', color: '#fbbf24', border: '1px solid #475569', borderRadius: '0.3rem', padding: '0.25rem', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    <option value="">Sin título</option>
                    {TITULOS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button onClick={(e) => { e.stopPropagation(); onEliminar(j.id, j.nombre); }} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>✕</button>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
