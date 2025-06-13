# Munich Mensa API - MCP Server

A Model Context Protocol (MCP) server that provides access to Munich university cafeteria (Mensa) menus and facility information. This server is hosted on Cloudflare Workers and accessible remotely without authentication.

🌐 **Live Server:** https://mensa-munich-mcp.averwald.io/sse

## Overview

This MCP server provides AI assistants and applications with access to real-time information about Munich's university dining facilities. It fetches data from the TUM Eat API to provide current menus, facility details, and operating hours.

## Features

- 🏢 **Facility Discovery**: Get information about all available Munich university dining facilities
- 🍽️ **Menu Access**: Retrieve daily menus for specific facilities with pricing information
- 🔍 **Smart Filtering**: Filter facilities by name or location
- 📅 **Date Flexibility**: Get menus for specific dates or default to today
- ⚡ **Real-time Data**: Fetches live data from the TUM Eat API
- 🌍 **Remote Access**: Hosted on Cloudflare Workers for global accessibility

## Available Tools

### `get_mensa_facilities`

Retrieves a list of all available mensa facilities with optional filtering.

**Parameters:**
- `filter` (optional): Filter facilities by name or location

**Example Usage:**
```
Filter: "arcis" → Returns facilities with "arcis" in name or location
Filter: "garching" → Returns facilities in Garching area
No filter → Returns all facilities
```

**Response includes:**
- Facility name and location
- API name for menu queries
- Coordinates (latitude/longitude)
- Opening hours
- Queue status (when available)

### `get_mensa_menu`

Fetches the menu for a specific facility on a given date.

**Parameters:**
- `apiName`: The API identifier for the facility (e.g., "mensa-arcisstr")
- `date` (optional): Date in YYYY-MM-DD format (defaults to today)

**Response includes:**
- Menu items with names and categories
- Pricing for students, staff, and guests
- Dietary labels and allergen information
- Facility context (name and location)

## API Reference

The server interfaces with the [TUM Eat API](https://tum-dev.github.io/eat-api/), which provides:
- Real-time facility information
- Daily menu updates
- Pricing for different user groups
- Dietary and allergen labeling

