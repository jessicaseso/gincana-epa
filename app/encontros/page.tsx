'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { verificarLogin } from '@/utils/auth'

// Interface para tipagem estrita do objeto Encontro
interface Encontro {
  id: number
  titulo: string
  data_encontro: string
  observacoes?: string
}

export default function EncontrosPage() {
  const router = useRouter()

  // Estados dos dados e formulário
  const [encontros, setEncontros] = useState<Encontro[]>([])
  const [titulo, setTitulo] = useState('')
  const [dataEncontro, setDataEncontro] = useState('')
  const [observacoes, setObservacoes] = useState('')

  // Estado para controle de edição
  const [editandoId, setEditandoId] = useState<number | null>(null)

  // Formata a exibição da data para o formato BR
  function formatarDataBR(dataString: string) {
    if (!dataString) return ''
    const [ano, mes, dia] = dataString.split('-')
    return `${dia}/${mes}/${ano}`
  }

  async function buscarEncontros() {
    const { data, error } = await supabase
      .from('encontros')
      .select('*')
      .order('data_encontro', { ascending: false })

    if (error) {
      console.error('Erro ao buscar encontros:', error.message)
    } else if (data) {
      setEncontros(data)
    }
  }

  async function salvarEncontro() {
    if (!titulo || !dataEncontro) {
      alert('Preencha os campos obrigatórios')
      return
    }

    const dadosEncontro = {
      titulo,
      data_encontro: dataEncontro,
      observacoes,
    }

    if (editandoId) {
      // Atualização de registro existente
      const { error } = await supabase
        .from('encontros')
        .update(dadosEncontro)
        .eq('id', editandoId)

      if (error) {
        console.error(error)
        alert('Erro ao editar encontro')
      } else {
        alert('Encontro atualizado')
        limparFormulario()
        buscarEncontros()
      }
      return
    }

    // Inserção de novo registro
    const { error } = await supabase
      .from('encontros')
      .insert([dadosEncontro])

    if (error) {
      console.error(error)
      alert('Erro ao cadastrar encontro')
    } else {
      alert('Encontro cadastrado')
      limparFormulario()
      buscarEncontros()
    }
  }

  function editarEncontro(encontro: Encontro) {
    setTitulo(encontro.titulo)
    setDataEncontro(encontro.data_encontro)
    setObservacoes(encontro.observacoes || '')
    setEditandoId(encontro.id)
  }

  async function excluirEncontro(id: number) {
    const confirmar = confirm('Deseja realmente excluir este encontro?')
    if (!confirmar) return

    const { error } = await supabase
      .from('encontros')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(error)
      alert('Erro ao excluir encontro')
    } else {
      alert('Encontro removido')
      buscarEncontros()
    }
  }

  function limparFormulario() {
    setTitulo('')
    setDataEncontro('')
    setObservacoes('')
    setEditandoId(null)
  }

  useEffect(() => {
    async function verificar() {
      const session = await verificarLogin()

      if (!session) {
        router.push('/login')
      } else {
        buscarEncontros()
      }
    }

    verificar()
  }, [router])

  return (
    <div style={styles.containerPrincipal}>
      <div style={styles.cardConteudo}>
        
        {/* Cabeçalho */}
        <div style={styles.cabecalho}>
          <h1 style={styles.tituloPagina}>📅 Encontros da Gincana</h1>
          <Link href="/">
            <button style={styles.botaoVoltar}>Voltar</button>
          </Link>
        </div>

        <hr />

        {/* Seção de Formulário */}
        <h2 style={styles.subtituloSecao}>
          {editandoId ? '✏️ Editando encontro' : 'Cadastro de Encontro'}
        </h2>

        <div style={styles.formulario}>
          <input
            type="text"
            placeholder="Título do encontro"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            style={styles.inputEstilo}
          />

          <input
            type="date"
            value={dataEncontro}
            onChange={(e) => setDataEncontro(e.target.value)}
            style={styles.inputEstilo}
          />

          <textarea
            placeholder="Observações (opcional)"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            style={styles.textAreaEstilo}
          />

          <button
            onClick={salvarEncontro}
            style={{
              ...styles.botaoAcao,
              backgroundColor: editandoId ? '#f59e0b' : '#2563eb',
            }}
          >
            {editandoId ? 'Salvar Alterações' : 'Cadastrar Encontro'}
          </button>

          {editandoId && (
            <button onClick={limparFormulario} style={styles.botaoCancelar}>
              Cancelar edição
            </button>
          )}
        </div>

        <hr />

        {/* Tabela de Encontros */}
        <h2 style={styles.subtituloSecao}>Encontros cadastrados</h2>

        {encontros.length === 0 ? (
          <p style={{ color: 'black' }}>Nenhum encontro encontrado.</p>
        ) : (
          <table style={styles.tabela}>
            <thead style={styles.tabelaCabecalho}>
              <tr>
                <th style={styles.tabelaCelulaCabecalho}>Título</th>
                <th style={styles.tabelaCelulaCabecalho}>Data</th>
                <th style={styles.tabelaCelulaCabecalho}>Observações</th>
                <th style={styles.tabelaCelulaCabecalho}>Ações</th>
              </tr>
            </thead>

            <tbody>
              {encontros.map((encontro) => (
                <tr key={encontro.id} style={styles.tabelaLinha}>
                  <td style={styles.tabelaCelula}>{encontro.titulo}</td>
                  <td style={styles.tabelaCelula}>{formatarDataBR(encontro.data_encontro)}</td>
                  <td style={styles.tabelaCelula}>{encontro.observacoes || '-'}</td>
                  <td style={styles.tabelaCelula}>
                    <div style={styles.containerAcoes}>
                      <button onClick={() => editarEncontro(encontro)} style={styles.botaoEditar}>
                        ✏️
                      </button>
                      <button onClick={() => excluirEncontro(encontro.id)} style={styles.botaoExcluir}>
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
    marginBottom: 20,
  },
  tituloPagina: {
    color: '#2563eb',
    margin: 0,
    fontSize: 28,
  },
  subtituloSecao: {
    color: 'black',
    marginTop: 20,
    marginBottom: 15,
  },
  botaoVoltar: {
    padding: '10px 16px',
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
    gap: 12,
    marginBottom: 30,
  },
  inputEstilo: {
    padding: 12,
    borderRadius: 8,
    border: '1px solid #ccc',
    color: 'black',
    backgroundColor: 'white',
    fontSize: 15,
  },
  textAreaEstilo: {
    padding: 12,
    borderRadius: 8,
    border: '1px solid #ccc',
    color: 'black',
    backgroundColor: 'white',
    fontSize: 15,
    minHeight: 100,
    resize: 'vertical' as const,
  },
  botaoAcao: {
    padding: 12,
    color: 'white',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 'bold' as const,
    fontSize: 16,
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
  },
  tabelaCelulaCabecalho: {
    padding: 12,
    textAlign: 'left' as const,
    fontWeight: 'bold' as const,
  },
  tabelaLinha: {
    borderBottom: '1px solid #e2e8f0',
  },
  tabelaCelula: {
    padding: 12,
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