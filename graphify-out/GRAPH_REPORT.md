# Graph Report - prd-chamber  (2026-08-01)

## Corpus Check
- 88 files · ~48,392 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 571 nodes · 878 edges · 49 communities (41 shown, 8 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b2c8e6a2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- scripts
- devDependencies
- structure.ts
- dependencies
- compilerOptions
- MarkdownViewer.tsx
- compilerOptions
- compilerOptions
- src/index.ts
- prd/handlers.ts
- export/handlers.ts
- tasks/handlers.ts
- PrdPage.tsx
- api.ts
- Layout.tsx
- react
- clarify/handlers.ts
- schema.ts
- TopStepper.tsx
- PrdProgress.tsx
- fixer.ts
- versions/handlers.ts
- SharePage.tsx
- main.tsx
- plugins
- DiffView.tsx
- content-prompts.ts
- ExportPage.tsx
- PrdSection.tsx
- MermaidBlock.tsx
- TaskPage.tsx
- PRD Chamber — Server
- MarkdownErrorBoundary
- PrdSidebar.tsx
- React + TypeScript + Vite
- seed_versions.cjs
- Sidebar.tsx
- StructurePage.tsx
- migrate-versions.js
- migrate.ts
- 0002_version_snapshot.cjs
- EmptyState.tsx
- ErrorBanner.tsx
- tsconfig.json

## God Nodes (most connected - your core abstractions)
1. `react` - 31 edges
2. `compilerOptions` - 18 edges
3. `compilerOptions` - 15 edges
4. `compilerOptions` - 15 edges
5. `db` - 13 edges
6. `Layout()` - 13 edges
7. `exportProject()` - 11 edges
8. `chatCompletion()` - 11 edges
9. `scripts` - 9 edges
10. `projects` - 9 edges

## Surprising Connections (you probably didn't know these)
- `exportProject()` --references--> `jszip`  [EXTRACTED]
  server/src/export/handlers.ts → package.json
- `generateOutline()` --calls--> `chatCompletion()`  [EXTRACTED]
  server/src/prd/handlers.ts → server/src/llm/client.ts
- `reviseSection()` --calls--> `chatCompletion()`  [EXTRACTED]
  server/src/prd/handlers.ts → server/src/llm/client.ts
- `generateTasks()` --calls--> `chatCompletion()`  [EXTRACTED]
  server/src/tasks/handlers.ts → server/src/llm/client.ts
- `PhaseNodeProps` --references--> `StructureNodeData`  [EXTRACTED]
  src/components/nodes/PhaseNode.tsx → src/stores/structure.ts

## Import Cycles
- None detected.

## Communities (49 total, 8 thin omitted)

### Community 0 - "scripts"
Cohesion: 0.05
Nodes (43): bcryptjs, better-sqlite3, drizzle-kit, drizzle-orm, hono, @hono/node-server, jsonwebtoken, marked (+35 more)

### Community 1 - "devDependencies"
Cohesion: 0.06
Nodes (34): dagre, oxlint, devDependencies, dagre, oxlint, tailwindcss, @tailwindcss/typography, @tailwindcss/vite (+26 more)

### Community 2 - "structure.ts"
Cohesion: 0.11
Nodes (23): ICON_MAP, SubGroupIcon, nodeTypes, PhaseNode, PhaseNodeProps, RootNode, RootNodeProps, SubFeatureGroupData (+15 more)

### Community 3 - "dependencies"
Cohesion: 0.08
Nodes (25): jszip, lucide-react, mermaid, dependencies, jszip, lucide-react, mermaid, react (+17 more)

### Community 4 - "compilerOptions"
Cohesion: 0.08
Nodes (23): DOM, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib (+15 more)

### Community 5 - "MarkdownViewer.tsx"
Cohesion: 0.08
Nodes (22): baseStyles, blockquoteStyle, codeBlockStyle, ErrorBoundaryState, h1Style, h2Style, h3Style, h4Style (+14 more)

### Community 6 - "compilerOptions"
Cohesion: 0.09
Nodes (21): dist, ES2022, node_modules, compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames (+13 more)

### Community 7 - "compilerOptions"
Cohesion: 0.10
Nodes (19): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+11 more)

### Community 8 - "src/index.ts"
Cohesion: 0.18
Nodes (16): loginHandler(), logoutHandler(), meHandler(), users, app, authMiddleware(), ContextVariableMap, COOKIE_NAME (+8 more)

### Community 9 - "prd/handlers.ts"
Cohesion: 0.16
Nodes (16): activeGenerations, activeOutlines, clearPrd(), generateOutline(), generatePrdContent(), getLLMConfig(), getPrd(), PrdData (+8 more)

### Community 10 - "export/handlers.ts"
Cohesion: 0.18
Nodes (15): addHeadingIds(), buildPrdMarkdown(), buildSpecMarkdown(), buildTasksMarkdown(), buildVersionsJson(), ExportFormat, exportProject(), injectStyles() (+7 more)

### Community 11 - "tasks/handlers.ts"
Cohesion: 0.16
Nodes (13): ChatMessage, DEFAULT_BASE_URLS, LLMConfig, PrdSection, RevisionRequest, buildTasksPrompt(), StructurePhase, generateTasks() (+5 more)

### Community 12 - "PrdPage.tsx"
Cohesion: 0.21
Nodes (13): NavLink, PrdDocument(), Props, SectionProps, FLAG_LABELS, PrdOutline(), Props, TIER_LABELS (+5 more)

### Community 13 - "api.ts"
Cohesion: 0.15
Nodes (14): DashboardPage(), ApiSettings, AuthUser, clearToken(), ExportOptions, getToken(), Project, projects (+6 more)

### Community 14 - "Layout.tsx"
Cohesion: 0.17
Nodes (12): Layout(), Props, buildDiffText(), ComparePage(), GeneratePrdPage(), SectionProgress, sections, formatDate() (+4 more)

### Community 15 - "react"
Cohesion: 0.15
Nodes (10): react, SubFeatureData, SubFeatureNode, Props, Question, QuestionCard(), borderColors, Props (+2 more)

### Community 16 - "clarify/handlers.ts"
Cohesion: 0.18
Nodes (13): ClarifyQuestion, generateClarifyQuestions(), getClarificationAnswers(), saveClarificationAnswers(), clarificationAnswers, buildClarifyPrompt(), chatCompletion(), getBaseUrl() (+5 more)

### Community 17 - "schema.ts"
Cohesion: 0.22
Nodes (9): db, sqlite, projects, projectVersions, settings, generateId(), seed(), getSettingsHandler() (+1 more)

### Community 18 - "TopStepper.tsx"
Cohesion: 0.21
Nodes (12): ProjectTitle(), Props, getActiveStep(), Step, StepDef, STEPS, TopStepper(), dummyProjects (+4 more)

### Community 19 - "PrdProgress.tsx"
Cohesion: 0.21
Nodes (11): PrdProgress(), Props, SectionProgressItem, STATUS_COLORS, STATUS_ICONS, GenerateState, PrdData, PrdSection (+3 more)

### Community 20 - "fixer.ts"
Cohesion: 0.27
Nodes (10): applyRegexFixes(), FixChange, fixFlowchartNodeSpaces(), fixInlineAttributesOnRelations(), fixMermaidDiagrams(), fixMissingErDirective(), FixOptions, FixResult (+2 more)

### Community 21 - "versions/handlers.ts"
Cohesion: 0.22
Nodes (9): updateSectionContent(), mutexes, withMutex(), compareVersions(), createVersionSnapshot(), listVersions(), restoreVersion(), SnapshotTrigger (+1 more)

### Community 22 - "SharePage.tsx"
Cohesion: 0.20
Nodes (8): dummyPrdContent, dummyProjects, dummyQuestions, dummyStructure, dummyTasks, dummyVersions, sectionMeta, SharePage()

### Community 23 - "main.tsx"
Cohesion: 0.27
Nodes (7): ClarificationPage(), InputIdeaPage(), LoginPage(), PROVIDERS, SettingsPage(), auth, settings

### Community 24 - "plugins"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 25 - "DiffView.tsx"
Cohesion: 0.28
Nodes (6): computeSectionDiff(), DiffItem, DiffView(), Props, ChangeType, Props

### Community 26 - "content-prompts.ts"
Cohesion: 0.32
Nodes (7): buildSectionPrompt(), ClarifyAnswers, formatAnswers(), formatStructure(), OutlineContext, PrdSection, StructurePhase

### Community 27 - "ExportPage.tsx"
Cohesion: 0.33
Nodes (6): ExportPage(), Format, FORMATS, triggerDownload(), exportApi, tasks

### Community 28 - "PrdSection.tsx"
Cohesion: 0.33
Nodes (4): MarkdownViewer(), splitMarkdown(), PrdSection, Props

### Community 29 - "MermaidBlock.tsx"
Cohesion: 0.47
Nodes (5): applySVGOverrides(), initMermaid(), MERMAID_CONFIG, MermaidBlock(), MermaidBlockProps

### Community 30 - "TaskPage.tsx"
Cohesion: 0.53
Nodes (5): generatePrompt(), getFeaturesByPhase(), groupByPhase(), TaskPage(), Task

### Community 31 - "PRD Chamber — Server"
Cohesion: 0.40
Nodes (4): Development, Endpoints (Step 1), PRD Chamber — Server, Setup

### Community 33 - "PrdSidebar.tsx"
Cohesion: 0.40
Nodes (4): NavLink, PrdSidebar, Props, Section

### Community 34 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

### Community 35 - "seed_versions.cjs"
Cohesion: 0.50
Nodes (3): d, db, projects

### Community 37 - "StructurePage.tsx"
Cohesion: 0.50
Nodes (3): PageState, StructurePage(), structure

## Knowledge Gaps
- **255 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+250 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `PrdSidebar.tsx`, `structure.ts`, `MarkdownViewer.tsx`, `StructurePage.tsx`, `PrdPage.tsx`, `api.ts`, `Layout.tsx`, `TopStepper.tsx`, `PrdProgress.tsx`, `main.tsx`, `plugins`, `DiffView.tsx`, `ExportPage.tsx`, `PrdSection.tsx`, `MermaidBlock.tsx`, `TaskPage.tsx`?**
  _High betweenness centrality (0.187) - this node is a cross-community bridge._
- **Why does `exportProject()` connect `export/handlers.ts` to `src/index.ts`, `dependencies`?**
  _High betweenness centrality (0.140) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _255 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `structure.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1053763440860215 - nodes in this community are weakly interconnected._