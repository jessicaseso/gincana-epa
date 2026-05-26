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
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: 40,
          borderRadius: 20,
          width: '100%',
          maxWidth: 500,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <button
          onClick={fazerLogout}
          style={botaoLogout}
        >
          🚪 Sair
        </button>

        <h1
          style={{
            color: '#2563eb',
            marginBottom: 30,
          }}
        >
          🏆 Gincana do EPA
        </h1>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 15,
          }}
        >
          <Link href='/participantes'>
            <button style={botao}>
              Participantes
            </button>
          </Link>

          <Link href='/encontros'>
            <button style={botao}>
              Encontros
            </button>
          </Link>

          <Link href='/pontuacoes'>
            <button style={botao}>
              Pontuações
            </button>
          </Link>

          <Link href='/ranking'>
            <button style={botaoRanking}>
              🏆 Ranking Público
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

const botao = {
  width: '100%',
  padding: 15,
  backgroundColor: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: 10,
  fontSize: 16,
  fontWeight: 'bold' as const,
  cursor: 'pointer',
}

const botaoRanking = {
  width: '100%',
  padding: 15,
  backgroundColor: '#16a34a',
  color: 'white',
  border: 'none',
  borderRadius: 10,
  fontSize: 16,
  fontWeight: 'bold' as const,
  cursor: 'pointer',
}

const botaoLogout = {
  position: 'absolute' as const,
  top: 20,
  right: 20,
  padding: '8px 12px',
  backgroundColor: '#dc2626',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 'bold' as const,
}