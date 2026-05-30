'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { verificarLogin } from '@/utils/auth'

export default function PontuacoesPage() {
  const router = useRouter()
  const [participantes, setParticipantes] = useState<any[]>([])
  const [encontros, setEncontros] = useState<any[]>([])
  const [pontuacoes, setPontuacoes] = useState<any[]>([])
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [participanteId, setParticipanteId] = useState('')
  const [encontroId, setEncontroId] = useState('')

  const [presenca, setPresenca] = useState(false)
  const [biblia, setBiblia] = useState(false)
  const [visitante, setVisitante] = useState(false)
  const [extra, setExtra] = useState(false)

  async function buscarDados() {
    const participantesResponse = await supabase
      .from('pre_adolescentes')
      .select('*')
      .order('nome')

    const encontrosResponse = await supabase
      .from('encontros')
      .select('*')
      .order('data_encontro', { ascending: false })

    const pontuacoesResponse = await supabase
      .from('pontuacoes')
      .select(`
        *,
        pre_adolescentes (
          nome,
          sobrenome
        ),
        encontros (
          titulo
        )
      `)
      .order('id', { ascending: false })

    if (participantesResponse.data) {
      setParticipantes(participantesResponse.data)
    }

    if (encontrosResponse.data) {
      setEncontros(encontrosResponse.data)
    }

    if (pontuacoesResponse.data) {
      setPontuacoes(pontuacoesResponse.data)
    }
  }

  async function salvarPontuacao() {
    if (!participanteId || !encontroId) {
      alert('Selecione participante e encontro')
      return
    }
    
    if (editandoId) {
      const total =
        (presenca ? 10 : 0) +
        (biblia ? 10 : 0) +
        (visitante ? 10 : 0) +
        (extra ? 10 : 0)

      const { error } = await supabase
        .from('pontuacoes')
        .update({
          pre_adolescente_id:participanteId,
          encontro_id: encontroId,
          presenca: presenca ? 10 : 0,
          biblia: biblia ? 10 : 0,
          visitante: visitante ? 10 : 0,
          extra:
            extra ? 10 : 0,
        })
        .eq('id', editandoId)

      if (error) {
        console.log(error)
        alert(error.message)
      } else {
        alert('Pontuação atualizada')

        limparFormulario()
        buscarDados()
      }

      return
    }

    if (!editandoId) {
      const pontuacaoExistente = await supabase
        .from('pontuacoes')
        .select('*')
        .eq('pre_adolescente_id', participanteId)
        .eq('encontro_id', encontroId)
        .single()

      if (pontuacaoExistente.data) {
        alert(
          'Esse participante já possui pontuação nesse encontro.'
        )
        return
      }
    }

    const total =
      (presenca ? 10 : 0) +
      (biblia ? 10 : 0) +
      (visitante ? 10 : 0) +
      (extra ? 10 : 0)

    const { error } = await supabase
      .from('pontuacoes')
      .insert([
        {
          pre_adolescente_id: participanteId,
          encontro_id: encontroId,
          presenca: presenca ? 10 : 0,
          biblia: biblia ? 10 : 0,
          visitante: visitante ? 10 : 0,
          extra: extra ? 10 : 0,
          total,
        },
      ])

    if (error) {
      console.log(error)
      alert(error.message)
    } else {
      alert('Pontuação salva com sucesso')

      limparFormulario()

      buscarDados()
    }
  }
  function editarPontuacao(
  pontuacao: any
) {
  setParticipanteId(
    pontuacao.pre_adolescente_id
  )

  setEncontroId(
    pontuacao.encontro_id
  )

  setPresenca(
    pontuacao.presenca > 0
  )

  setBiblia(
    pontuacao.biblia > 0
  )

  setVisitante(
    pontuacao.visitante > 0
  )

  setExtra(
    pontuacao.extra > 0
  )

  setEditandoId(
    pontuacao.id
  )
}
  function limparFormulario() {
  setParticipanteId('')
  setEncontroId('')

  setPresenca(false)
  setBiblia(false)
  setVisitante(false)
  setExtra(false)

  setEditandoId(null)
}
  async function excluirPontuacao(id: string) {
    const confirmar = confirm(
      'Deseja realmente excluir essa pontuação?'
    )

    if (!confirmar) return

    const { error } = await supabase
      .from('pontuacoes')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Erro ao excluir')
    } else {
      buscarDados()
    }
  }

  useEffect(() => {
    async function verificar() {
    const session = await verificarLogin()

    if (!session) {
      router.push('/login')
    } else {
      buscarDados()
    }
  }

  verificar()
  }, [])

  const totalAtual =
    (presenca ? 10 : 0) +
    (biblia ? 10 : 0) +
    (visitante ? 10 : 0) +
    (extra ? 10 : 0)

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        padding: 20,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: 30,
          borderRadius: 20,
          width: '100%',
          maxWidth: 1000,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1 style={{ color: '#2563eb' }}>
            🎯 Lançamento de Pontuação
          </h1>

          <Link href='/'>
            <button style={botaoVoltar}>
              Voltar
            </button>
          </Link>
        </div>

        <hr />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 15,
            marginTop: 20,
          }}
        >
          <select
            value={participanteId}
            onChange={(e) => setParticipanteId(e.target.value)}
            style={inputStyle}
          >
            <option value=''>
              Selecione o participante
            </option>

            {participantes.map((participante) => (
              <option
                key={participante.id}
                value={participante.id}
              >
                {participante.nome} {participante.sobrenome}
              </option>
            ))}
          </select>

          <select
            value={encontroId}
            onChange={(e) => setEncontroId(e.target.value)}
            style={inputStyle}
          >
            <option value=''>
              Selecione o encontro
            </option>

            {encontros.map((encontro) => (
              <option
                key={encontro.id}
                value={encontro.id}
              >
                {encontro.titulo}
              </option>
            ))}
          </select>

          <label style={checkboxStyle}>
            <input
              type='checkbox'
              checked={presenca}
              onChange={(e) =>
                setPresenca(e.target.checked)
              }
            />
            Presença (+10)
          </label>

          <label style={checkboxStyle}>
            <input
              type='checkbox'
              checked={biblia}
              onChange={(e) =>
                setBiblia(e.target.checked)
              }
            />
            Bíblia (+10)
          </label>

          <label style={checkboxStyle}>
            <input
              type='checkbox'
              checked={visitante}
              onChange={(e) =>
                setVisitante(e.target.checked)
              }
            />
            Visitante (+10)
          </label>

          <label style={checkboxStyle}>
            <input
              type='checkbox'
              checked={extra}
              onChange={(e) =>
                setExtra(e.target.checked)
              }
            />
            Extra (+10)
          </label>

          <div
            style={{
              backgroundColor: '#eff6ff',
              padding: 15,
              borderRadius: 10,
              color: '#1d4ed8',
              fontWeight: 'bold',
              fontSize: 20,
              textAlign: 'center',
            }}
          >
            Total Atual: {totalAtual} pontos
          </div>

          <button
            onClick={salvarPontuacao}
            style={botaoSalvar}
          >
            {editandoId
              ? 'Salvar Alterações'
              : 'Salvar Pontuação'}
          </button>
          {editandoId && (
            <button
              onClick={limparFormulario}
              style={{
                padding: 12,
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Cancelar edição
            </button>
          )}
        </div>

        <hr style={{ margin: '30px 0' }} />

        <h2 style={{ color: 'black' }}>
          Pontuações lançadas
        </h2>

        {pontuacoes.length === 0 ? (
          <p style={{ color: 'black' }}>
            Nenhuma pontuação encontrada.
          </p>
        ) : (
          <table
            border={1}
            cellPadding={10}
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
                <th>Participante</th>
                <th>Encontro</th>
                <th>Total</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {pontuacoes.map((pontuacao) => (
                <tr key={pontuacao.id}>
                  <td>
                    {pontuacao.pre_adolescentes?.nome}{' '}
                    {
                      pontuacao.pre_adolescentes
                        ?.sobrenome
                    }
                  </td>

                  <td>
                    {pontuacao.encontros?.titulo}
                  </td>

                  <td>
                    <strong>
                      {pontuacao.total}
                    </strong>
                  </td>

                  <td>
                    <div
                      style={{
                        display: 'flex',
                        gap: 10,
                        justifyContent: 'center',
                      }}
                    >
                      <button
                        onClick={() =>
                          editarPontuacao(
                            pontuacao
                          )
                        }
                        style={{
                          padding: 8,
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        ✏️
                      </button>

                      <button
                        onClick={() =>
                          excluirPontuacao(
                            pontuacao.id
                          )
                        }
                        style={{
                          padding: 8,
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        🗑️
                      </button>
                    </div>
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

const inputStyle = {
  padding: 12,
  borderRadius: 8,
  border: '1px solid #ccc',
  color: 'black',
  backgroundColor: 'white',
}

const checkboxStyle = {
  display: 'flex',
  gap: 10,
  color: 'black',
  fontSize: 18,
}

const botaoSalvar = {
  padding: 12,
  backgroundColor: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 'bold' as const,
  fontSize: 16,
}

const botaoVoltar = {
  padding: 10,
  backgroundColor: '#111827',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
}