import { useEffect, useRef, useReducer } from 'react'
import { prd } from '../../utils/api'
import type { PrdSection, SectionStatus } from '../../stores/prdStore'

interface SectionProgressItem {
  status: SectionStatus
  content: string | null
  error?: string
}

interface Props {
  projectId: string
  sections: PrdSection[]
  onSectionComplete: (sectionId: string, content: string) => void
  onSectionError: (sectionId: string, error: string) => void
  onGeneratingSection: (sectionId: string) => void
  onComplete: () => void
  onError: (error: string) => void
}

const STATUS_ICONS: Record<SectionStatus, string> = {
  pending: '○',
  generating: '◐',
  done: '●',
  error: '✕',
}

const STATUS_COLORS: Record<SectionStatus, string> = {
  pending: 'var(--text-muted)',
  generating: 'var(--accent)',
  done: 'var(--success, #8CAE8C)',
  error: '#e07070',
}

export default function PrdProgress({
  projectId,
  sections,
  onSectionComplete,
  onSectionError,
  onGeneratingSection,
  onComplete,
  onError,
}: Props) {
  const progressRef = useRef<Record<string, SectionProgressItem>>({})
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [, forceUpdate] = useReducer(x => x + 1, 0)

  // Track which section is being generated
  const generatingId = useRef<string | null>(null)
  const doneCount = useRef(0)
  const totalCount = sections.length

  // Trigger re-render helper
  function rerender() { forceUpdate() }

  useEffect(() => {
    // Subscribe to SSE stream
    prd.generateContent(projectId, {
      outline_confirmed: () => {
        rerender()
      },

      generating: (genData) => {
        generatingId.current = genData.current_section
        progressRef.current[genData.current_section] = {
          status: 'generating',
          content: null,
        }
        onGeneratingSection(genData.current_section)
        rerender()
      },

      section_complete: (data) => {
        progressRef.current[data.section_id] = {
          status: 'done',
          content: data.content,
        }
        doneCount.current++
        generatingId.current = null
        onSectionComplete(data.section_id, data.content)
        rerender()
        // Auto-scroll to new content
        setTimeout(() => {
          const el = contentRefs.current[data.section_id]
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      },

      section_error: (data) => {
        progressRef.current[data.section_id] = {
          status: 'error',
          content: null,
          error: data.error,
        }
        onSectionError(data.section_id, data.error)
        generatingId.current = null
        rerender()
      },

      complete: () => {
        onComplete()
        rerender()
      },

      fatal_error: (data) => {
        onError(data.message)
        rerender()
      },
    }).catch((err: Error) => {
      onError(err.message)
      rerender()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const progress = totalCount > 0 ? Math.round((doneCount.current / totalCount) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--accent)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontWeight: 700,
        }}>
          GENERATING PRD
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-muted)',
        }}>
          {doneCount.current}/{totalCount} sections
        </div>
        <div style={{
          flex: 1,
          height: 3,
          background: 'var(--border)',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'var(--accent)',
            transition: 'width 400ms ease',
          }} />
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--accent)',
          fontWeight: 700,
          minWidth: 36,
        }}>
          {progress}%
        </div>
      </div>

      {/* Content area: checklist + section content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        flex: 1,
        overflow: 'hidden',
      }}>
        {/* Checklist */}
        <div style={{
          borderRight: '1px solid var(--border)',
          overflowY: 'auto',
          padding: '12px 0',
        }}>
          {sections.map(section => {
            const prog = progressRef.current[section.id] ?? { status: 'pending', content: null }
            const isGenerating = generatingId.current === section.id

            return (
              <div
                key={section.id}
                style={{
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'default',
                  background: isGenerating ? 'rgba(138,155,174,0.08)' : 'transparent',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: STATUS_COLORS[prog.status],
                  minWidth: 14,
                  textAlign: 'center',
                }}>
                  {isGenerating ? '◐' : STATUS_ICONS[prog.status]}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: prog.status === 'done'
                    ? 'var(--text-primary)'
                    : prog.status === 'generating'
                      ? 'var(--accent)'
                      : prog.status === 'error'
                        ? '#e07070'
                        : 'var(--text-muted)',
                }}>
                  {section.name}
                </span>
              </div>
            )
          })}
        </div>

        {/* Section content preview */}
        <div style={{
          overflowY: 'auto',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          {sections.map(section => {
            const prog = progressRef.current[section.id] ?? { status: 'pending', content: null }

            return (
              <div
                key={section.id}
                id={`gen-section-${section.id}`}
                ref={(el) => { contentRefs.current[section.id] = el }}
                style={{
                  background: 'var(--bg-panel)',
                  border: `1px solid ${prog.status === 'generating' ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 6,
                  overflow: 'hidden',
                }}
              >
                {/* Section header */}
                <div style={{
                  padding: '8px 14px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--bg-input)',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    color: STATUS_COLORS[prog.status],
                  }}>
                    {STATUS_ICONS[prog.status]}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    {section.name}
                  </span>
                  {prog.status === 'generating' && (
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      color: 'var(--accent)',
                      animation: 'blink 1s step-end infinite',
                    }}>
                      GENERATING...
                    </span>
                  )}
                  {prog.status === 'error' && (
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      color: '#e07070',
                    }}>
                      ERROR
                    </span>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '12px 14px' }}>
                  {prog.status === 'pending' && (
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      fontStyle: 'italic',
                    }}>
                      Waiting in queue...
                    </div>
                  )}
                  {prog.status === 'generating' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 16,
                        height: 16,
                        border: '2px solid var(--border)',
                        borderTopColor: 'var(--accent)',
                        borderRadius: '50%',
                        animation: 'spin 600ms linear infinite',
                      }} />
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: 'var(--accent)',
                      }}>
                        Writing content...
                      </span>
                    </div>
                  )}
                  {prog.status === 'done' && prog.content && (
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      maxHeight: 200,
                      overflow: 'hidden',
                    }}>
                      {prog.content.slice(0, 400)}
                      {prog.content.length > 400 && (
                        <span style={{ color: 'var(--text-muted)' }}>...</span>
                      )}
                    </div>
                  )}
                  {prog.status === 'error' && (
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: '#e07070',
                    }}>
                      Error: {prog.error}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
