# Brikblok – LEGO Set Management Platform

Comprehensive LEGO collection management system with BrickLink API integration. Acts as an **artifact codex** within the Redder Edge ecosystem, bridging physical and digital realms through systematic cataloging.

## Core Capabilities
- **Set Management** – CLI and web interfaces for tracking 200+ sets with rich metadata
- **BrickLink Integration** – OAuth 1.0a API client for real-time set data, pricing, inventory
- **Collection Analytics** – Piece counts, minifigure inventories, condition tracking
- **Data Operations** – XML import/export, bulk operations, database management
- **Web Interface** – Responsive EJS templates for browsing and managing collections

## Quick Start
```bash
npm i
cp .env.example .env  # Add your BrickLink API credentials
npm run sets list     # View collection
npm run web          # Launch web interface
```

## Available Commands
```bash
# Collection Management
npm run sets add <set-number>    # Add set via BrickLink API
npm run sets list               # List all sets
npm run sets get <set-number>   # Show set details

# Web Interfaces
npm run web                     # Full web app with BrickLink data
npm run simple                  # Simple set tracker

# Data Operations
npm run bulk                    # Bulk add sets from file
npm run import                  # Import XML data
npm run export                  # Export to XML
npm run conditions              # Cross-reference conditions
npm run pieces                  # Add piece counts
npm run categories              # Add category names
npm run minifigs                # Add minifigure details
npm run minifig-db              # Create minifigure database

# API Examples
npm run get                     # BrickLink GET examples
npm run post                    # Create inventory (seller access required)
npm run webhook                 # Push notification server
```

## Architecture
- **`src/bl_client.js`** – OAuth 1.0a BrickLink API client
- **`src/lego_sets_app.js`** – CLI collection management
- **`web_server.js`** – Full web application
- **`lego_sets.json`** – Collection database (200+ sets)
- **`minifig_database.json`** – Minifigure catalog
- **`views/`** – EJS templates with responsive design

## Artifact Codex Philosophy
Brikblok embodies Redder Edge principles:
- **Vulnerability as Strength** – Open collection sharing, imperfect inventory states
- **Quiet Leadership** – Tools that enable collectors rather than dictate approaches  
- **Imperfect Growth** – Continuous evolution through SSP (sync and ship, please) workflow

## Technical Notes
- BrickLink OAuth 1.0a (HMAC-SHA1) authentication
- Rate limiting with backoff/retry logic
- Comprehensive error handling and validation
- Responsive web design based on lowdiatribe architecture
- XML/JSON data interchange formats