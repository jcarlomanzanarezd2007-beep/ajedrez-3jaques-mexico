export const metadata = {
  title: 'Ajedrez 3 Jaques México - Ranking Oficial',
  description: 'Sistema oficial de ranking Elo y cálculo de partidas para Ajedrez 3 Jaques México',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
