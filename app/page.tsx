'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Users, 
  CalendarDays, 
  Target, 
  Trophy, 
  Cake, 
  BookOpen, 
  UserPlus, 
  Star, 
  LogOut,
  ShieldAlert
} from 'lucide-react'

export default function Home() {
  const router = useRouter()

  const mesAtual = new Date().getMonth() + 1

  // Estados Originais do Dashboard
  const [mesSelecionado, setMesSelecionado] = useState(mesAtual)
  const [aniversariantes, setAniversariantes] = useState<any[]>([])
  const [maisBiblia, setMaisBiblia] = useState('')
  const [maisVisitantes, setMaisVisitantes] = useState('')
  const [melhorPresenca, setMelhorPresenca] = useState('')

  // Estados de Segurança e LGPD
  const [carregandoSessao, setCarregandoSessao] = useState(true)
  const [mostrarModalLGPD, setMostrarModalLGPD] = useState(false)

  // Valida a Sessão do Usuário e controla o Modal da LGPD
  useEffect(() => {
    async function checarSessao() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      const jaAceitouLGPD = localStorage.getItem('lgpd_aceito_professor')
      if (jaAceitouLGPD !== 'true') {
        setMostrarModalLGPD(true)
      }
      
      setCarregandoSessao(false)
    }

    checarSessao()
  }, [router])

  // Dispara as buscas do banco de dados após validar sessão
  useEffect(() => {
    if (!carregandoSessao) {
      buscarDashboard()
    }
  }, [carregandoSessao])

  useEffect(() => {
    if (!carregandoSessao) {
      buscarAniversariantes()
    }
  }, [mesSelecionado, carregandoSessao])

  function aceitarTermosLGPD() {
    localStorage.setItem('lgpd_aceito_professor', 'true')
    setMostrarModalLGPD(false)
  }

  async function fazerLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function buscarAniversariantes() {
    const { data } = await supabase
      .from('pre_adolescentes')
      .select('*')

    if (!data) return

    const filtrados = data.filter((p) => {
      const mesNascimento = Number(p.data_nascimento.split('-')[1])
      return mesNascimento === mesSelecionado
    })

    filtrados.sort((a, b) => {
      const diaA = Number(a.data_nascimento.split('-')[2])
      const diaB = Number(b.data_nascimento.split('-')[2])
      return diaA - diaB
    })

    setAniversariantes(filtrados)
  }

  async function buscarDashboard() {
    const { data: participantes } = await supabase
      .from('pre_adolescentes')
      .select('*')

    const { data: pontuacoes } = await supabase
      .from('pontuacoes')
      .select('*')

    if (!participantes || !pontuacoes) return

    const rankingBiblia: any = {}
    const rankingVisitante: any = {}
    const rankingPresenca: any = {}

    pontuacoes.forEach((item: any) => {
      const participante = participantes.find((p) => p.id === item.pre_adolescente_id)
      if (!participante) return

      const nome = participante.nome + ' ' + participante.sobrenome

      rankingBiblia[nome] = rankingBiblia[nome] || 0
      rankingVisitante[nome] = rankingVisitante[nome] || 0
      rankingPresenca[nome] = rankingPresenca[nome] || 0

      if (item.biblia > 0) rankingBiblia[nome]++
      if (item.visitante > 0) rankingVisitante[nome]++
      if (item.presenca > 0) rankingPresenca[nome]++
    })

    const campeaoBiblia = Object.entries(rankingBiblia).sort((a: any, b: any) => Number(b[1]) - Number(a[1]))[0]
    const campeaoVisitante = Object.entries(rankingVisitante).sort((a: any, b: any) => Number(b[1]) - Number(a[1]))[0]
    const campeaoPresenca = Object.entries(rankingPresenca).sort((a: any, b: any) => Number(b[1]) - Number(a[1]))[0]

    setMaisBiblia(String(campeaoBiblia?.[0] || '-'))
    setMaisVisitantes(String(campeaoVisitante?.[0] || '-'))
    setMelhorPresenca(String(campeaoPresenca?.[0] || '-'))
  }

  if (carregandoSessao) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', color: 'white', fontFamily: 'sans-serif' }}>
        Carregando painel seguro...
      </div>
    )
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundImage: 'linear-gradient(rgba(15,23,42,0.85), rgba(15,23,42,0.85)), url("/fundo-inicial.png")',
        display: 'flex',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        fontFamily: 'sans-serif'
      }}
    >
      {/* MODAL DA LGPD */}
      {mostrarModalLGPD && (
        <div style={styles.overlayModal}>
          <div style={styles.containerModal}>
            <div style={styles.iconeModalContainer}>
              <ShieldAlert size={50} />
            </div>
            <h2 style={styles.tituloModal}>Termo de Consentimento - LGPD</h2>
            <div style={styles.textoTermoBox}>
              <p>
                Ao utilizar o <strong>Sistema de Gincanas do EPA</strong>, você declara estar ciente e concordar com o tratamento de dados pessoais para os fins descritos.
              </p>
              <br />
              <p>
                <strong>Suas obrigações de Professor/Líder:</strong><br />
                1. Coletar e inserir dados apenas mediante autorização.<br />
                2. Utilizar informações exclusivamente para o âmbito da gincana.<br />
                3. Não compartilhar dados com terceiros.
              </p>
            </div>
            <button onClick={aceitarTermosLGPD} style={styles.botaoAceitarModal}>
              Entendi e Aceito os Termos
            </button>
          </div>
        </div>
      )}

      {/* CARD PRINCIPAL */}
      <div
        style={{
          width: '100%',
          maxWidth: 700,
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          borderRadius: 30,
          padding: 40,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
          position: 'relative',
        }}
      >
        <button onClick={fazerLogout} style={botaoLogout}>
          <LogOut size={16} /> Sair
        </button>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: '#f59e0b', marginBottom: 10 }}>
            <Trophy size={64} />
          </div>
          <h1 style={{ color: 'white', fontSize: 38, margin: 0 }}>Gincana do EPA</h1>
          <p style={{ color: '#cbd5e1', marginTop: 5 }}>Sistema oficial de pontuação</p>
        </div>

        {/* Links e Botões com os Ícones Lucide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Link href='/participantes'>
            <button style={botaoAzul}>
              <div style={styles.conteudoBotao}>
                <Users size={20} />
                <span>Participantes</span>
              </div>
            </button>
          </Link>

          <Link href='/encontros'>
            <button style={botaoAzul}>
              <div style={styles.conteudoBotao}>
                <CalendarDays size={20} />
                <span>Encontros</span>
              </div>
            </button>
          </Link>

          <Link href='/pontuacoes'>
            <button style={botaoAzul}>
              <div style={styles.conteudoBotao}>
                <Target size={20} />
                <span>Pontuações</span>
              </div>
            </button>
          </Link>

          <Link href='/ranking'>
            <button style={botaoVerde}>
              <div style={styles.conteudoBotao}>
                <Trophy size={20} />
                <span>Ranking Público</span>
              </div>
            </button>
          </Link>
        </div>

        {/* Bloco de Aniversariantes com Ícone Cake */}
        <div
          style={{
            marginTop: 25,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: 20,
            color: 'white',
          }}
        >
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 0, marginBottom: 15 }}>
            <Cake size={20} color="#f472b6" /> Aniversariantes
          </h3>

          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(Number(e.target.value))}
            style={{
              width: '100%',
              padding: 10,
              marginBottom: 15,
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.2)',
              backgroundColor: '#1e293b',
              color: 'white',
              outline: 'none'
            }}
          >
            {[
              'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
              'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
            ].map((mes, index) => (
              <option key={index} value={index + 1} style={{ backgroundColor: '#1e293b' }}>
                {mes}
              </option>
            ))}
          </select>

          {aniversariantes.length === 0 ? (
            <p style={{ margin: 0, color: '#cbd5e1' }}>Nenhum aniversariante</p>
          ) : (
            aniversariantes.map((p) => {
              const [, mes, dia] = p.data_nascimento.split('-')
              return (
                <div key={p.id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🎉</span> <strong>{dia}/{mes}</strong> - {p.nome} {p.sobrenome}
                </div>
              )
            })
          )}
        </div>

        {/* Bloco de Estatísticas com Ícones Customizados */}
        <div
          style={{
            marginTop: 20,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: 20,
            color: 'white',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 15 }}>📊 Estatísticas da Gincana</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ margin: 0, lineHeight: 1.4 }}>
              <span style={styles.labelEstatistica}>
                <BookOpen size={16} color="#60a5fa" /> + Bíblia:
              </span>
              <br />
              <strong style={{ marginLeft: 22, color: '#93c5fd' }}>{maisBiblia}</strong>
            </p>

            <p style={{ margin: 0, lineHeight: 1.4 }}>
              <span style={styles.labelEstatistica}>
                <UserPlus size={16} color="#34d399" /> + visitantes:
              </span>
              <br />
              <strong style={{ marginLeft: 22, color: '#6ee7b7' }}>{maisVisitantes}</strong>
            </p>

            <p style={{ margin: 0, lineHeight: 1.4 }}>
              <span style={styles.labelEstatistica}>
                <Star size={16} color="#fbbf24" /> + presença:
              </span>
              <br />
              <strong style={{ marginLeft: 22, color: '#fcd34d' }}>{melhorPresenca}</strong>
            </p>
          </div>
        </div>

        <div style={{ marginTop: 35, textAlign: 'center', color: '#94a3b8', fontSize: 14, fontWeight: '500', letterSpacing: '1px' }}>
          GERAÇÃO NOVA
        </div>
      </div>
    </main>
  )
}

// Estilos Reutilizados
const botaoAzul = {
  width: '100%',
  padding: 18,
  borderRadius: 16,
  border: 'none',
  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  color: 'white',
  fontSize: 17,
  fontWeight: 'bold' as const,
  cursor: 'pointer',
}

const botaoVerde = {
  width: '100%',
  padding: 18,
  borderRadius: 16,
  border: 'none',
  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
  color: 'white',
  fontSize: 17,
  fontWeight: 'bold' as const,
  cursor: 'pointer',
}

const botaoLogout = {
  position: 'absolute' as const,
  top: 20,
  right: 20,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 14px',
  borderRadius: 12,
  border: 'none',
  backgroundColor: '#dc2626',
  color: 'white',
  fontWeight: 'bold' as const,
  cursor: 'pointer',
}

// Estilos Auxiliares para alinhamento dos Ícones
const styles = {
  conteudoBotao: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  labelEstatistica: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: '#cbd5e1'
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
    padding: 20
  },
  containerModal: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#1e293b',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    padding: 30,
    textAlign: 'center' as const
  },
  iconeModalContainer: {
    display: 'flex',
    justifyContent: 'center',
    color: '#f59e0b',
    marginBottom: 15
  },
  tituloModal: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold' as const,
    marginBottom: 15,
    marginTop: 0
  },
  textoTermoBox: {
    maxHeight: 180,
    overflowY: 'auto' as const,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    padding: 15,
    borderRadius: 12,
    textAlign: 'left' as const,
    color: '#cbd5e1',
    fontSize: 13,
    marginBottom: 20,
    lineHeight: '1.5'
  },
  botaoAceitarModal: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    border: 'none',
    backgroundColor: '#16a34a',
    color: 'white',
    fontWeight: 'bold' as const,
    cursor: 'pointer'
  }
}