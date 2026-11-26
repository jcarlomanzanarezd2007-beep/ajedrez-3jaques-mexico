'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import TablaRanking from './TablaRanking';
import HistorialPartidas from './HistorialPartidas';
import RegistroPublico from './RegistroPublico';

export default function Home() {
  const [jugadores, setJugadores] = useState([]);
  const [partidas, setPartidas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [jugadorA, setJugadorA] = useState('');
  const [jugadorB, setJugadorB] = useState('');
  const [resultado, setResultado] = useState('1');
  const [mensaje, setMensaje] = useState('');
  const [esAdmin, setEsAdmin] = useState(false);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {
    cargarDatos();
    if (localStorage.getItem('admin_3jaques') === 'true') setEsAdmin(true);
  }, []);

  function iniciarSesionAdmin(e) {
    e.preventDefault();
    const clave = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Ajedrezcoyoacan';
    if (passwordInput === clave) {
      setEsAdmin(true);
      setMostrarLogin(false);
      setPasswordInput('');
      localStorage.setItem('admin_3jaques', 'true');
      setMensaje('🔓 Modo Administrador activado.');
    } else {
      setMensaje('❌ Contraseña incorrecta.');
    }
  }

  function cerrarSesionAdmin() {
    setEsAdmin(false);
    localStorage.removeItem('admin_3jaques');
    setMensaje('🔒 Sesión cerrada.');
  }

  async function cargarDatos() {
    setCargando(true);
    const { data: dataJug } = await supabase.from('jugadores').select('*').order('elo', { ascending: false });
    const { data: dataPart } = await supabase.from('partidas').select('*').order('created_at', { ascending: false }).limit(500);
    if (dataJug) setJugadores(dataJug);
    if (dataPart) setPartidas(dataPart);
    setCargando(false);
  }

  async function agregarJugador(e) {
    e.preventDefault();
    if (!esAdmin || !nombreNuevo.trim()) return;
    const { error } = await supabase.from('jugadores').insert([{ nombre: nombreNuevo.trim(), elo: 1500, partidas: 0 }]);
    if (!error) {
      setNombreNuevo('');
      setMensaje('¡Jugador registrado con 1500 puntos base!');
      cargarDatos();
    }
  }

  async function eliminarJugador(id, nombre) {
    if (!esAdmin || !confirm(`¿Eliminar a ${nombre}?`)) return;
    await supabase.from('jugadores').delete().eq('id', id);
    setMensaje(`Jugador ${nombre} eliminado.`);
    cargarDatos();
  }
  async function eliminarPartida(id) {
    if (!esAdmin || !confirm('¿Eliminar esta partida del historial?')) return;
    await supabase.from('partidas').delete().eq('id', id);
    setMensaje('Partida eliminada del historial.');
    cargarDatos();
  }

  async function registrarPartida(e) {
    e.preventDefault();
    if (!esAdmin || !jugadorA || !jugadorB || jugadorA === jugadorB) return;
    const pA = jugadores.find((j) => j.id === jugadorA);
    const pB = jugadores.find((j) => j.id === jugadorB);
    const kA = (pA.partidas || 0) < 30 ? 40 : 20;
    const kB = (pB.partidas || 0) < 30 ? 40 : 20;
    const espA = 1 / (1 + Math.pow(10, (pB.elo - pA.elo) / 400));
    const espB = 1 / (1 + Math.pow(10, (pA.elo - pB.elo) / 400));
    const sA = parseFloat(resultado);
    const diffA = Math.round(kA * (sA - espA));
    const diffB = Math.round(kB * ((1 - sA) - espB));
    const nuevoA = pA.elo + diffA;
    const nuevoB = pB.elo + diffB;
    const textoRes = sA === 1 ? '1 - 0' : sA === 0.5 ? '½ - ½' : '0 - 1';

    await supabase.from('jugadores').update({ elo: nuevoA, partidas: (pA.partidas || 0) + 1 }).eq('id', pA.id);
    await supabase.from('jugadores').update({ elo: nuevoB, partidas: (pB.partidas || 0) + 1 }).eq('id', pB.id);
    await supabase.from('partidas').insert([{ blancas: pA.nombre, negras: pB.nombre, resultado: textoRes, cambio_blancas: diffA, cambio_negras: diffB }]);

    setMensaje(`¡Partida registrada! ${pA.nombre}: ${nuevoA} (${diffA >= 0 ? `+${diffA}` : diffA}) | ${pB.nombre}: ${nuevoB} (${diffB >= 0 ? `+${diffB}` : diffB})`);
    cargarDatos();
  }

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        {!esAdmin ? (
          <button onClick={() => setMostrarLogin(!mostrarLogin)} style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', padding: '0.4rem 0.9rem', borderRadius: '0.5rem', cursor: 'pointer' }}>🔒 Acceso Admin</button>
        ) : (
          <button onClick={cerrarSesionAdmin} style={{ background: '#7f1d1d', color: '#fecaca', border: '1px solid #ef4444', padding: '0.4rem 0.9rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>🔓 Cerrar Modo Admin</button>
        )}
      </div>

      {mostrarLogin && !esAdmin && (
        <form onSubmit={iniciarSesionAdmin} style={{ background: '#1e293b', border: '1px solid #475569', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <input type="password" placeholder="Contraseña de administrador" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid #475569', background: '#0f172a', color: '#fff' }} required />
          <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: '0.4rem', border: 'none', background: '#0284c7', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Entrar</button>
        </form>
      )}

      <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: '#1e293b', padding: '0.75rem 1.5rem', borderRadius: '999px', border: '1px solid #334155' }}>
          <span style={{ fontSize: '1.5rem' }}>🏆</span>
          <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 'bold' }}>Ajedrez 3 Jaques México</h1>
        </div>
        <p style={{ color: '#94a3b8', marginTop: '0.75rem' }}>Ranking Nacional Oficial • Base 1500 Elo (K=40 primeras 30 partidas / K=20)</p>
      </header>

      {mensaje && <div style={{ background: '#064e3b', border: '1px solid #10b981', color: '#a7f3d0', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>{mensaje}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <RegistroPublico jugadores={jugadores} onRegistrado={cargarDatos} onMensaje={setMensaje} />
        {esAdmin && (


          <section style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
            <h2 style={{ fontSize: '1.1rem', marginTop: 0 }}>⚔️ Registrar Partida (3 Jaques)</h2>
            <form onSubmit={registrarPartida} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <select value={jugadorA} onChange={(e) => setJugadorA(e.target.value)} style={{ padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #475569', background: '#0f172a', color: '#fff' }} required>
                <option value="">Blancas (Jugador A)</option>
                {jugadores.map((j) => <option key={j.id} value={j.id}>{j.nombre} ({j.elo})</option>)}
              </select>
              <select value={jugadorB} onChange={(e) => setJugadorB(e.target.value)} style={{ padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #475569', background: '#0f172a', color: '#fff' }} required>
                <option value="">Negras (Jugador B)</option>
                {jugadores.map((j) => <option key={j.id} value={j.id}>{j.nombre} ({j.elo})</option>)}
              </select>
              <select value={resultado} onChange={(e) => setResultado(e.target.value)} style={{ padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}>
                <option value="1">1 - 0 (Ganan Blancas)</option>
                <option value="0.5">½ - ½ (Tablas)</option>
                <option value="0">0 - 1 (Ganan Negras)</option>
              </select>
              <button type="submit" style={{ padding: '0.7rem', borderRadius: '0.4rem', border: 'none', background: '#e11d48', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Actualizar Elo</button>
            </form>
          </section>
               )}
      </div>


      <section style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginTop: 0 }}>🏅 Tabla General de Posiciones</h2>
      <TablaRanking jugadores={jugadores} partidas={partidas} cargando={cargando} esAdmin={esAdmin} onEliminar={eliminarJugador} />
      </section>

      <section style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
        <h2 style={{ fontSize: '1.25rem', marginTop: 0 }}>📜 Últimas Partidas Oficiales</h2>
       <HistorialPartidas partidas={partidas} esAdmin={esAdmin} onEliminarPartida={eliminarPartida} />

      </section>
    </main>
  );
}
