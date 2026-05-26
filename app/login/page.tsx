'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  async function fazerLogin() {
    if (!email || !senha) {
      alert('Preencha email e senha')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      console.log(error)
      alert('Email ou senha inválidos')
    } else {
      alert('Login realizado com sucesso')

      router.push('/')
    }
  }

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
          padding: 40,
          borderRadius: 20,
          width: '100%',
          maxWidth: 400,
        }}
      >
        <h1
          style={{
            color: '#2563eb',
            textAlign: 'center',
            marginBottom: 30,
          }}
        >
          🔐 Login Admin
        </h1>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 15,
          }}
        >
          <input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <input
            type='password'
            placeholder='Senha'
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={inputStyle}
          />

          <button
            onClick={fazerLogin}
            style={botaoLogin}
          >
            Entrar
          </button>
        </div>
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

const botaoLogin = {
  padding: 12,
  backgroundColor: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 'bold' as const,
  fontSize: 16,
}