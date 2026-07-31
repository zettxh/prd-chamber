import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import MarkdownViewer from '../MarkdownViewer'
import type { PrdSection } from '../../utils/api'
import { prd } from '../../utils/api'
import DiffView from '../DiffView'

interface Props {
  projectId: string
  sections: PrdSection[]
  onRegenerateOutline: () => void
  onUpdateSectionContent: (sectionId: string, content: string) => void
}

interface NavLink {
  label: string
  onClick: () => void
  icon?: string
}

export default function PrdDocument({ projectId, sections, onRegenerateOutline, onUpdateSectionContent }: Props) {
  const navigate = useNavigate()

  // Editing state
  const [isEditing, setIsEditing] = useState<string | null>(null) // sectionId
  const [editingContent, setEditingContent] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  // Toast
  const [toast, setToast] = useState<string | null>(null)

  // Scroll spy
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? '')
  const activeRef = useRef(sections[0]?.id ?? '')

  // Revision modal
  const [revisionSectionId, setRevisionSectionId] = useState<string | null>(null)
  const [revisionStep, setRevisionStep] = useState<'form' | 'preview'>('form')
  const [changeType, setChangeType] = useState<'add' | 'remove' | 'modify'>('modify')
  const [changeDescription, setChangeDescription] = useState('')
  const [proposedContent, setProposedContent] = useState('')
  const [revisingLoading, setRevisingLoading] = useState(false)

  const bottomNav: NavLink[] = [
    { label: 'Export PRD', icon: '📤', onClick: () => navigate(`/project/${projectId}/export`) },
    { label: 'Version History', icon: '📋', onClick: () => navigate(`/project/${projectId}/versions`) },
    { label: 'Share Link', icon: '🔗', onClick: () => navigate(`/share/${projectId}`) },
    { label: 'Tasks', icon: '📌', onClick: () => navigate(`/project/${projectId}/tasks`) },
  ]

  // Scroll spy
  useEffect(() => {
    const sidebar = document.getElementById('prd-sidebar')
    if (!sidebar || sections.length === 0) return

    const applyActive = (activeId: string) => {
      activeRef.current = activeId
      setActiveSection(activeId)
      const items = sidebar.querySelectorAll<HTMLElement>('[data-section]')
      items.forEach(item => {
        const isActive = item.dataset.section === activeId
        item.style.color = isActive ? 'var(--accent)' : 'var(--text-muted)'
        item.style.borderLeft = isActive ? '2px solid var(--accent)' : '2px solid transparent'
        item.style.background = isActive ? 'rgba(138,155,174,0.06)' : 'transparent'
      })
    }

    applyActive(activeRef.current)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          applyActive(visible[0].target.id)
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )

    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [sections])

  const scrollToSection = useCallback((id: string) => {
    activeRef.current = id
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }, [])

  // Inline edit handlers
  const handleStartEdit = useCallback((sectionId: string, content: string) => {
    setIsEditing(sectionId)
    setEditingContent(content)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(null)
    setEditingContent('')
  }, [])

  const handleSaveEdit = useCallback(async () => {
    if (!isEditing) return
    setSavingId(isEditing)
    try {
      await prd.updateSectionContent(projectId, isEditing, editingContent, true, true)
      onUpdateSectionContent(isEditing, editingContent)
      setIsEditing(null)
      setEditingContent('')
      showToast('Section saved. Snapshot baru dibuat.')
    } catch {
      showToast('Gagal menyimpan. Coba lagi.')
    } finally {
      setSavingId(null)
    }
  }, [isEditing, editingContent, projectId, onUpdateSectionContent, showToast])

  // Revision handlers
  const handleStartRevision = useCallback((sectionId: string) => {
    setRevisionSectionId(sectionId)
    setRevisionStep('form')
    setChangeType('modify')
    setChangeDescription('')
    setProposedContent('')
  }, [])

  const handleSubmitRevision = async () => {
    if (!revisionSectionId) return
    setRevisingLoading(true)
    try {
      const res = await prd.reviseSection(projectId, revisionSectionId, changeType, changeDescription)
      setProposedContent(res.proposed_content)
      setRevisionStep('preview')
    } catch {
      showToast('Revisi gagal. Coba lagi.')
      setRevisionSectionId(null)
    } finally {
      setRevisingLoading(false)
    }
  }

  const handleApproveRevision = useCallback(async () => {
    if (!revisionSectionId || !proposedContent) return
    setSavingId(revisionSectionId)
    try {
      await prd.updateSectionContent(projectId, revisionSectionId, proposedContent, true)
      onUpdateSectionContent(revisionSectionId, proposedContent)
      showToast('Revisi disimpan. Snapshot baru dibuat.')
    } catch {
      showToast('Gagal menyimpan revisi.')
    } finally {
      setSavingId(null)
      setRevisionSectionId(null)
      setProposedContent('')
    }
  }, [revisionSectionId, proposedContent, projectId, onUpdateSectionContent, showToast])

  const currentSectionForRevision = sections.find(s => s.id === revisionSectionId)

  return (
    <>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-panel)',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--accent)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontWeight: 700,
        }}>
          PRD LENGKAP — {sections.length} SECTIONS
        </div>
        <button
          className="term-btn"
          onClick={onRegenerateOutline}
          style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}
        >
          [+ REGENERATE OUTLINE]
        </button>
      </div>

      {/* Body */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        gap: 16,
        alignItems: 'start',
        padding: '0 20px 20px',
      }}>
        {/* Sidebar TOC */}
        <div id="prd-sidebar" className="term-panel" style={{
          padding: '8px 0',
          position: 'sticky',
          top: 80,
          maxHeight: 'calc(100vh - 140px)',
          overflowY: 'auto',
        }}>
          {sections.map(({ id, name }) => (
            <div
              key={id}
              data-section={id}
              onClick={() => scrollToSection(id)}
              style={{
                padding: '7px 14px',
                fontSize: 11,
                cursor: 'pointer',
                color: activeSection === id ? 'var(--accent)' : 'var(--text-muted)',
                borderLeft: activeSection === id ? '2px solid var(--accent)' : '2px solid transparent',
                background: activeSection === id ? 'rgba(138,155,174,0.06)' : 'transparent',
                transition: 'color 120ms, background 120ms',
                userSelect: 'none',
                fontFamily: 'var(--font-mono)',
              }}
              onMouseEnter={(e) => { if (activeSection !== id) e.currentTarget.style.color = 'var(--text-secondary)' }}
              onMouseLeave={(e) => { if (activeSection !== id) e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              {name}
            </div>
          ))}

          {/* Bottom nav */}
          <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0' }} />
          {bottomNav.map((link, i) => (
            <div
              key={i}
              onClick={link.onClick}
              style={{
                padding: '7px 14px',
                fontSize: 11,
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-secondary)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              {link.icon && <span style={{ fontSize: 10 }}>{link.icon}</span>}
              <span>{link.label}</span>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 }}>
          {sections.map(section => (
            <PrdDocSection
              key={section.id}
              section={section}
              isEditing={isEditing === section.id}
              editingContent={editingContent}
              savingId={savingId}
              onStartEdit={() => handleStartEdit(section.id, section.content ?? '')}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdit}
              onChangeContent={setEditingContent}
              onStartRevision={() => handleStartRevision(section.id)}
            />
          ))}
        </div>
      </div>

      {/* Revision Modal */}
      {revisionSectionId && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          zIndex: 50,
          padding: '40px 20px',
          overflowY: 'auto',
        }}>
          <div className="term-panel" style={{ padding: 24, maxWidth: 760, width: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                🤖 REVISI — {currentSectionForRevision?.name}
              </div>
              <button onClick={() => setRevisionSectionId(null)} className="term-btn" style={{ fontSize: 10 }}>✕</button>
            </div>

            {revisionStep === 'form' ? (
              <>
                {/* Change type */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                    Change Type
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['add', 'remove', 'modify'] as const).map(type => (
                      <button
                        key={type}
                        className={changeType === type ? 'term-btn-accent' : 'term-btn'}
                        style={{ fontSize: 10, textTransform: 'capitalize' }}
                        onClick={() => setChangeType(type)}
                      >
                        {type === 'add' ? '+ Tambah' : type === 'remove' ? '- Hapus' : '~ Ubah'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                    Deskripsi perubahan
                  </div>
                  <textarea
                    className="term-textarea"
                    value={changeDescription}
                    onChange={e => setChangeDescription(e.target.value)}
                    placeholder="Contoh: Tambahkan detail tentang integrasi payment gateway..."
                    style={{ minHeight: 80, fontSize: 12 }}
                  />
                </div>

                {/* Current content preview */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                    Konteks saat ini (read-only)
                  </div>
                  <div style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    padding: '10px 14px',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                    maxHeight: 120,
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.5,
                  }}>
                    {(currentSectionForRevision?.content ?? '').slice(0, 300)}...
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={() => setRevisionSectionId(null)} className="term-btn" style={{ fontSize: 10 }}>Batal</button>
                  <button
                    onClick={handleSubmitRevision}
                    className="term-btn-accent"
                    style={{ fontSize: 10 }}
                    disabled={revisingLoading}
                  >
                    {revisingLoading ? 'GENERATING...' : 'Submit → Generate Diff'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                    🔍 Proposed Diff
                  </div>
                  <DiffView
                    oldLabel="Current"
                    newLabel={`Proposed: ${changeType}`}
                    oldContent={currentSectionForRevision?.content ?? ''}
                    newContent={proposedContent}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={() => setRevisionStep('form')} className="term-btn" style={{ fontSize: 10 }}>← Ubah Request</button>
                  <button onClick={() => setRevisionSectionId(null)} className="term-btn" style={{ fontSize: 10 }}>❌ Reject</button>
                  <button onClick={handleApproveRevision} className="term-btn-accent" style={{ fontSize: 10 }}>✅ Approve &amp; Apply</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'var(--bg-panel)',
          border: '1px solid var(--success)',
          borderLeft: '3px solid var(--success)',
          borderRadius: 6,
          padding: '12px 16px',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-primary)',
          zIndex: 60,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          maxWidth: 360,
        }}>
          ✓ {toast}
        </div>
      )}
    </>
  )
}

// ─── PrdDocSection ─────────────────────────────────────────────────

interface SectionProps {
  section: PrdSection
  isEditing: boolean
  editingContent: string
  savingId: string | null
  onStartEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onChangeContent: (c: string) => void
  onStartRevision: () => void
}

function PrdDocSection({
  section,
  isEditing,
  editingContent,
  savingId,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onChangeContent,
  onStartRevision,
}: SectionProps) {
  return (
    <div id={section.id} className="term-panel" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-input)',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--accent)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          {section.name}
        </div>
        {!isEditing && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={onStartEdit} className="term-btn" style={{ fontSize: 9, padding: '3px 8px' }}>
              ✎ EDIT
            </button>
            <button onClick={onStartRevision} className="term-btn" style={{ fontSize: 9, padding: '3px 8px' }}>
              🤖 REVISI
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <textarea
              className="term-textarea"
              value={editingContent}
              onChange={e => onChangeContent(e.target.value)}
              style={{ minHeight: 300, fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.6 }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={onCancelEdit} className="term-btn" style={{ fontSize: 10 }}>Cancel</button>
              <button
                onClick={onSaveEdit}
                className="term-btn-accent"
                style={{ fontSize: 10 }}
                disabled={savingId === section.id}
              >
                {savingId === section.id ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            {section.content ? (
              <MarkdownViewer content={section.content} />
            ) : (
              <div style={{
                color: 'var(--text-muted)',
                fontStyle: 'italic',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
              }}>
                (Section content not yet generated)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
