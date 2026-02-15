# Minima

A Jekyll site built with [gojekyll](https://github.com/reidransom/gojekyll).

## Prerequisites

- [Go](https://golang.org/dl/) 1.21+
- [just](https://github.com/casey/just) (task runner)
- [Node.js](https://nodejs.org/) 20+ (optional, for testing)

Install gojekyll:

```sh
go install github.com/reidransom/gojekyll@latest
```

## Quick Start

```sh
just serve
```

The site will be available at http://localhost:4000

## Common Tasks

```sh
just                  # List all available commands
just build            # Build the site
just clean            # Remove generated files
just setup            # Install test dependencies (Node.js required)
just test             # Run Playwright tests
just new-post "title" # Create a new blog post
```

## Project Structure

```
_config.yml    # Site configuration
_includes/     # Reusable HTML partials
_layouts/      # Page templates
_pages/        # Static pages
_posts/        # Blog posts
_sass/         # SCSS styles
assets/        # Static assets (CSS, JS, images)
_site/         # Generated site (git-ignored)
```

## Testing

Playwright tests verify mobile responsiveness:

```sh
just test         # Run tests
just test-ui      # Run with interactive UI
just test-report  # View test report
```

## License

MIT
