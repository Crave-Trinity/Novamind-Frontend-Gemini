# Browser MCP Tools Integration Guide for Novamind Frontend

## Overview

This document explains how to integrate and utilize the Browser Tools MCP (Model Context Protocol) for testing, debugging, and monitoring the Novamind Digital Twin frontend application. The Browser Tools MCP provides critical capabilities for capturing browser console logs, network activity, screenshots, and running accessibility and performance audits.

## Architecture

The Browser Tools MCP consists of three essential components that work together:

1. **Chrome Extension**: Captures browser events, logs, and screenshots
2. **Node.js Server (Middleware)**: Processes and relays data between the extension and MCP server
3. **MCP Server**: Implements the Model Context Protocol to expose tools to AI systems

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐     ┌─────────────┐
│  AI Client  │ ──► │  MCP Server  │ ──► │  Node Server  │ ──► │   Chrome    │
│  (e.g.      │ ◄── │  (Protocol   │ ◄── │ (Middleware)  │ ◄── │  Extension  │
│   Cline)    │     │   Handler)   │     │               │     │             │
└─────────────┘     └──────────────┘     └───────────────┘     └─────────────┘
```

## Setup Instructions

### 1. Install the Chrome Extension

1. Download the latest version of the BrowserToolsMCP Chrome Extension
2. Install it in Chrome by going to `chrome://extensions/`, enabling Developer mode, and dragging the downloaded file
3. Verify the extension is enabled and appears in your extensions list

### 2. Install the Node.js Server (Middleware)

```bash
# Run in a dedicated terminal - this server must stay running
npx @agentdeskai/browser-tools-server@latest
```

### 3. Install the MCP Server

```bash
# Run in a separate terminal - this server must also stay running
npx @agentdeskai/browser-tools-mcp@latest
```

## Important Usage Notes

### Log Persistence Requirements

**CRITICAL**: The browser session must remain open for logs to persist. The current implementation of Browser Tools MCP has the following characteristics:

1. Logs are stored in memory within the current browser session
2. Closing the browser or tab will clear the stored logs
3. The MCP server retrieves logs from the active browser session only

To maintain logs throughout a testing session:
- Keep the browser window open until testing is complete
- Use the browser-action tool sequence: launch → perform actions → capture logs → close

### Available MCP Tools

The following tools are available through the Browser Tools MCP:

| Tool Name | Purpose | Usage |
|-----------|---------|-------|
| `getConsoleLogs` | Retrieve console logs | Capture info/debug/warn logs |
| `getConsoleErrors` | Retrieve console errors | Capture error logs specifically |
| `getNetworkLogs` | Retrieve all network requests | Analyze API calls and responses |
| `getNetworkErrors` | Retrieve failed network requests | Identify network failures |
| `takeScreenshot` | Capture current screen | Visual verification of UI state |
| `getSelectedElement` | Get details of selected DOM element | Analyze specific elements |
| `wipeLogs` | Clear all logs from memory | Reset log storage when needed |
| `runAccessibilityAudit` | Perform accessibility audit | Test WCAG compliance |
| `runPerformanceAudit` | Perform performance audit | Analyze performance metrics |
| `runSEOAudit` | Perform SEO audit | Check SEO optimization |
| `runBestPracticesAudit` | Check web best practices | Validate against standards |

## Integration with Frontend Testing

### Automated Testing Workflow

1. Start both servers (Node middleware and MCP)
2. Launch the browser with the page to test
