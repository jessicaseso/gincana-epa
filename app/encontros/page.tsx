'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { verificarLogin } from '@/utils/auth'

export default function EncontrosPage() {
  const [encontros, setEncontros] = useState<any[]>([])

  const [titulo, setTitulo] = useState('')
  const [dataEncontro, setDataEncontro] = useState('')
  const [observacoes, setObservacoes] = useState('')

  async function buscarEncontros() {
    const { data, error } = await supabase
      .from('encontros')
      .select('*')
      .order('data_encontro', { ascending: false })

    if (error) {
      console.log(error)
    } else {
      setEncontros(data)
    }
  }

  async function cadastrarEncontro() {
    if (!titulo || !dataEncontro) {
      alert('Preencha os campos obrigatórios')
      return
    }

    const { error } = await supabase
      .from('encontros')
      .insert([
        {
          titulo,
          data_encontro: dataEncontro,
          observacoes,
        },
      ])

    if (error) {
      console.log(error)
      alert('Erro ao cadastrar encontro')
    } else {
      alert('Encontro cadastrado com sucesso')

      setTitulo('')
      setDataEncontro('')
      setObservacoes('')

      buscarEncontros()
    }
  }

  useEffect(() => {
    buscarEncontros()
  }, [])

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
          maxWidth: 800,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
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
            📅 Encontros da Gincana
          </h1>

          <Link href='/'>
            <button style={botaoVoltar}>
              Voltar
            </button>
          </Link>
        </div>

        <hr />

        <h2 style={{ color: 'black' }}>
          Cadastro de Encontro
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
            placeholder='Título do encontro'
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            style={inputStyle}
          />

          <input
            type='date'
            value={dataEncontro}
            onChange={(e) => setDataEncontro(e.target.value)}
            style={inputStyle}
          />

          <textarea
            placeholder='Observações (opcional)'
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            style={{
              ...inputStyle,
              minHeight: 100,
            }}
          />

          <button
            onClick={cadastrarEncontro}
            style={botaoCadastrar}
          >
            Cadastrar Encontro
          </button>
        </div>

        <hr />

        <h2 style={{ color: 'black' }}>
          Encontros cadastrados
        </h2>

        {encontros.length === 0 ? (
          <p style={{ color: 'black' }}>
            Nenhum encontro encontrado.
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
                <th>Título</th>
                <th>Data</th>
                <th>Observações</th>
              </tr>
            </thead>

            <tbody>
              {encontros.map((encontro) => (
                <tr key={encontro.id}>
                  <td>{encontro.titulo}</td>
                  <td>{encontro.data_encontro}</td>
                  <td>{encontro.observacoes}</td>
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

const botaoCadastrar = {
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