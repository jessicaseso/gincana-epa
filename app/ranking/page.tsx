'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function RankingPage() {
  const [ranking, setRanking] = useState<any[]>([])

  async function buscarRanking() {
    // BUSCAR PARTICIPANTES
    const { data: participantes } =
      await supabase
        .from('pre_adolescentes')
        .select('*')

    // BUSCAR PONTUAÇÕES
    const { data: pontuacoes } =
      await supabase
        .from('pontuacoes')
        .select('*')
    console.log(JSON.stringify(pontuacoes, null, 2))
    if (!participantes || !pontuacoes) return

    const rankingMap: any = {}

    participantes.forEach((p) => {
      rankingMap[p.id] = {
        nome:
          p.nome + ' ' + p.sobrenome,
        pontos: 0,
      }
    })

    pontuacoes.forEach((pontuacao) => {
      const participanteId =
        pontuacao.pre_adolescente_id

      if (rankingMap[participanteId]) {
        rankingMap[
          participanteId
        ].pontos += Number(pontuacao.total || 0)
      }
    })

    const rankingFinal =
      Object.values(rankingMap).sort(
        (a: any, b: any) =>
          b.pontos - a.pontos
      )

    setRanking(rankingFinal)
  }

  useEffect(() => {
    buscarRanking()
  }, [])

  const top3 = ranking.slice(0, 3)

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#020617',
        padding: 30,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 30,
          }}
        >
          <h1
            style={{
              color: 'white',
              fontSize: 40,
            }}
          >
            🏆 Ranking Geral
          </h1>

          <Link href='/'>
            <button style={botaoVoltar}>
              Voltar
            </button>
          </Link>
        </div>

        {/* TOP 3 */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 20,
            marginBottom: 40,
          }}
        >
          {top3.map((item: any, index) => (
            <div
              key={index}
              style={{
                background:
                  index === 0
                    ? '#facc15'
                    : index === 1
                    ? '#d1d5db'
                    : '#fb923c',

                padding: 30,
                borderRadius: 20,
                textAlign: 'center',
                color: '#000',
                fontWeight: 'bold',
              }}
            >
              <h2 style={{ fontSize: 30 }}>
                {index === 0
                  ? '🥇'
                  : index === 1
                  ? '🥈'
                  : '🥉'}
              </h2>

              <h3 style={{ fontSize: 24 }}>
                {item.nome}
              </h3>

              <p style={{ fontSize: 20 }}>
                {item.pontos} pontos
              </p>
            </div>
          ))}
        </div>

        {/* TABELA */}

        <div
          style={{
            backgroundColor: 'white',
            padding: 30,
            borderRadius: 20,
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              color: 'black',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                }}
              >
                <th style={th}>Posição</th>
                <th style={th}>Participante</th>
                <th style={th}>Pontos</th>
              </tr>
            </thead>

            <tbody>
              {ranking.map(
                (item: any, index) => (
                  <tr key={index}>
                    <td style={td}>
                      #{index + 1}
                    </td>

                    <td style={td}>
                      {item.nome}
                    </td>

                    <td style={td}>
                      {item.pontos}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const th = {
  padding: 15,
}

const td = {
  padding: 15,
  borderBottom: '1px solid #ddd',
}

const botaoVoltar = {
  padding: 12,
  borderRadius: 10,
  border: 'none',
  backgroundColor: '#2563eb',
  color: 'white',
  cursor: 'pointer',
}