'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [jugadores, setJugadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [jugadorA, setJugadorA] = useState('');
  const [jugadorB, setJugadorB] = useState('');
  const [resultado, setResultado] = useState('1');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarJugadores();
  }, []);

  async function cargarJugadores() {
    setCargando(true);
    const { data, error } = await supabase
      .from('jugadores')
      .select('*')
      .order('elo', { ascending: false });

    if (!error && data) {
      setJugadores(data);
    }
    setCargando(false);
  }

  async function agregarJugador(e) {
    e.preventDefault();
    if (!nombreNuevo.trim()) return;
    const { error } = await supabase
      .from('jugadores')
      .insert([{ nombre: nombreNuevo.trim(), elo: 1500, partidas: 0 }]);

    if (error) {
      setMensaje('Error al agregar jugador: ' + error.message);
    } else {
      setNombreNuevo('');
      setMensaje('¡Jugador registrado con 1500 puntos base!');
      cargarJugadores();
    }
  }

  async function eliminarJugador(id, nombre) {
    if (!confirm(`¿Seguro que deseas eliminar a ${nombre} del ranking?`)) return;
    const { error } = await supabase.from('jugadores').delete().eq('id', id);
    if (!error) {
      setMensaje(`Jugador ${nombre} eliminado.`);
      cargarJugadores();
    }
  }

  function obtenerFactorK(partidas) {
    return (partidas || 0) < 30 ? 40 : 20;
  }

  function calcularNuevoElo(jugador1, jugador2, score1) {
    const k1 = obtenerFactorK(jugador1.partidas);
    const k2 = obtenerFactorK(jugador2.partidas);
    const esperado1 = 1 / (1 + Math.pow(10, (jugador2.elo - jugador1.elo) / 400));
    const esperado2 = 1 / (1 + Math.pow(10, (jugador1.elo - jugador2.elo) / 400));
    const nuevo1 = Math.round(jugador1.elo + k1 * (score1 - esperado1));
    const nuevo2 = Math.round(jugador2.elo + k2 * ((1 - score1) - esperado2));
    return [nuevo1, nuevo2];
  }

  async function registrarPartida(e) {
    e.preventDefault();
    if (!jugadorA || !jugadorB || jugadorA === jugadorB) {
      setMensaje('Selecciona dos jugadores distintos.');
      return;
    }

    const pA = jugadores.find((j) => j.id === jugadorA);
    const pB = jugadores.find((j) => j.id === jugadorB);
    const scoreA = parseFloat(resultado);
    const [nuevoEloA, nuevoEloB] = calcularNuevoElo(pA, pB, scoreA);

    await supabase
      .from('jugadores')
      .update({ elo: nuevoEloA, partidas: (pA.partidas || 0) + 1 })
      .eq('id', pA.id);

    await supabase
      .from('jugadores')
      .update({ elo: nuevoEloB, partidas: (pB.partidas || 0) + 1 })
      .eq('id', pB.id);

    setMensaje(`¡Partida registrada! ${pA.nombre}: ${nuevoEloA} | ${pB.nombre}: ${nuevoEloB}`);
    cargarJugadores();
  }

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: '#1e293b', padding: '0.75rem 1.5rem', borderRadius: '999px', border: '1px solid #334155' }}>
          <span style={{ fontSize: '1.5rem' }}>🏆</span>
          <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 'bold' }}>Ajedrez 3 Jaques México</h1>
        </div>
        <p style={{ color: '#94a3b8', marginTop: '0.75rem' }}>Ranking Nacional Oficial • Base 1500 Elo (K=40 primeras 30 partidas / K=20)</p>
      </header>

      {mensaje && (
        <div style={{ background: '#064e3b', border: '1px solid #10b981', color: '#a7f3d0', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          {mensaje}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <section style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
          <h2 style={{ fontSize: '1.1rem', marginTop: 0 }}>👤 Registrar Jugador</h2>
          <form onSubmit={agregarJugador} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="Nombre completo del jugador"
              value={nombreNuevo}
              onChange={(e) => setNombreNuevo(e.target.value)}
              style={{ padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}
              required
            />
            <div style={{ padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #334155', background: '#0f172a', color: '#94a3b8', fontSize: '0.9rem' }}>
              Elo inicial: <strong style={{ color: '#38bdf8' }}>1500 puntos (K=40)</strong>
            </div>
            <button type="submit" style={{ padding: '0.7rem', borderRadius: '0.4rem', border: 'none', background: '#0284c7', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
              Añadir al Ranking
            </button>
          </form>
        </section>

        <section style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
          <h2 style={{ fontSize: '1.1rem', marginTop: 0 }}>⚔️ Registrar Partida (3 Jaques)</h2>
          <form onSubmit={registrarPartida} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <select value={jugadorA} onChange={(e) => setJugadorA(e.target.value)} style={{ padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #475569', background: '#0f172a', color: '#fff' }} required>
              <option value="">Blancas (Jugador A)</option>
              {jugadores.map((j) => (
                <option key={j.id} value={j.id}>{j.nombre} ({j.elo})</option>
              ))}
            </select>
            <select value={jugadorB} onChange={(e) => setJugadorB(e.target.value)} style={{ padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #475569', background: '#0f172a', color: '#fff' }} required>
              <option value="">Negras (Jugador B)</option>
              {jugadores.map((j) => (
                <option key={j.id} value={j.id}>{j.nombre} ({j.elo})</option>
              ))}
            </select>
            <select value={resultado} onChange={(e) => setResultado(e.target.value)} style={{ padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}>
              <option value="1">1 - 0 (Ganan Blancas)</option>
              <option value="0.5">½ - ½ (Tablas)</option>
              <option value="0">0 - 1 (Ganan Negras)</option>
            </select>
            <button type="submit" style={{ padding: '0.7rem', borderRadius: '0.4rem', border: 'none', background: '#e11d48', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
              Actualizar Elo
            </button>
          </form>
        </section>
      </div>

      <section style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
        <h2 style={{ fontSize: '1.25rem', marginTop: 0 }}>🏅 Tabla General de Posiciones</h2>
        {cargando ? (
          <p style={{ color: '#94a3b8' }}>Cargando ranking...</p>
        ) : jugadores.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Aún no hay jugadores registrados. ¡Agrega el primero arriba!</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                  <th style={{ padding: '0.75rem' }}>#</th>
                  <th style={{ padding: '0.75rem' }}>Jugador</th>
                  <th style={{ padding: '0.75rem' }}>Elo 3-Jaques</th>
                  <th style={{ padding: '0.75rem' }}>Partidas</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {jugadores.map((jugador, index) => (
                  <tr key={jugador.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold', color: index === 0 ? '#f59e0b' : '#cbd5e1' }}>{index + 1}</td>
                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>{jugador.nombre}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#38bdf8' }}>{jugador.elo}</td>
                    <td style={{ padding: '0.75rem', color: '#94a3b8' }}>{jugador.partidas || 0} (K={(jugador.partidas || 0) < 30 ? 40 : 20})</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <button onClick={() => eliminarJugador(jugador.id, jugador.nombre)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

