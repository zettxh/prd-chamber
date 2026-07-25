import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { prd, type PrdData, type PrdSection } from '../utils/api'
import { usePrdStore } from '../stores/prdStore'
import PrdOutline from '../components/prd/PrdOutline'
import PrdProgress from '../components/prd/PrdProgress'
import PrdDocument from '../components/prd/PrdDocument'

export default function PrdPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const projectId = id ?? ''

  const {
    state,
    setState,
    prdData,
    setPrdData,
    setOutline,
    confirmedSections,
    setConfirmedSections,
    updateSectionContent,
    setSectionError,
    setGeneratingSection,
    completeGeneration,
    failGeneration,
    updateSectionInData,
    error: storeError,
  } = usePrdStore()

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Load PRD on mount
  useEffect(() => {
    if (!projectId) return
    setLoading(true)
    setLoadError(null)

    prd.get(projectId)
      .then(({ prdData: data }) => {
        if (data) {
          // PRD exists — load it
          setPrdData(data)
        }
        // else: no PRD yet, state stays 'outline'
      })
      .catch((err: Error) => {
        setLoadError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [projectId])

  // ─── Event Handlers ────────────────────────────────────────────────

  const handleOutlineGenerated = (data: PrdData) => {
    setOutline(data)
  }

  const handleConfirmOutline = (sections: PrdSection[]) => {
    setConfirmedSections(sections)
    setState('generating')
  }

  const handleRegenerateOutline = async () => {
    try {
      setLoading(true)
      const { prdData: data } = await prd.regenerateOutline(projectId)
      setOutline(data)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratingSection = (sectionId: string) => {
    setGeneratingSection(sectionId)
  }

  const handleSectionComplete = (sectionId: string, content: string) => {
    updateSectionContent(sectionId, content)
  }

  const handleSectionError = (sectionId: string, error: string) => {
    setSectionError(sectionId, error)
  }

  const handleGenerationComplete = () => {
    completeGeneration()
  }

  const handleGenerationError = (error: string) => {
    failGeneration(error)
  }

  const handleUpdateSectionContent = (sectionId: string, content: string) => {
    updateSectionInData(sectionId, content)
    // Persist to backend
    prd.updateSectionContent(projectId, sectionId, content).catch(() => {
      // silent — content already updated in store
    })
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
          <div style={{
            width: 200,
            height: 2,
            background: 'var(--border)',
            borderRadius: 1,
          }}>
            <div style={{
              width: '40%',
              height: '100%',
              background: 'var(--accent)',
              animation: 'pulse 1.2s ease-in-out infinite',
            }} />
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
            lineHeight: 1.6,
          }}>
            <strong>Error loading PRD:</strong><br />
            {loadError}
          </div>
          <button
            className="term-btn"
            onClick={() => navigate(-1)}
            style={{ marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 11 }}
          >
            ← Go Back
          </button>
        </div>
      </Layout>
    )
  }

  const effectiveSections = confirmedSections.length > 0 ? confirmedSections : (prdData?.sections ?? [])

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* STEP indicator */}
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
          <span>PRD GENERATION</span>
          <span>·</span>
          <span style={{ color: 'var(--text-muted)' }}>
            {state === 'outline' ? 'OUTLINE' :
              state === 'generating' ? 'GENERATING...' :
                state === 'done' ? 'COMPLETE' :
                  state === 'error' ? 'ERROR' : state.toUpperCase()}
          </span>
        </div>

        {/* Error banner */}
        {(storeError || state === 'error') && (
          <div style={{
            padding: '10px 20px',
            background: 'rgba(224,112,112,0.1)',
            borderBottom: '1px solid rgba(224,112,112,0.3)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: '#e07070',
          }}>
            ⚠️ Generation error: {storeError || 'Unknown error'}
            <button
              onClick={() => setState('outline')}
              className="term-btn"
              style={{ marginLeft: 16, fontSize: 9 }}
            >
              Retry Outline
            </button>
          </div>
        )}

        {/* STEP 1: Outline */}
        {(state === 'outline') && (
          <div style={{ maxWidth: 720, margin: '0 auto', width: '100%', padding: '0 20px' }}>
            <PrdOutline
              projectId={projectId}
              prdData={prdData}
              onOutlineGenerated={handleOutlineGenerated}
              onConfirm={handleConfirmOutline}
            />
          </div>
        )}

        {/* STEP 2: Generate — Progress */}
        {state === 'generating' && (
          <div style={{ flex: 1 }}>
            <PrdProgress
              projectId={projectId}
              sections={confirmedSections}
              onSectionComplete={handleSectionComplete}
              onSectionError={handleSectionError}
              onGeneratingSection={handleGeneratingSection}
              onComplete={handleGenerationComplete}
              onError={handleGenerationError}
            />
          </div>
        )}

        {/* STEP 3: Full Document */}
        {(state === 'done' || confirmedSections.length > 0) && effectiveSections.length > 0 && state !== 'generating' && (
          <PrdDocument
            projectId={projectId}
            sections={effectiveSections}
            onRegenerateOutline={handleRegenerateOutline}
            onUpdateSectionContent={handleUpdateSectionContent}
          />
        )}

        {/* Empty state */}
        {!loading && !prdData && state === 'outline' && (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--text-muted)',
            }}>
              No PRD outline yet. Generate one above.
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
