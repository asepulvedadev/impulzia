ecosistema-comercial/
├── .claude/
│   ├── settings.json          # Config hooks, permisos, MCP
│   ├── commands/              # Slash commands personalizados
│   │   ├── plan.md
│   │   ├── implement.md
│   │   ├── tdd.md
│   │   ├── review.md
│   │   └── deploy.md
│   └── agents/                # Agentes especializados
│       ├── orchestrator.md    # 🎯 Agente principal
│       ├── negocios.md
│       ├── anuncios.md
│       ├── incentivos.md
│       ├── marketplace.md
│       ├── social.md
│       ├── ia-center.md
│       ├── auth.md
│       ├── testing.md
│       └── ui-design.md
├── CLAUDE.md                  # 🧠 Archivo principal (o AGENTS.md)
├── AGENTS.md                  # Compatibilidad multi-herramienta
├── IMPLEMENTATION_PLAN.md     # Plan de fases actual
├── src/
│   ├── modules/
│   │   ├── negocios/
│   │   │   └── AGENTS.md      # Contexto específico del módulo
│   │   ├── anuncios/
│   │   │   └── AGENTS.md
│   │   ├── incentivos/
│   │   │   └── AGENTS.md
│   │   ├── marketplace/
│   │   │   └── AGENTS.md
│   │   ├── social/
│   │   │   └── AGENTS.md
│   │   ├── suscripciones/
│   │   │   └── AGENTS.md
│   │   └── ia/
│   │       └── AGENTS.md
│   ├── lib/                   # Utilidades compartidas
│   ├── components/            # UI components
│   └── app/                   # Next.js App Router
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── supabase/
    ├── migrations/
    └── seed.sql