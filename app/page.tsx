'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  async function fazerLogout() {
    await supabase.auth.signOut()

    router.push('/login')
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundImage:
          'linear-gradient(rgba(15,23,42,0.85), rgba(15,23,42,0.85)), url("/fundo-inicial.png")',
        display: 'flex',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,

      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 550,
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          borderRadius: 30,
          padding: 40,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
          position: 'relative',
        }}
      >
        <button
          onClick={fazerLogout}
          style={botaoLogout}
        >
          🚪 Sair
        </button>

        <div
          style={{
            textAlign: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: 70,
              marginBottom: 10,
            }}
          >
            🏆
          </div>

          <h1
            style={{
              color: 'white',
              fontSize: 38,
              fontWeight: 'bold',
              marginBottom: 10,
            }}
          >
            Gincana do EPA
          </h1>

          <p
            style={{
              color: '#cbd5e1',
              fontSize: 16,
            }}
          >
            Sistema oficial de pontuação
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <Link href='/participantes'>
            <button style={botaoAzul}>
              👥 Participantes
            </button>
          </Link>

          <Link href='/encontros'>
            <button style={botaoAzul}>
              📅 Encontros
            </button>
          </Link>

          <Link href='/pontuacoes'>
            <button style={botaoAzul}>
              🎯 Pontuações
            </button>
          </Link>

          <Link href='/ranking'>
            <button style={botaoVerde}>
              🏆 Ranking Público
            </button>
          </Link>
        </div>

        <div
          style={{
            marginTop: 35,
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: 14,
          }}
        >
          Desenvolvido para a Gincana EPA ✨
        </div>
      </div>
    </main>
  )
}

const botaoAzul = {
  width: '100%',
  padding: 18,
  borderRadius: 16,
  border: 'none',
  background:
    'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  color: 'white',
  fontSize: 17,
  fontWeight: 'bold' as const,
  cursor: 'pointer',
  transition: '0.3s',
  boxShadow: '0 6px 20px rgba(37,99,235,0.35)',
}

const botaoVerde = {
  width: '100%',
  padding: 18,
  borderRadius: 16,
  border: 'none',
  background:
    'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
  color: 'white',
  fontSize: 17,
  fontWeight: 'bold' as const,
  cursor: 'pointer',
  transition: '0.3s',
  boxShadow: '0 6px 20px rgba(22,163,74,0.35)',
}

const botaoLogout = {
  position: 'absolute' as const,
  top: 20,
  right: 20,
  padding: '10px 14px',
  borderRadius: 12,
  border: 'none',
  backgroundColor: '#dc2626',
  color: 'white',
  fontWeight: 'bold' as const,
  cursor: 'pointer',
}