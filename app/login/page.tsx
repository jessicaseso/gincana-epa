'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Mail, Lock, LogIn } from 'lucide-react'

export default function Login() {
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    if (!email || !senha) {
      setErro('Por favor, preencha todos os campos.')
      setCarregando(false)
      return
    }

    try {
      // 1. Realiza a autenticação inicial no Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
      })

      if (error) throw error

      const usuarioId = data.user?.id

      if (usuarioId) {
        // 2. NOVA VALIDAÇÃO: Verifica se o perfil do professor foi aprovado pelo administrador
        const { data: perfil, error: perfilError } = await supabase
          .from('perfis_professores')
          .select('aprovado')
          .eq('id', usuarioId)
          .single()

        // Se der erro ao buscar ou se "aprovado" for falso, barra o acesso
        if (perfilError || !perfil || perfil.aprovado === false) {
          // Desconecta a sessão gerada para não deixar o token ativo no navegador
          await supabase.auth.signOut()
          setErro('Sua conta ainda não foi aprovada pelo administrador do sistema.')
          setCarregando(false)
          return
        }
      }

      // 3. Se estiver tudo aprovado, direciona o professor para a Home do App
      router.push('/')
      
    } catch (err: any) {
      // Traduzindo os erros mais comuns do Supabase para ficar amigável
      if (err.message === 'Invalid login credentials') {
        setErro('E-mail ou senha incorretos.')
      } else {
        setErro(err.message || 'Ocorreu um erro ao tentar fazer login.')
      }
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main style={containerPrincipal}>
      <div style={cardLogin}>
        
        <div style={{ textAlign: 'center', marginBottom: 35 }}>
          <div style={{ fontSize: 60, marginBottom: 10 }}>🔐</div>
          <h1 style={{ color: 'white', fontSize: 32, fontWeight: 'bold' }}>Gincana do EPA</h1>
          <p style={{ color: '#cbd5e1', fontSize: 14, marginTop: 5 }}>
            Painel de Controle do Professor
          </p>
        </div>

        {erro && <div style={caixaErro}>{erro}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Campo E-mail */}
          <div style={grupoInput}>
            <Mail size={20} color="#94a3b8" style={iconeInput} />
            <input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputEstilo}
              disabled={carregando}
            />
          </div>

          {/* Campo Senha */}
          <div style={grupoInput}>
            <Lock size={20} color="#94a3b8" style={iconeInput} />
            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={inputEstilo}
              disabled={carregando}
            />
          </div>

          <button type="submit" style={botaoEntrar} disabled={carregando}>
            {carregando ? (
              'Entrando...'
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <LogIn size={20} /> Entrar no Sistema
              </span>
            )}
          </button>
        </form>

        <div style={{ marginTop: 30, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link href="/cadastro" style={{ color: '#3b82f6', fontSize: 14, textDecoration: 'none' }}>
            Não tem uma conta? Cadastre-se aqui
          </Link>
          
          <Link href="/ranking" style={{ color: '#10b981', fontSize: 14, textDecoration: 'none', fontWeight: 'bold' }}>
            Ver Ranking Público 🏆
          </Link>
        </div>

      </div>
    </main>
  )
}

// ================= STYLES (Mantendo a identidade visual do app) =================

const containerPrincipal = {
  minHeight: '100vh',
  backgroundImage: 'linear-gradient(rgba(15,23,42,0.9), rgba(15,23,42,0.9)), url("/fundo-inicial.png")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
}

const cardLogin = {
  width: '100%',
  maxWidth: 450,
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(16px)',
  borderRadius: 24,
  padding: 40,
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
}

const grupoInput = {
  position: 'relative' as const,
  display: 'flex',
  alignItems: 'center',
}

const iconeInput = {
  position: 'absolute' as const,
  left: 14,
}

const inputEstilo = {
  width: '100%',
  padding: '14px 14px 14px 45px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(15, 23, 42, 0.6)',
  color: 'white',
  fontSize: 15,
  outline: 'none',
}

const caixaErro = {
  backgroundColor: 'rgba(220, 38, 38, 0.2)',
  border: '1px solid #dc2626',
  color: '#fca5a5',
  padding: 12,
  borderRadius: 10,
  fontSize: 14,
  marginBottom: 20,
  textAlign: 'center' as const,
}

const botaoEntrar = {
  width: '100%',
  padding: 15,
  borderRadius: 12,
  border: 'none',
  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold' as const,
  cursor: 'pointer',
}