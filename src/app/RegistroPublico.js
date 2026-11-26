'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function RegistroPublico({ jugadores, onRegistrado, onMensaje }) {
  const [nombreNuevo, setNombreNuevo] = useState('');

  function contieneGroserias(texto) {
    const prohibidas = ['puto', 'puta', 'pendejo', 'pendeja', 'verga', 'verg', 'chinga', 'culo', 'mierda', 'cabron', 'joto', 'marica', 'zorra', 'perra', 'admin', 'fuck', 'shit', 'bitch'];
    const limpio = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return prohibidas.some((p) => limpio.includes(p));
  }

  async function manejarRegistro(e) {
    e.preventDefault();
    const nombreLimpio = nombreNuevo.trim().replace(/\s+/g, ' ');
    if (nombreLimpio.length < 5) {
      onMensaje('⚠️ Escribe tu nombre y apellido reales (mínimo 5 letras).');
      return;
    }
    if (contieneGroserias(nombreLimpio)) {
      onMensaje('⚠️ Nombre no permitido en el ranking oficial.');
      return;
    }
    const yaExiste = jugadores.some((j) => j.nombre.toLowerCase() === nombreLimpio.toLowerCase());
    if (yaExiste) {
      onMensaje('⚠️ Ese jugador ya está registrado en el ranking.');
      return;
    }

    const { error } = await supabase.from('jugadores').insert([{ nombre: nombreLimpio, elo: 1500, partidas: 0 }]);
    if (!error) {
      setNombreNuevo('');
      onMensaje(`¡Bienvenido ${nombreLimpio}! Ya estás registrado con 1500 puntos base.`);
      onRegistrado();
    }
  }

  return (
    <section style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #334155' }}>
      <h2 style={{ fontSize: '1.1rem', marginTop: 0 }}>👤 Inscribirme al Ranking</h2>
      <form onSubmit={manejarRegistro} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input
          type="text"
          placeholder="Tu nombre y apellido reales"
          maxLength={45}
          value={nombreNuevo}
          onChange={(e) => setNombreNuevo(e.target.value)}
          style={{ padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}
          required
        />
        <div style={{ padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #334155', background: '#0f172a', color: '#94a3b8', fontSize: '0.9rem' }}>
          Elo inicial: <strong style={{ color: '#38bdf8' }}>1500 puntos (K=40)</strong>
        </div>
        <button type="submit" style={{ padding: '0.7rem', borderRadius: '0.4rem', border: 'none', background: '#0284c7', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
          Registrarme
        </button>
      </form>
    </section>
  );
}
