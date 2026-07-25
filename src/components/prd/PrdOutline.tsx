import { useState } from 'react'
import type { PrdData, PrdSection } from '../../utils/api'
import { prd } from '../../utils/api'

interface Props {
  projectId: string
  prdData: PrdData | null
  onOutlineGenerated: (data: PrdData) => void
  onConfirm: (sections: PrdSection[]) => void
}

const TIER_LABELS: Record<number, string> = {
  1: 'Tool / Web',
  2: 'Web App',
  3: 'Full-Stack App',
  4: 'Platform',
  5: 'Consumer App',
  6: 'Enterprise / Internal',
}

const FLAG_LABELS: Record<string, string> = {
  has_payments: '💳 Payment',
  has_notifications: '🔔 Notifications',
  has_file_uploads: '📎 File Uploads',
  has_i18n: '🌐 Multi-language',
  has_real_time: '⚡ Real-time',
  has_ai_ml: '🤖 AI/ML',
  has_multi_tenant: '🏢 Multi-tenant',
  has_analytics: '📊 Analytics',
  has_export: '📤 Export',
}

export default function PrdOutline({ projectId, prdData, onOutlineGenerated, onConfirm }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sections, setSections] = useState<PrdSection[]>(prdData?.sections ?? [])

  const handleGenerateOutline = async () => {
    setLoading(true)
    setError(null)
    try {
      const { prdData: data } = await prd.generateOutline(projectId)
      setSections(data.sections)
      onOutlineGenerated(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal generate outline')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    onConfirm(sections)
  }

  const handleRemoveSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id))
  }

  const handleRestoreSection = (section: PrdSection) => {
    setSections(prev => [...prev, section].sort((a, b) => a.priority - b.priority))
  }

  // No outline yet — show generate button
  if (!prdData && !loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 40px',
        gap: 24,
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          PRD OUTLINE
        </div>

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          color: 'var(--text-secondary)',
          textAlign: 'center',
          maxWidth: 480,
          lineHeight: 1.6,
        }}>
          AI akan menganalisis proyek Anda dan<br />
          merekomendasikan struktur PRD yang optimal.
        </div>

        {error && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--error, #e07070)',
            background: 'rgba(224,112,112,0.1)',
            border: '1px solid rgba(224,112,112,0.3)',
            padding: '10px 16px',
            borderRadius: 6,
            maxWidth: 480,
          }}>
            {error}
          </div>
        )}

        <button
          className="term-btn-accent"
          onClick={handleGenerateOutline}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            padding: '12px 28px',
            letterSpacing: '0.04em',
          }}
        >
          [ ANALYZE PROJECT &amp; RECOMMEND SECTIONS ]
        </button>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 40px',
        gap: 20,
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: 'var(--accent)',
          letterSpacing: '0.04em',
        }}>
          ANALYZING PROJECT...
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-muted)',
        }}>
          Classifying project type + recommending sections
        </div>
        <div style={{
          width: 240,
          height: 2,
          background: 'var(--border)',
          borderRadius: 1,
          overflow: 'hidden',
        }}>
          <div style={{
            width: '60%',
            height: '100%',
            background: 'var(--accent)',
            animation: 'pulse 1.2s ease-in-out infinite',
          }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            PRD Outline
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-muted)',
            marginTop: 4,
          }}>
            {sections.length} sections · AI-recommended
          </div>
        </div>
        <button
          className="term-btn"
          onClick={handleGenerateOutline}
          style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}
        >
          ↻ Regenerate
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: '#e07070',
          background: 'rgba(224,112,112,0.1)',
          border: '1px solid rgba(224,112,112,0.3)',
          padding: '10px 14px',
          borderRadius: 6,
        }}>
          {error}
        </div>
      )}

      {/* Tier + Flags */}
      {prdData && (
        <div className="term-panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                TIER
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>
                TIER {prdData.tier} — {TIER_LABELS[prdData.tier] ?? 'Unknown'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                {prdData.tier_reason}
              </div>
            </div>

            {prdData.flags.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  FLAGS
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {prdData.flags.map(flag => (
                    <span
                      key={flag}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: 'var(--text-secondary)',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border)',
                        padding: '2px 8px',
                        borderRadius: 3,
                      }}
                    >
                      {FLAG_LABELS[flag] ?? flag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sections list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sections.map((section, idx) => (
          <div
            key={section.id}
            className="term-panel"
            style={{
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            {/* Priority badge */}
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--text-muted)',
              minWidth: 20,
              paddingTop: 2,
            }}>
              {section.is_mandatory ? '★' : (idx + 1)}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: section.is_mandatory ? 'var(--accent)' : 'var(--text-primary)',
                fontWeight: section.is_mandatory ? 700 : 400,
              }}>
                {section.name}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-muted)',
                marginTop: 2,
              }}>
                {section.description}
              </div>
            </div>

            {!section.is_mandatory && (
              <button
                onClick={() => handleRemoveSection(section.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  padding: '2px 4px',
                }}
                title="Remove section"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Skipped sections (collapsible) */}
      {prdData && prdData.skipped_sections.length > 0 && (
        <details style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
          <summary style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-muted)',
            padding: '8px 14px',
            cursor: 'pointer',
            background: 'var(--bg-input)',
          }}>
            Skipped sections ({prdData.skipped_sections.length})
          </summary>
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {prdData.skipped_sections.map(skipped => (
              <div key={skipped.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', flex: 1 }}>
                  {skipped.id}
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>
                    {skipped.reason}
                  </div>
                </div>
                <button
                  onClick={() => handleRestoreSection({
                    id: skipped.id,
                    name: skipped.id.replace(/-/g, ' '),
                    description: skipped.reason,
                    priority: 5,
                    is_mandatory: false,
                    content: null,
                    order: sections.length,
                  })}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    padding: '2px 8px',
                    borderRadius: 3,
                  }}
                >
                  + Restore
                </button>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Confirm button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
        <button
          className="term-btn-accent"
          onClick={handleConfirm}
          disabled={sections.length === 0}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            padding: '10px 24px',
            opacity: sections.length === 0 ? 0.5 : 1,
            cursor: sections.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          [ CONFIRM OUTLINE — {sections.length} SECTIONS ]
        </button>
      </div>
    </div>
  )
}
