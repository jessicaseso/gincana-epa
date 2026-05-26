'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { verificarLogin } from '@/utils/auth'

export default function ParticipantesPage() {
  const router = useRouter()

  const [participantes, setParticipantes] = useState<any[]>([])

  const [nome, setNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')

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

  async function cadastrarParticipante() {
    if (!nome || !sobrenome || !dataNascimento) {
      alert('Preencha todos os campos')
      return
    }

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
      alert('Erro ao cadastrar')
    } else {
      alert('Participante cadastrado com sucesso')

      setNome('')
      setSobrenome('')
      setDataNascimento('')

      buscarParticipantes()
    }
  }

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
          maxWidth: 700,
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
          Cadastro de Participante
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
            style={{
              padding: 12,
              borderRadius: 8,
              border: '1px solid #ccc',
              color: 'black',
              backgroundColor: 'white',
            }}
          />

          <input
            type='text'
            placeholder='Sobrenome'
            value={sobrenome}
            onChange={(e) => setSobrenome(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 8,
              border: '1px solid #ccc',
              color: 'black',
              backgroundColor: 'white',
            }}
          />

          <input
            type='date'
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 8,
              border: '1px solid #ccc',
              color: 'black',
              backgroundColor: 'white',
            }}
          />

          <button
            onClick={cadastrarParticipante}
            style={{
              padding: 12,
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: 16,
            }}
          >
            Cadastrar
          </button>
        </div>

        <hr />

        <h2 style={{ color: 'black' }}>
          Participantes cadastrados
        </h2>

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
                <th>Data de nascimento</th>
              </tr>
            </thead>

            <tbody>
              {participantes.map((participante) => (
                <tr key={participante.id}>
                  <td>{participante.nome}</td>
                  <td>{participante.sobrenome}</td>
                  <td>{participante.data_nascimento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}