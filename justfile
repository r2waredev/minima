# Minima Jekyll Theme - Task Runner
# Uses gojekyll for building, Playwright for testing

# Default recipe: show available commands
default:
    @just --list

# ─────────────────────────────────────────────────────────────────────────────
# Development
# ─────────────────────────────────────────────────────────────────────────────

# Start development server with live reload
serve:
    gojekyll serve

# Start dev server on custom port
serve-port port="4000":
    gojekyll serve --port {{ port }}

# Start server with drafts enabled
serve-drafts:
    gojekyll serve --drafts

# ─────────────────────────────────────────────────────────────────────────────
# Build
# ─────────────────────────────────────────────────────────────────────────────

# Build the site
build:
    gojekyll build

# Build with verbose output
build-verbose:
    gojekyll build --verbose

# Build including draft posts
build-drafts:
    gojekyll build --drafts

# Build for production (strict mode)
build-prod:
    JEKYLL_ENV=production gojekyll build

# ─────────────────────────────────────────────────────────────────────────────
# Clean
# ─────────────────────────────────────────────────────────────────────────────

# Remove generated site files
clean:
    rm -rf _site .jekyll-cache .sass-cache

# Remove all generated and dependency files
clean-all: clean
    rm -rf node_modules playwright-report test-results

# ─────────────────────────────────────────────────────────────────────────────
# Dependencies
# ─────────────────────────────────────────────────────────────────────────────

# Install Node.js dependencies
install:
    npm install

# Install dependencies (CI mode - uses lockfile)
install-ci:
    npm ci

# Install Playwright browsers
install-playwright:
    npx playwright install --with-deps

# Full setup: install all dependencies
setup: install install-playwright

# Update Node.js dependencies
update:
    npm update

# ─────────────────────────────────────────────────────────────────────────────
# Testing
# ─────────────────────────────────────────────────────────────────────────────

# Run Playwright tests (starts server automatically)
test:
    npm test

# Run tests with UI mode for debugging
test-ui:
    npm run test:ui

# Run tests in debug mode
test-debug:
    npm run test:debug

# Run tests in headed mode (visible browser)
test-headed:
    npx playwright test --headed

# Run a specific test file
test-file file:
    npx playwright test {{ file }}

# Show Playwright test report
test-report:
    npx playwright show-report

# ─────────────────────────────────────────────────────────────────────────────
# Distribution
# ─────────────────────────────────────────────────────────────────────────────

# Build and copy to _dist folder
dist: build
    rm -rf _dist
    cp -r _site _dist

# ─────────────────────────────────────────────────────────────────────────────
# Utilities
# ─────────────────────────────────────────────────────────────────────────────

# Create a new post with today's date
new-post title:
    @echo "---" > "_posts/$(date +%Y-%m-%d)-{{ title }}.md"
    @echo "layout: post" >> "_posts/$(date +%Y-%m-%d)-{{ title }}.md"
    @echo "title: \"{{ title }}\"" >> "_posts/$(date +%Y-%m-%d)-{{ title }}.md"
    @echo "date: $(date +%Y-%m-%d)" >> "_posts/$(date +%Y-%m-%d)-{{ title }}.md"
    @echo "---" >> "_posts/$(date +%Y-%m-%d)-{{ title }}.md"
    @echo "" >> "_posts/$(date +%Y-%m-%d)-{{ title }}.md"
    @echo "Created: _posts/$(date +%Y-%m-%d)-{{ title }}.md"

# Create a new draft post
new-draft title:
    @mkdir -p _drafts
    @echo "---" > "_drafts/{{ title }}.md"
    @echo "layout: post" >> "_drafts/{{ title }}.md"
    @echo "title: \"{{ title }}\"" >> "_drafts/{{ title }}.md"
    @echo "---" >> "_drafts/{{ title }}.md"
    @echo "" >> "_drafts/{{ title }}.md"
    @echo "Created: _drafts/{{ title }}.md"

# List all posts
posts:
    @ls -la _posts/

# List all pages
pages:
    @ls -la _pages/

# Check if gojekyll is installed
check-deps:
    @command -v gojekyll >/dev/null 2>&1 || { echo "gojekyll is not installed. Run: go install github.com/reidransom/gojekyll@latest"; exit 1; }
    @command -v node >/dev/null 2>&1 || { echo "Node.js is not installed"; exit 1; }
    @echo "All dependencies are available ✓"

# Watch SCSS files for changes (if using separate SCSS tooling)
watch-sass:
    @echo "Note: gojekyll handles SCSS compilation during serve"
    gojekyll serve

# ─────────────────────────────────────────────────────────────────────────────
# CI/CD
# ─────────────────────────────────────────────────────────────────────────────

# Full CI pipeline: install, build, test
ci: install-ci install-playwright build test

# Pre-commit checks
pre-commit: build test
    @echo "Pre-commit checks passed ✓"
