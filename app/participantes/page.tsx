'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { verificarLogin } from '@/utils/auth'

export default function ParticipantesPage() {
  const router = useRouter()

  const [participantes, setParticipantes] = useState<any[]>([])
  const [busca, setBusca] = useState('')
  const [nome, setNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')

  const [editandoId, setEditandoId] = useState<number | null>(null)

  async function buscarParticipantes() {
    const { data, error } = await supabase
      .from('pre_adolescentes')
      .select('*')
      .order('nome')

    if (error) {
      console.log(error)
    } else {
      setParticipantes(data)
    }
  }

  async function salvarParticipante() {
    if (!nome || !sobrenome || !dataNascimento) {
      alert('Preencha todos os campos')
      return
    }

    // EDITAR
    if (editandoId) {
      const { error } = await supabase
        .from('pre_adolescentes')
        .update({
          nome,
          sobrenome,
          data_nascimento: dataNascimento,
        })
        .eq('id', editandoId)

      if (error) {
        console.log(error)
        alert('Erro ao editar')
      } else {
        alert('Participante atualizado')

        limparFormulario()
        buscarParticipantes()
      }

      return
    }

    // CADASTRAR
    const { error } = await supabase
      .from('pre_adolescentes')
      .insert([
        {
          nome,
          sobrenome,
          data_nascimento: dataNascimento,
        },
      ])

    if (error) {
      console.log(error)
      alert(error.message)
    } else {
      alert('Participante cadastrado')

      limparFormulario()
      buscarParticipantes()
    }
  }

  function editarParticipante(participante: any) {
    setNome(participante.nome)
    setSobrenome(participante.sobrenome)
    setDataNascimento(participante.data_nascimento)

    setEditandoId(participante.id)
  }

  async function excluirParticipante(id: number) {
    const confirmar = confirm(
      'Deseja realmente excluir este participante?'
    )

    if (!confirmar) return

    const { error } = await supabase
      .from('pre_adolescentes')
      .delete()
      .eq('id', id)

    if (error) {
      console.log(error)
      alert('Erro ao excluir')
    } else {
      alert('Participante removido')

      buscarParticipantes()
    }
  }

  function limparFormulario() {
    setNome('')
    setSobrenome('')
    setDataNascimento('')

    setEditandoId(null)
  }
  const participantesFiltrados =
  participantes.filter((participante) =>
    (
      participante.nome +
      ' ' +
      participante.sobrenome
    )
      .toLowerCase()
      .includes(busca.toLowerCase())
  )

  useEffect(() => {
    async function verificar() {
      const session = await verificarLogin()

      if (!session) {
        router.push('/login')
      } else {
        buscarParticipantes()
      }
    }

    verificar()
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
        padding: 20,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: 30,
          borderRadius: 20,
          width: '100%',
          maxWidth: 900,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
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
              color: '#1d4ed8',
              margin: 0,
            }}
          >
            🏆 Participantes
          </h1>

          <a href='/'>
            <button
              style={{
                padding: 10,
                backgroundColor: '#111827',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Voltar
            </button>
          </a>
        </div>

        <hr />

        <h2 style={{ color: 'black' }}>
          {editandoId
            ? '✏️ Editando participante'
            : 'Cadastro de Participante'}
        </h2>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            marginBottom: 30,
          }}
        >
          <input
            type='text'
            placeholder='Nome'
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={inputStyle}
          />

          <input
            type='text'
            placeholder='Sobrenome'
            value={sobrenome}
            onChange={(e) => setSobrenome(e.target.value)}
            style={inputStyle}
          />

          <input
            type='date'
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            style={inputStyle}
          />

          <button
            onClick={salvarParticipante}
            style={{
              padding: 12,
              backgroundColor: editandoId
                ? '#f59e0b'
                : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: 16,
            }}
          >
            {editandoId
              ? 'Salvar Alterações'
              : 'Cadastrar'}
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

        <hr />

        <h2 style={{ color: 'black' }}>
          Participantes cadastrados
        </h2>
        
        <input
          type='text'
          placeholder='🔎 Buscar participante...'
          value={busca}
          onChange={(e) =>
            setBusca(e.target.value)
          }
          style={{
            padding: 12,
            borderRadius: 8,
            border: '1px solid #ccc',
            width: '100%',
            marginTop: 15,
            marginBottom: 20,
            color: 'black',
            backgroundColor: 'white',
          }}
        />
        {participantes.length === 0 ? (
          <p style={{ color: 'black' }}>
            Nenhum participante encontrado.
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
            }}
          >
            <thead
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
              }}
            >
              <tr>
                <th>Nome</th>
                <th>Sobrenome</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {participantesFiltrados.map((participante) => (
                <tr key={participante.id}>
                  <td>{participante.nome}</td>
                  <td>{participante.sobrenome}</td>
                  <td>{participante.data_nascimento}</td>

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
                          editarParticipante(participante)
                        }
                        style={{
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        ✏️
                      </button>

                      <button
                        onClick={() =>
                          excluirParticipante(participante.id)
                        }
                        style={{
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
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