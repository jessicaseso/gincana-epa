'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User, Mail, Lock, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function Cadastro() {
  const router = useRouter()

  // Estados do formulário
  const [nomeCompleto, setNomeCompleto] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  // Controle do Modal LGPD
  const [mostrarModalLGPD, setMostrarModalLGPD] = useState(false)

  // Passo 1: Validação inicial dos campos do formulário
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

    // Sempre abre o modal no primeiro cadastro para coletar o consentimento real
    setMostrarModalLGPD(true)
  }

  // Passo 2: Registro oficial no Supabase Auth e Banco de Dados
  async function executarCadastroSupabase() {
    setMostrarModalLGPD(false)
    setCarregando(true)
    setErro('')

    try {
      // 1. Cadastra as credenciais no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
      })

      if (authError) throw authError
      const usuarioId = authData.user?.id

      if (usuarioId) {
        // Divide o nome para o banco de dados (Mantendo consistência se necessário)
        const partesNome = nomeCompleto.trim().split(' ')
        const nome = partesNome[0]
        const sobrenome = partesNome.slice(1).join(' ') || ''

        // 2. Cria o perfil na tabela de professores (Aprovado inicia como false)
        const { error: perfilError } = await supabase
          .from('perfis_professores')
          .insert([
            { 
              id: usuarioId, 
              nome: nome, 
              sobrenome: sobrenome,
              aprovado: false 
            }
          ])

        if (perfilError) {
          console.error('Erro ao criar perfil de professor:', perfilError.message)
        }

        // 3. Grava o registro definitivo de consentimento da LGPD no banco de dados
        const { error: lgpdError } = await supabase
          .from('lgpd_aceites')
          .insert([{ usuario_id: usuarioId, data_aceite: new Date().toISOString() }])
        
        if (lgpdError) {
          console.error('Erro ao registrar aceite da LGPD:', lgpdError.message)
        }
      }

      // Desconecta a sessão para evitar bypass antes da aprovação do admin
      await supabase.auth.signOut()

      alert('Cadastro solicitado com sucesso! Aguarde a aprovação do administrador.')
      router.push('/login')

    } catch (err) {
      const mensagemErro = err instanceof Error ? err.message : 'Ocorreu um erro ao realizar o cadastro.'
      setErro(mensagemErro)
    } finally {
      setCarregando(false)
    }
  }

  // Passo 3: Fluxo de recusa dos termos da LGPD
  function recusarTermosLGPD() {
    setMostrarModalLGPD(false)
    alert('Para utilizar o sistema, é necessário aceitar os termos da LGPD.')
    router.push('/login')
  }

  return (
    <main style={styles.containerPrincipal}>
      
      {/* MODAL DE CONSENTIMENTO DA LGPD */}
      {mostrarModalLGPD && (
        <div style={styles.overlayModal}>
          <div style={styles.containerModal}>
            <div style={styles.iconeModalContainer}>
              <ShieldAlert size={50} />
            </div>
            
            <h2 style={styles.tituloModal}>
              Termo de Consentimento - LGPD
            </h2>
            
            <div style={styles.textoTermoBox}>
              <p>
                Ao utilizar o <strong>Sistema de Gincanas do EPA</strong>, você, na qualidade de Professor/Organizador, declara estar ciente e concordar com o tratamento de dados pessoais de menores de idade (pré-adolescentes)...
              </p>
              <br />
              <p>
                <strong>Suas obrigações:</strong><br />
                1. Coletar e inserir dados apenas mediante autorização dos responsáveis.<br />
                2. Utilizar informações exclusivamente para o âmbito da gincana.<br />
                3. Não compartilhar dados com terceiros.
              </p>
            </div>

            <p style={styles.subtextoModal}>
              Você concorda com estes termos e deseja finalizar seu cadastro?
            </p>

            <div style={styles.containerBotoesModal}>
              <button onClick={recusarTermosLGPD} style={styles.botaoRecusar}>
                Não aceito, voltar
              </button>
              <button onClick={executarCadastroSupabase} style={styles.botaoAceitar}>
                Aceito e Quero Cadastrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORMULÁRIO VISUAL */}
      <div style={styles.cardCadastro}>
        <div style={styles.cabecalhoFormulario}>
          <div style={styles.emojiLogo}>📝</div>
          <h1 style={styles.tituloFormulario}>Criar Conta de Professor</h1>
          <p style={styles.subtituloFormulario}>Cadastre-se para gerenciar a Gincana do EPA</p>
        </div>

        {erro && <div style={styles.caixaErro}>{erro}</div>}

        <form onSubmit={verificarAntesDeCadastrar} style={styles.formularioCorpo}>
          
          <div style={styles.grupoInput}>
            <User size={20} color="#94a3b8" style={styles.iconeInput} />
            <input
              type="text"
              placeholder="Nome Completo"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
              style={styles.inputEstilo}
              disabled={carregando}
            />
          </div>

          <div style={styles.grupoInput}>
            <Mail size={20} color="#94a3b8" style={styles.iconeInput} />
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.inputEstilo}
              disabled={carregando}
            />
          </div>

          <div style={styles.grupoInput}>
            <Lock size={20} color="#94a3b8" style={styles.iconeInput} />
            <input
              type="password"
              placeholder="Senha (mínimo 6 caracteres)"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={styles.inputEstilo}
              disabled={carregando}
            />
          </div>

          <button type="submit" style={styles.botaoEnviar} disabled={carregando}>
            {carregando ? 'Processando...' : 'Cadastrar Login'}
          </button>
        </form>

        <div style={styles.containerLinkLogin}>
          <Link href="/login" style={styles.linkLogin}>
            Já tem uma conta? Faça Login
          </Link>
        </div>
      </div>
    </main>
  )
}

// ================= ESTILOS UNIFICADOS E LIMPOS =================
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
  cardCadastro: {
    width: '100%',
    maxWidth: 480,
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    borderRadius: 24,
    padding: 35,
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
  },
  cabecalhoFormulario: {
    textAlign: 'center' as const,
    marginBottom: 30,
  },
  emojiLogo: {
    fontSize: 50,
    marginBottom: 10,
  },
  tituloFormulario: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold' as const,
    margin: 0,
  },
  subtituloFormulario: {
    color: '#cbd5e1',
    fontSize: 14,
    marginTop: 6,
  },
  formularioCorpo: {
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
    marginBottom: 15,
    textAlign: 'center' as const,
  },
  botaoEnviar: {
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
  containerLinkLogin: {
    marginTop: 25,
    textAlign: 'center' as const,
  },
  linkLogin: {
    color: '#3b82f6',
    fontSize: 14,
    textDecoration: 'none',
  },
  overlayModal: {
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
    padding: 20,
  },
  containerModal: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#1e293b',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    padding: 30,
    textAlign: 'center' as const,
  },
  iconeModalContainer: {
    display: 'flex',
    justifyContent: 'center',
    color: '#f59e0b',
    marginBottom: 15,
  },
  tituloModal: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold' as const,
    marginBottom: 15,
  },
  textoTermoBox: {
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
  },
  subtextoModal: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 20,
  },
  containerBotoesModal: {
    display: 'flex',
    gap: 12,
  },
  botaoAceitar: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    border: 'none',
    backgroundColor: '#16a34a',
    color: 'white',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
  },
  botaoRecusar: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    border: '1px solid #dc2626',
    backgroundColor: 'transparent',
    color: '#f87171',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
  },
}