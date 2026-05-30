'use client'


import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { Users, Calendar, Trophy, Target, LogOut, Cake, BarChart3, BookOpen, UserPlus, BadgeCheck, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()

  const [aniversariantes, setAniversariantes] = useState<any[]>([])
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1)
  const [maisBiblia, setMaisBiblia] = useState('')
  const [maisVisitantes, setMaisVisitantes] = useState('')
  const [melhorPresenca, setMelhorPresenca] = useState('')
  
  // 1. ESTADO PARA CONTROLAR O POPUP DA LGPD
  const [mostrarLembreteLGPD, setMostrarLembreteLGPD] = useState(false)

  // Dispara o popup assim que o componente carrega (após o login)
  useEffect(() => {
    setMostrarLembreteLGPD(true)
  }, [])

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
      const mesNascimento = new Date(p.data_nascimento).getMonth() + 1
      return mesNascimento === mesSelecionado
    })

    filtrados.sort((a, b) => {
      const diaA = Number(a.data_nascimento.split('-')[2])
      const diaB = Number(b.data_nascimento.split('-')[2])
      return diaA - diaB
    })

    setAniversariantes(filtrados)
  }

  useEffect(() => { buscarAniversariantes() }, [mesSelecionado])

  async function buscarDashboard() {
    const { data: participantes } = await supabase.from('pre_adolescentes').select('*')
    const { data: pontuacoes } = await supabase.from('pontuacoes').select('*')

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

    setMaisBiblia(String(campeaoBiblia?.[0] || ''))
    setMaisVisitantes(String(campeaoVisitante?.[0] || ''))
    setMelhorPresenca(String(campeaoPresenca?.[0] || ''))
  }

  useEffect(() => { buscarDashboard() }, [])

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
      }}
    >
      {/* 2. COMPONENTE VISUAL DO POPUP LGPD */}
      {mostrarLembreteLGPD && (
        <div style={overlayModal}>
          <div style={containerModal}>
            <div style={{ display: 'flex', justifyContent: 'center', color: '#f59e0b', marginBottom: 15 }}>
              <ShieldAlert size={48} />
            </div>
            <h2 style={{ color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>
              Aviso de Privacidade (LGPD)
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: 14, lineHeight: '1.6', marginBottom: 20 }}>
              Olá, Professor(a)! Lembramos que o cadastro e gerenciamento de dados de menores de idade exigem a concordância e autorização prévia dos pais ou responsáveis. 
              <br /><br />
              Os dados coletados (nomes e aniversários) devem ser usados exclusivamente para fins das dinâmicas da gincana e protegidos contra vazamentos ou acessos externos não autorizados.
            </p>
            <button 
              onClick={() => setMostrarLembreteLGPD(false)} 
              style={botaoConfirmarLGPD}
            >
              Entendi e estou de acordo
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          width: '100%',
          maxWidth: 550,
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
          <LogOut size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 70, marginBottom: 10 }}>🏆</div>
          <h1 style={{ color: 'white', fontSize: 38, fontWeight: 'bold', marginBottom: 10 }}>
            Gincana do EPA
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: 16 }}>
            Sistema oficial de pontuação
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Link href='/participantes'>
            <button style={botaoAzul}>
              <Users size={24} />
              Participantes
            </button>
          </Link>

          <Link href='/encontros'>
            <button style={botaoAzul}>
              <Calendar size={24} />
              Encontros
            </button>
          </Link>

          <Link href='/pontuacoes'>
            <button style={botaoAzul}>
              <Target size={24} />
              Pontuações
            </button>
          </Link>

          <Link href='/ranking'>
            <button style={botaoVerde}>
              <Trophy size={24} />
              Ranking Público
            </button>
          </Link>
        </div>

        <div style={{ marginTop: 20, background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, color: 'white' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <BarChart3 size={22} />
            <strong>Estatísticas da Gincana</strong>
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><BadgeCheck size={18} /><strong>+ Presença </strong> {melhorPresenca || '-'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><BookOpen size={18} /><strong> + Bíblia </strong> {maisBiblia || '-'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><UserPlus size={18} /><strong> + Visitantes </strong> {maisVisitantes || '-'}</div>
        </div>            

        <div style={{ marginTop: 25, background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, color: 'white' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}> 
            <Cake size={22} />
            <strong> Aniversariantes </strong>
          </h3>

          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(Number(e.target.value))}
            style={{ width: '100%', padding: 10, borderRadius: 8, marginBottom: 15, background: '#1e293b', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <option value={1}>Janeiro</option>
            <option value={2}>Fevereiro</option>
            <option value={3}>Março</option>
            <option value={4}>Abril</option>
            <option value={5}>Maio</option>
            <option value={6}>Junho</option>
            <option value={7}>Julho</option>
            <option value={8}>Agosto</option>
            <option value={9}>Setembro</option>
            <option value={10}>Outubro</option>
            <option value={11}>Novembro</option>
            <option value={12}>Dezembro</option>
          </select>

          {aniversariantes.length === 0 ? (
            <p>Nenhum aniversariante</p>
          ) : (
            aniversariantes.map((p) => {
              const [ano, mes, dia] = p.data_nascimento.split('-')
              return (
                <div key={p.id} style={{ marginBottom: 8 }}>
                  🎉 {dia}/{mes} - {p.nome} {p.sobrenome}
                </div>
              )
            })
          )}        
        </div>
        
        <div style={{ marginTop: 35, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
          GERAÇÃO NOVA
        </div>
      </div>
    </main>
  )
}

// ================= STYLES EXISTENTES =================
const botaoAzul = {
  width: '100%',
  padding: 18,
  borderRadius: 16,
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 14,
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
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 14,
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
  padding: '10px 14px',
  borderRadius: 12,
  border: 'none',
  backgroundColor: '#dc2626',
  color: 'white',
  fontWeight: 'bold' as const,
  cursor: 'pointer',
}

// ================= NOVOS STYLES PARA O POPUP LGPD =================
const overlayModal = {
  position: 'fixed' as const,
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999, // Garante que fica na frente de tudo
  padding: 20
}

const containerModal = {
  width: '100%',
  maxWidth: 450,
  backgroundColor: '#1e293b', // Fundo escuro combinando com seu app
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: 24,
  padding: 30,
  textAlign: 'center' as const,
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
}

const botaoConfirmarLGPD = {
  width: '100%',
  padding: 14,
  borderRadius: 12,
  border: 'none',
  backgroundColor: '#f59e0b', // Cor amarela/laranja para dar foco
  color: '#0f172a',
  fontSize: 16,
  fontWeight: 'bold' as const,
  cursor: 'pointer',
  transition: 'background 0.2s',
}