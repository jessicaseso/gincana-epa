'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User, Mail, Lock, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function Cadastro() {
  const router = useRouter()

  // Estados dos campos do formulário
  const [nomeCompleto, setNomeCompleto] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  // Estado para controlar a exibição do Modal da LGPD
  const [mostrarModalLGPD, setMostrarModalLGPD] = useState(false)

  // Passo 1: Quando o usuário clica no botão principal de "Cadastrar"
  function verificarAntesDeCadastrar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (!nomeCompleto || !email || !senha) {
      setErro('Por favor, preencha todos os campos.')
      return
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    // Se os dados estiverem válidos, abre o Modal da LGPD para decisão
    setMostrarModalLGPD(true)
  }

  // Passo 2: Se o professor ACEITAR os termos
  async function finalizarCadastroComSucesso() {
    setMostrarModalLGPD(false)
    setCarregando(true)

    try {
      // 1. Cadastra o usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: senha,
        options: {
          // Salva o nome completo nos metadados do usuário autenticado
          data: { nome_completo: nomeCompleto }
        }
      })

      if (authError) throw authError

      const usuarioId = authData.user?.id

      if (usuarioId) {
        // 2. Grava na tabela de perfis como pendente (aprovado: false por padrão no banco)
        const { error: perfilError } = await supabase
          .from('perfis_professores')
          .insert([{ id: usuarioId, nome_completo: nomeCompleto, email: email }])

        if (perfilError) console.error('Erro ao criar perfil do professor:', perfilError.message)

        // 3. Grava o registro do aceite da LGPD
        const { error: lgpdError } = await supabase
          .from('lgpd_aceites')
          .insert([{ usuario_id: usuarioId, data_aceite: new Date().toISOString() }])
        
        if (lgpdError) console.error('Erro ao gravar aceite LGPD:', lgpdError.message)
      }

      alert('Cadastro solicitado com sucesso! Aguarde a aprovação do administrador para acessar o painel.')
      router.push('/login') // Redireciona para o Login

    } catch (err: any) {
      setErro(err.message || 'Ocorreu um erro ao realizar o cadastro.')
    } finally {
      setCarregando(false)
    }
  }

  // Passo 3: Se o professor RECUSAR os termos
  function recusarTermosLGPD() {
    setMostrarModalLGPD(false)
    alert('Para utilizar o sistema, é necessário aceitar os termos da LGPD. Você será redirecionado.')
    router.push('/') // Volta para a página inicial
  }

  return (
    <main style={containerPrincipal}>
      
      {/* MODAL DE CONSENTIMENTO DA LGPD */}
      {mostrarModalLGPD && (
        <div style={overlayModal}>
          <div style={containerModal}>
            <div style={{ display: 'flex', justifyContent: 'center', color: '#f59e0b', marginBottom: 15 }}>
              <ShieldAlert size={50} />
            </div>
            
            <h2 style={{ color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 15 }}>
              Termo de Consentimento - LGPD
            </h2>
            
            <div style={textoTermoBox}>
              <p>
                Ao utilizar o <strong>Sistema de Gincanas do EPA</strong>, você, na qualidade de Professor/Organizador, declara estar ciente e concordar com o tratamento de dados pessoais de menores de idade (pré-adolescentes), em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/18).
              </p>
              <br />
              <p>
                <strong>Suas obrigações:</strong>
                <br />
                1. Coletar e inserir dados (Nome, Sobrenome e Data de Nascimento) apenas mediante a prévia autorização e consentimento dos pais ou responsáveis legais.
                <br />
                2. Utilizar as informações exclusivamente para a computação de pontos, rankings internos e felicitações de aniversário no âmbito da gincana.
                <br />
                3. Não compartilhar ou expor essas informações com terceiros alheios à organização.
              </p>
            </div>

            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>
              Você concorda com estes termos e deseja finalizar seu cadastro?
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={recusarTermosLGPD} style={botaoRecusar}>
                Não aceito, voltar
              </button>
              <button onClick={finalizarCadastroComSucesso} style={botaoAceitar}>
                Aceito e Quero Cadastrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORMULÁRIO DE CADASTRO VISUAL */}
      <div style={cardCadastro}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ fontSize: 50, marginBottom: 10 }}>📝</div>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>Criar Conta de Professor</h1>
          <p style={{ color: '#cbd5e1', fontSize: 14 }}>Cadastre-se para gerenciar a Gincana do EPA</p>
        </div>

        {erro && <div style={caixaErro}>{erro}</div>}

        <form onSubmit={verificarAntesDeCadastrar} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Campo Nome */}
          <div style={grupoInput}>
            <User size={20} color="#94a3b8" style={iconeInput} />
            <input
              type="text"
              placeholder="Nome Completo"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
              style={inputEstilo}
              disabled={carregando}
            />
          </div>

          {/* Campo Email */}
          <div style={grupoInput}>
            <Mail size={20} color="#94a3b8" style={iconeInput} />
            <input
              type="email"
              placeholder="E-mail"
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
              placeholder="Senha (mínimo 6 caracteres)"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={inputEstilo}
              disabled={carregando}
            />
          </div>

          <button type="submit" style={botaoEnviar} disabled={carregando}>
            {carregando ? 'Processando...' : 'Cadastrar Login'}
          </button>
        </form>

        <div style={{ marginTop: 25, textAlign: 'center' }}>
          <Link href="/login" style={{ color: '#3b82f6', fontSize: 14, textDecoration: 'none' }}>
            Já tem uma conta? Faça Login
          </Link>
        </div>
      </div>
    </main>
  )
}

// ================= ESTILOS (Design Escuro) =================

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

const cardCadastro = {
  width: '100%',
  maxWidth: 480,
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(16px)',
  borderRadius: 24,
  padding: 35,
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
  marginBottom: 15,
  textAlign: 'center' as const,
}

const botaoEnviar = {
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

// ================= ESTILOS DO MODAL LGPD =================

const overlayModal = {
  position: 'fixed' as const,
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  padding: 20
}

const containerModal = {
  width: '100%',
  maxWidth: 500,
  backgroundColor: '#1e293b',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: 24,
  padding: 30,
  textAlign: 'center' as const,
}

const textoTermoBox = {
  maxHeight: 200,
  overflowY: 'auto' as const,
  backgroundColor: 'rgba(15, 23, 42, 0.5)',
  padding: 15,
  borderRadius: 12,
  textAlign: 'left' as const,
  color: '#cbd5e1',
  fontSize: 13,
  lineHeight: '1.6',
  marginBottom: 15,
  border: '1px solid rgba(255, 255, 255, 0.05)',
}

const botaoAceitar = {
  flex: 1,
  padding: 14,
  borderRadius: 12,
  border: 'none',
  backgroundColor: '#16a34a',
  color: 'white',
  fontWeight: 'bold' as const,
  cursor: 'pointer',
}

const botaoRecusar = {
  flex: 1,
  padding: 14,
  borderRadius: 12,
  border: '1px solid #dc2626',
  backgroundColor: 'transparent',
  color: '#f87171',
  fontWeight: 'bold' as const,
  cursor: 'pointer',
}