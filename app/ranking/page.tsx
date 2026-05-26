'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function RankingPage() {
  const [ranking, setRanking] = useState<any[]>([])

  async function buscarRanking() {
    const { data, error } = await supabase
      .from('pontuacoes')
      .select(`
        presenca,
        biblia,
        visitante,
        extra,
        pre_adolescentes (
          nome,
          sobrenome
        )
      `)

    if (error) {
      console.log(error)
      return
    }

    const rankingMap: any = {}

    data.forEach((item: any) => {
      const participante = item.pre_adolescentes

      if (!participante) return

      const nomeCompleto =
        participante.nome + ' ' + participante.sobrenome

      const total =
        item.presenca +
        item.biblia +
        item.visitante +
        item.extra

      if (!rankingMap[nomeCompleto]) {
        rankingMap[nomeCompleto] = 0
      }

      rankingMap[nomeCompleto] += total
    })

    const rankingArray = Object.entries(rankingMap)
      .map(([nome, pontos]) => ({
        nome,
        pontos,
      }))
      .sort(
        (a: any, b: any) => b.pontos - a.pontos
      )

    setRanking(rankingArray)
  }

  useEffect(() => {
    buscarRanking()
  }, [])

  function medalha(index: number) {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'

    return `${index + 1}º`
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
          padding: 30,
          borderRadius: 20,
          width: '100%',
          maxWidth: 800,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <h1 style={{ color: '#2563eb' }}>
            🏆 Ranking Geral
          </h1>

          <Link href='/'>
            <button style={botaoVoltar}>
              Voltar
            </button>
          </Link>
        </div>

        <hr />

        {ranking.length === 0 ? (
          <p style={{ color: 'black' }}>
            Nenhuma pontuação encontrada.
          </p>
        ) : (
          <table
            border={1}
            cellPadding={15}
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: 20,
              color: 'black',
              textAlign: 'center',
            }}
          >
            <thead
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
              }}
            >
              <tr>
                <th>Posição</th>
                <th>Participante</th>
                <th>Pontos</th>
              </tr>
            </thead>

            <tbody>
              {ranking.map((item, index) => (
                <tr key={index}>
                  <td style={{ fontSize: 24 }}>
                    {medalha(index)}
                  </td>

                  <td>{item.nome}</td>

                  <td>
                    <strong>{item.pontos}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

const botaoVoltar = {
  padding: 10,
  backgroundColor: '#111827',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
}