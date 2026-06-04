'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { verificarLogin } from '@/utils/auth'
import Link from 'next/link'

// Interface para garantir a consistência dos dados do participante
interface Participante {
  id: number
  nome: string
  sobrenome: string
  data_nascimento: string
}

export default function ParticipantesPage() {
  const router = useRouter()

  // Estados dos dados e filtros
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [busca, setBusca] = useState('')
  const [nome, setNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  
  // Estado para controle de edição
  const [editandoId, setEditandoId] = useState<number | null>(null)

  // Função auxiliar para formatar a data na tabela (Ex: 25/12/2012)
  function formatarDataBR(dataString: string) {
    if (!dataString) return ''
    const [ano, mes, dia] = dataString.split('-')
    return `${dia}/${mes}/${ano}`
  }

  async function buscarParticipantes() {
    const { data, error } = await supabase
      .from('pre_adolescentes')
      .select('*')
      .order('nome')

    if (error) {
      console.error('Erro ao buscar participantes:', error.message)
    } else if (data) {
      setParticipantes(data)
    }
  }

  async function salvarParticipante() {
    if (!nome || !sobrenome || !dataNascimento) {
      alert('Preencha todos os campos')
      return
    }

    const dadosParticipante = {
      nome,
      sobrenome,
      data_nascimento: dataNascimento,
    }

    if (editandoId) {
      // Operação de Edição
      const { error } = await supabase
        .from('pre_adolescentes')
        .update(dadosParticipante)
        .eq('id', editandoId)

      if (error) {
        console.error(error)
        alert('Erro ao editar participante.')
      } else {
        alert('Participante atualizado com sucesso!')
        limparFormulario()
        buscarParticipantes()
      }
      return
    }

    // Operação de Cadastro Novo
    const { error } = await supabase
      .from('pre_adolescentes')
      .insert([dadosParticipante])

    if (error) {
      console.error(error)
      alert(error.message)
    } else {
      alert('Participante cadastrado com sucesso!')
      limparFormulario()
      buscarParticipantes()
    }
  }

  function editarParticipante(participante: Participante) {
    setNome(participante.nome)
    setSobrenome(participante.sobrenome)
    setDataNascimento(participante.data_nascimento)
    setEditandoId(participante.id)
  }

  async function excluirParticipante(id: number) {
    const confirmar = confirm('Deseja realmente excluir este participante?')
    if (!confirmar) return

    const { error } = await supabase
      .from('pre_adolescentes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(error)
      alert('Erro ao excluir participante.')
    } else {
      alert('Participante removido com sucesso!')
      buscarParticipantes()
    }
  }

  function limparFormulario() {
    setNome('')
    setSobrenome('')
    setDataNascimento('')
    setEditandoId(null)
  }

  // Filtro em tempo real de participantes
  const participantesFiltrados = participantes.filter((p) =>
    `${p.nome} ${p.sobrenome}`.toLowerCase().includes(busca.toLowerCase())
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
  }, [router])

  return (
    <div style={styles.containerPrincipal}>
      <div style={styles.cardConteudo}>
        
        {/* Cabeçalho */}
        <div style={styles.cabecalho}>
          <h1 style={styles.tituloPagina}>🏆 Participantes</h1>
          <Link href="/">
            <button style={styles.botaoVoltar}>Voltar</button>
          </Link>
        </div>

        <hr />

        {/* Formulário de Cadastro/Edição */}
        <h2 style={{ color: 'black', marginTop: 20 }}>
          {editandoId ? '✏️ Editando Participante' : 'Cadastro de Participante'}
        </h2>

        <div style={styles.formulario}>
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={styles.inputEstilo}
          />

          <input
            type="text"
            placeholder="Sobrenome"
            value={sobrenome}
            onChange={(e) => setSobrenome(e.target.value)}
            style={styles.inputEstilo}
          />

          <input
            type="date"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            style={styles.inputEstilo}
          />

          <button
            onClick={salvarParticipante}
            style={{
              ...styles.botaoAcao,
              backgroundColor: editandoId ? '#f59e0b' : '#2563eb',
            }}
          >
            {editandoId ? 'Salvar Alterações' : 'Cadastrar'}
          </button>

          {editandoId && (
            <button onClick={limparFormulario} style={styles.botaoCancelar}>
              Cancelar edição
            </button>
          )}
        </div>

        <hr />

        {/* Listagem e Busca */}
        <h2 style={{ color: 'black', marginTop: 20 }}>Participantes cadastrados</h2>
        
        <input
          type="text"
          placeholder="🔎 Buscar participante..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={styles.inputBusca}
        />

        {participantes.length === 0 ? (
          <p style={{ color: 'black' }}>Nenhum participante encontrado.</p>
        ) : (
          <table style={styles.tabela}>
            <thead style={styles.tabelaCabecalho}>
              <tr>
                <th>Nome</th>
                <th>Sobrenome</th>
                <th>Data de Nasc.</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {participantesFiltrados.map((p) => (
                <tr key={p.id} style={styles.tabelaLinha}>
                  <td>{p.nome}</td>
                  <td>{p.sobrenome}</td>
                  <td>{formatarDataBR(p.data_nascimento)}</td>
                  <td>
                    <div style={styles.containerAcoes}>
                      <button onClick={() => editarParticipante(p)} style={styles.botaoEditar}>
                        ✏️
                      </button>
                      <button onClick={() => excluirParticipante(p.id)} style={styles.botaoExcluir}>
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

// ================= OBJETO DE ESTILOS ORGANIZADO =================
const styles = {
  containerPrincipal: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  cardConteudo: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    width: '100%',
    maxWidth: 900,
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  cabecalho: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  tituloPagina: {
    color: '#1d4ed8',
    margin: 0,
  },
  botaoVoltar: {
    padding: 10,
    backgroundColor: '#111827',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 'bold' as const,
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
    marginBottom: 30,
    marginTop: 15,
  },
  inputEstilo: {
    padding: 12,
    borderRadius: 8,
    border: '1px solid #ccc',
    color: 'black',
    backgroundColor: 'white',
    fontSize: 15,
  },
  inputBusca: {
    padding: 12,
    borderRadius: 8,
    border: '1px solid #ccc',
    width: '100%',
    marginTop: 15,
    marginBottom: 20,
    color: 'black',
    backgroundColor: 'white',
    fontSize: 15,
  },
  botaoAcao: {
    padding: 12,
    color: 'white',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 'bold' as const,
    fontSize: 16,
    transition: 'background-color 0.2s',
  },
  botaoCancelar: {
    padding: 12,
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 'bold' as const,
  },
  tabela: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginTop: 20,
    color: 'black',
  },
  tabelaCabecalho: {
    backgroundColor: '#2563eb',
    color: 'white',
    textAlign: 'left' as const,
  },
  tabelaLinha: {
    borderBottom: '1px solid #e2e8f0',
  },
  containerAcoes: {
    display: 'flex',
    gap: 10,
  },
  botaoEditar: {
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: 6,
    cursor: 'pointer',
  },
  botaoExcluir: {
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: 6,
    cursor: 'pointer',
  },
}