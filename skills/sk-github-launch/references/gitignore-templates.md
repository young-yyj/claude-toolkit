# .gitignore 模板参考

## Node.js / TypeScript

```gitignore
# Dependencies
node_modules/

# Build output
dist/
build/
.next/
out/

# Environment
.env
.env.local
.env.development
.env.production

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# TypeScript
*.tsbuildinfo
```

## Python

```gitignore
# Bytecode
__pycache__/
*.py[cod]
*.pyo

# Virtual environment
.venv/
venv/
env/

# Build
dist/
build/
*.egg-info/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Jupyter
.ipynb_checkpoints/

# Testing
.pytest_cache/
.coverage
htmlcov/
```

## .NET / WPF / C#

```gitignore
# Build
bin/
obj/

# IDE
.vs/
*.user
*.suo
*.userosscache
*.sln.docstates

# NuGet
packages/
*.nupkg

# Test
TestResults/

# OS
.DS_Store
Thumbs.db
```

## Go

```gitignore
# Build
*.exe
*.exe~
*.dll
*.so
*.dylib
/bin/
/dist/

# Test
*.test
*.out

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Environment
.env
```

## Java / Maven / Gradle

```gitignore
# Build
target/
build/
!gradle/wrapper/gradle-wrapper.jar

# IDE
.idea/
*.iml
.classpath
.project
.settings/

# OS
.DS_Store
Thumbs.db

# Environment
.env
```

## Rust

```gitignore
# Build
target/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Environment
.env
```

## 通用追加（所有项目适用）

```gitignore
# Sensitive files
*.pem
*.key
*.pfx
*.p12
credentials.json
service-account.json

# Environment
.env*
!.env.example

# OS
.DS_Store
Thumbs.db
desktop.ini

# Archives
*.zip
*.tar.gz
*.7z
```
