import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { prd } from '../utils/api'
import { usePrdStore } from '../stores/prdStore'
import PrdDocument from '../components/prd/PrdDocument'

export default function PrdPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const projectId = id ?? ''

  const {
    state,
    prdData,
    setPrdData,
    updateSectionContent,
    reset,
  } = usePrdStore()

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Load PRD on mount — redirect if not generated yet
  useEffect(() => {
    if (!projectId) return
    reset()
    setLoading(true)
    setLoadError(null)

    prd.get(projectId)
      .then(({ prdData: data }) => {
        if (!data || !data.sections.some(s => s.content)) {
          // No generated PRD — redirect to generate page
          navigate(`/project/${projectId}/generate`)
          return
        }
        setPrdData(data)
      })
      .catch((err: Error) => {
        setLoadError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [projectId])

  const handleUpdateSectionContent = (sectionId: string, content: string) => {
    updateSectionContent(sectionId, content)
    prd.updateSectionContent(projectId, sectionId, content).catch(() => {})
  }

  const handleRegenerateOutline = () => {
    navigate(`/project/${projectId}/generate`)
  }

  // ─── Render ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Layout>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          gap: 16,
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--accent)',
            letterSpacing: '0.06em',
          }}>
            LOADING PRD...
          </div>
        </div>
      </Layout>
    )
  }

  if (loadError) {
    return (
      <Layout>
        <div style={{
          padding: '40px 20px',
          maxWidth: 560,
          margin: '0 auto',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: '#e07070',
            background: 'rgba(224,112,112,0.1)',
            border: '1px solid rgba(224,112,112,0.3)',
            padding: '14px 16px',
            borderRadius: 6,
          }}>
            Error loading PRD: {loadError}
          </div>
          <button
            className="term-btn"
            onClick={() => navigate(-1)}
            style={{ marginTop: 16 }}
          >
            ← Go Back
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      showTasksNav={state === 'done'}
      onTasksNav={() => navigate(`/project/${projectId}/tasks`)}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: '8px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          <span style={{ color: 'var(--accent)' }}>STEP 4</span>
          <span>·</span>
          <span>PRD DOCUMENT</span>
        </div>

        {/* Document viewer */}
        {prdData && prdData.sections.length > 0 && (
          <PrdDocument
            projectId={projectId}
            sections={prdData.sections}
            onRegenerateOutline={handleRegenerateOutline}
            onUpdateSectionContent={handleUpdateSectionContent}
          />
        )}
      </div>
    </Layout>
  )
}
