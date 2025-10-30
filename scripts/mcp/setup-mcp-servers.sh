#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔧 Setting up MCP servers for GlossiaApp${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. Figma Desktop MCP Server (HTTP Transport)
echo -e "${YELLOW}[1/2] Installing Figma Desktop MCP Server...${NC}"
claude mcp add --transport http figma-desktop http://127.0.0.1:3845/mcp
echo -e "${GREEN}✓ Figma Desktop MCP installed${NC}"
echo -e "  📖 Docs: https://www.figma.com/blog/introducing-figmas-dev-mode-mcp-server/"
echo -e "  ⚠️  Requires: Figma Desktop app running on port 3845"
echo ""

# 2. Atlassian MCP Server
echo -e "${YELLOW}[2/2] Installing Atlassian MCP Server...${NC}"
claude mcp add atlassian -- npx -y @atlassian/mcp-server
echo -e "${GREEN}✓ Atlassian MCP installed${NC}"
echo -e "  📖 Docs: https://developer.atlassian.com/platform/mcp/"
echo -e "  🔑 Requires: Atlassian API token configuration"
echo ""

# Verification
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All MCP servers installed successfully!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Verifying installation...${NC}"
claude mcp list
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo -e "  1. Start Figma Desktop app for Figma MCP"
echo -e "  2. Configure Atlassian API token (see docs)"
echo -e "  3. Run: npm run mcp:check"
