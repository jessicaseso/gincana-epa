'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Mail, Lock, LogIn } from 'lucide-react'

export default function Login() {
  const router = useRouter()
  
  // Estados do formulário
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
        // 2. Verifica se o perfil do professor foi aprovado pelo administrador
        const { data: perfil, error: perfilError } = await supabase
          .from('perfis_professores')
          .select('aprovado')
          .eq('id', usuarioId)
          .single()

        // Se houver erro ao buscar ou se "aprovado" for falso, barra o acesso
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
      
    } catch (err) {
      // Tipagem correta do erro no TypeScript e tratamento de mensagens amigáveis
      if (err instanceof Error && err.message === 'Invalid login credentials') {
        setErro('E-mail ou senha incorretos.')
      } else {
        setErro(err instanceof Error ? err.message : 'Ocorreu um erro ao tentar fazer login.')
      }
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main style={styles.containerPrincipal}>
      <div style={styles.cardLogin}>
        
        {/* Cabeçalho do Card */}
        <div style={styles.cabecalho}>
          <div style={styles.emojiLogo}>🔐</div>
          <h1 style={styles.titulo}>Gincana do EPA</h1>
          <p style={styles.subtitulo}>
            Painel de Controle do Professor
          </p>
        </div>

        {erro && <div style={styles.caixaErro}>{erro}</div>}

        {/* Formulário */}
        <form onSubmit={handleLogin} style={styles.formulario}>
          
          {/* Campo E-mail */}
          <div style={styles.grupoInput}>
            <Mail size={20} color="#94a3b8" style={styles.iconeInput} />
            <input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.inputEstilo}
              disabled={carregando}
            />
          </div>

          {/* Campo Senha */}
          <div style={styles.grupoInput}>
            <Lock size={20} color="#94a3b8" style={styles.iconeInput} />
            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={styles.inputEstilo}
              disabled={carregando}
            />
          </div>

          <button type="submit" style={styles.botaoEntrar} disabled={carregando}>
            {carregando ? (
              'Entrando...'
            ) : (
              <span style={styles.conteudoBotao}>
                <LogIn size={20} /> Entrar no Sistema
              </span>
            )}
          </button>
        </form>

        {/* Links de navegação inferior */}
        <div style={styles.containerLinks}>
          <Link href="/cadastro" style={styles.linkCadastro}>
            Não tem uma conta? Cadastre-se aqui
          </Link>
          
          <Link href="/ranking" style={styles.linkRanking}>
            Ver Ranking Público 🏆
          </Link>
        </div>

      </div>
    </main>
  )
}

// ================= OBJETO DE ESTILOS UNIFICADO =================
const styles = {
  containerPrincipal: {
    minHeight: '100vh',
    backgroundImage: 'linear-gradient(rgba(15,23,42,0.9), rgba(15,23,42,0.9)), url("/fundo-inicial.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardLogin: {
    width: '100%',
    maxWidth: 450,
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    borderRadius: 24,
    padding: 40,
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
  },
  cabecalho: {
    textAlign: 'center' as const,
    marginBottom: 35,
  },
  emojiLogo: {
    fontSize: 60,
    marginBottom: 10,
  },
  titulo: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold' as const,
  },
  subtitulo: {
    color: '#cbd5e1',
    fontSize: 14,
    marginTop: 5,
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 20,
  },
  grupoInput: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
  iconeInput: {
    position: 'absolute' as const,
    left: 14,
  },
  inputEstilo: {
    width: '100%',
    padding: '14px 14px 14px 45px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(15, 23, 42, 0.6)',
    color: 'white',
    fontSize: 15,
    outline: 'none',
  },
  caixaErro: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    border: '1px solid #dc2626',
    color: '#fca5a5',
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center' as const,
  },
  botaoEntrar: {
    width: '100%',
    padding: 15,
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold' as const,
    cursor: 'pointer',
  },
  conteudoBotao: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  containerLinks: {
    marginTop: 30,
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  },
  linkCadastro: {
    color: '#3b82f6',
    fontSize: 14,
    textDecoration: 'none',
  },
  linkRanking: {
    color: '#10b981',
    fontSize: 14,
    textDecoration: 'none',
    fontWeight: 'bold' as const,
  },
}