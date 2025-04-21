# Clean Architecture Guidelines
## Directory Structure

```
src/
├── domain/           # Core business logic, models, types, interfaces
│   ├── models/       # Domain entities and value objects
│   ├── types/        # TypeScript type definitions
│   ├── constants/    # Domain constants
│   ├── validation/   # Domain validation logic
│   └── services/     # Domain service interfaces (abstract)
│
├── application/      # Use cases, application logic, state
│   ├── hooks/        # Application-specific React hooks
│   ├── services/     # Application service implementations
│   ├── contexts/     # React contexts
│   ├── providers/    # Context providers (if separate from contexts)
│   └── stores/       # State management stores (e.g., Zustand) - Optional
│
├── infrastructure/   # External concerns: frameworks, drivers, tools
│   ├── api/          # API client implementation(s)
│   ├── storage/      # Local/session storage wrappers
│   ├── auth/         # Authentication service integrations
│   ├── clients/      # Other external client integrations
│   └── config/       # Infrastructure-specific config loading
│
├── presentation/     # UI components, styles, assets (Atomic Design)
│   ├── atoms/        # Basic UI building blocks
│   ├── molecules/    # Simple combinations of atoms
│   ├── organisms/    # Complex UI components / sections
│   ├── templates/    # Page layout structures
│   ├── pages/        # Application pages/routes
│   ├── providers/    # UI-specific context providers (e.g., ThemeProvider)
│   ├── styles/       # Global styles, base styles
│   ├── assets/       # Static assets (images, fonts)
│   ├── shaders/      # GLSL shaders for visualizations
│   └── utils/        # UI-specific utility functions
│
├── shared/           # Utilities/types shared across multiple layers
│   └── utils/        # Shared utility functions (e.g., cn, formatting)
│
└── main.tsx          # Application entry point
```
*Note: This reflects the general structure. Specific subdirectories like `stores` or `validation` might vary based on implementation details.*

## Import Rules

1. Domain → No external dependencies
2. Application → Can import from Domain
3. Infrastructure → Can import from Domain and Application
4. Presentation → Can import from all layers
5. Presentation → Can import from Application, Domain, Shared
6. main.tsx → Can import from all layers to bootstrap

## Path Aliases (`tsconfig.json`)

Consistent path aliases are configured in `tsconfig.json`. While `vite-tsconfig-paths` is intended for automatic resolution, issues were encountered. Currently, aliases are defined explicitly within `config/vite.config.ts`'s `resolve.alias` array to ensure correct resolution by the Vite dev server and build process. This enforces architectural boundaries and simplifies imports:

```json
// tsconfig.json (paths section)
"paths": {
  "@/*": ["src/*"],
  "@domain/*": ["src/domain/*"],
  "@application/*": ["src/application/*"],
  "@infrastructure/*": ["src/infrastructure/*"],
  "@presentation/*": ["src/presentation/*"],
  "@shared/*": ["src/shared/*"],
  "@atoms/*": ["src/presentation/atoms/*"],
  "@molecules/*": ["src/presentation/molecules/*"],
  "@organisms/*": ["src/presentation/organisms/*"],
  "@templates/*": ["src/presentation/templates/*"],
  "@pages/*": ["src/presentation/pages/*"],
  "@hooks/*": ["src/application/hooks/*"],
  "@contexts/*": ["src/application/contexts/*"],
  "@providers/*": ["src/application/providers/*"], // Note: Points to application providers
  "@stores/*": ["src/application/stores/*"], // If stores are used
  "@services/*": ["src/application/services/*"], // Points to application services
  "@clients/*": ["src/infrastructure/clients/*"],
  "@api/*": ["src/infrastructure/api/*"],
  "@utils/*": ["src/shared/utils/*"], // Points to shared utils
  "@types/*": ["src/domain/types/*"],
  "@models/*": ["src/domain/models/*"],
  "@constants/*": ["src/domain/constants/*"],
  "@validation/*": ["src/domain/validation/*"],
  "@assets/*": ["src/presentation/assets/*"],
  "@styles/*": ["src/presentation/styles/*"],
  "@shaders/*": ["src/presentation/shaders/*"],
  "@test/*": ["src/test/*"],
  "@config/*": ["config/*"] // Alias for top-level config directory
}
```