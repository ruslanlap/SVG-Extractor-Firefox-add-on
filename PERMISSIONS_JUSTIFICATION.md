# Permissions Justification for SVG Extractor Pro

This document provides detailed justification for each permission requested by SVG Extractor Pro, in compliance with Chrome Web Store Program Policies.

## Overview

SVG Extractor Pro requests only the **minimum permissions necessary** to implement its core functionality: finding, extracting, and downloading SVG images from web pages.

## Required Permissions

### 1. `activeTab`

**Purpose**: Access the current tab's content when the user clicks the extension icon.

**Justification**:
- Allows the extension to scan the current web page for SVG images
- Only activates when the user explicitly clicks the extension icon
- More privacy-friendly than broad host permissions as it requires user action
- Does not grant persistent access to tab content

**Code Usage**:
- `background.js:31-40` - Injecting content script to scan for SVGs
- `content-script.js:4-152` - Scanning DOM for SVG elements

**Why This Is Minimal**:
This is the most restricted permission for accessing web page content. It only works when the user actively clicks the extension icon, and access is temporary.

---

### 2. `storage`

**Purpose**: Store user preferences and temporary SVG data locally.

**Justification**:
- Stores user theme preference (light/dark mode)
- Stores user language preference (English/Ukrainian)
- Temporarily stores found SVG data to pass between extension pages
- All data is stored **locally** on the user's device
- No data is sent to external servers

**Code Usage**:
- `background.js:99` - Storing found SVG data: `chrome.storage.local.set({ 'svgs': message.svgs })`
- `background.js:215-219` - Storing default settings: `chrome.storage.local.set({ 'theme': 'dark', 'language': 'en', 'firstRun': true })`
- `results.js` - Reading stored SVG data and user preferences

**Data Stored**:
```javascript
{
  'svgs': [...],        // Temporary SVG data (cleared after use)
  'theme': 'dark',      // User preference
  'language': 'en',     // User preference
  'firstRun': true      // First-time user flag
}
```

**Why This Is Minimal**:
We only store essential data for the extension to function properly and remember user preferences.

---

### 3. `downloads`

**Purpose**: Enable downloading SVG files to the user's computer.

**Justification**:
- Core feature: allows users to download extracted SVG images
- Enables both single SVG downloads and batch ZIP downloads
- Downloads are initiated only by explicit user action (clicking download buttons)
- No automatic or background downloads

**Code Usage**:
- `background.js:242-246` - Downloading single SVG: `chrome.downloads.download({ url: url, filename: filename, saveAs: false })`
- `background.js:155-194` - Downloading multiple SVGs sequentially
- `background.js:224-366` - Download functions `downloadSVG()` and `downloadSVGDirect()`

**User Control**:
- All downloads require explicit user action
- Users can see each download in browser's download manager
- Browser's native download settings apply (download location, permissions)

**Why This Is Minimal**:
This permission is essential for the extension's primary purpose and cannot be replaced with a more limited permission.

---

### 4. `tabs`

**Purpose**: Manage the results tab where SVG images are displayed.

**Justification**:
- Creates a new tab to display found SVG images
- Activates and reloads the results tab if it already exists
- Checks if the results tab still exists before trying to reuse it
- Cleans up tab reference when user closes the results tab

**Code Usage**:
- `background.js:51-59` - Checking if results tab exists and activating it: `chrome.tabs.get(resultsTabId)`
- `background.js:74-77` - Creating new results tab: `chrome.tabs.create({ url: "results.html", active: true })`
- `background.js:80-85` - Listening for tab closure to clean up references
- `background.js:207-211` - Removing tab ID when tab is closed

**Why This Is Needed**:
- Provides better user experience by reusing the results tab instead of opening multiple tabs
- Allows the extension to check if the tab still exists before trying to use it
- Enables proper cleanup when user closes the results tab

**Alternative Considered**:
We cannot use a more limited permission because we need to:
1. Create and activate tabs
2. Check if specific tabs exist
3. Listen for tab closure events

**Why This Is Minimal**:
We only interact with tabs that the extension itself creates (results.html) and the currently active tab (when user clicks the icon).

---

### 5. `scripting`

**Purpose**: Inject content script to scan web pages for SVG images.

**Justification**:
- Required to execute code in the context of web pages to find SVG elements
- Only injects scripts when user clicks the extension icon (explicit user action)
- Script execution is temporary and not persistent
- This is the Manifest V3 method for content script injection

**Code Usage**:
- `background.js:31-40` - Injecting content script:
```javascript
chrome.scripting.executeScript({
  target: { tabId: tab.id },
  files: ["content-script.js"]
})
```

**What the Script Does**:
- Scans DOM for inline SVG elements
- Finds SVG images in `<img>`, `<object>`, and `<embed>` tags
- Detects SVGs used in CSS backgrounds
- Returns found SVG data to the extension
- Does not modify page content or user data

**Why This Is Minimal**:
- Script only runs when user explicitly clicks the extension icon
- Script does not persist after execution
- Script only reads SVG data, does not access personal information
- This is the recommended Manifest V3 approach (replacing older `executeScript` API)

---

### 6. `host_permissions: ["<all_urls>"]`

**Purpose**: Access web page content to extract SVG images from any website.

**Justification**:
- **Core Functionality**: Users need to extract SVGs from any website they visit
- **Unpredictable Usage**: We cannot predict which websites users will want to extract SVGs from
- **User-Initiated**: Access only occurs when user explicitly clicks the extension icon
- **Read-Only**: Only reads SVG content, does not modify pages or collect personal data
- **Single Purpose**: Only used to scan for and extract SVG images

**Why Narrower Permissions Won't Work**:

1. **Specific Domain Permissions** (`*://example.com/*`)
   - Would require users to manually grant permission for each website
   - Users want to extract SVGs from thousands of different websites
   - Would create poor user experience requiring constant permission requests

2. **activeTab Permission Alone**
   - Already included, but insufficient for downloading SVGs from external URLs
   - Cannot fetch SVG files from different origins without host permissions
   - `background.js:272-323` shows we need to fetch SVG files from various URLs

**How We Minimize Impact**:

1. **No Automatic Execution**: Code only runs when user clicks the extension icon
2. **Temporary Access**: Access is temporary, not persistent
3. **No Data Collection**: We don't collect browsing history or personal data
4. **No Background Activity**: No scripts run in the background on all pages
5. **Transparent Purpose**: Clear, single purpose that requires this access

**Code Usage**:
- `content-script.js:4-152` - Scanning page content for SVG elements
- `background.js:272-323` - Fetching SVG files from external URLs:
```javascript
fetch(cleanUrl, {
  method: 'GET',
  mode: 'cors',
  cache: 'no-cache',
  credentials: 'same-origin',
  headers: {
    'Accept': 'image/svg+xml,*/*'
  }
})
```

**Security Measures**:
- Content Security Policy prevents unauthorized code execution
- No remote code is loaded or executed
- All code is included in the extension package and reviewable
- Manifest V3 compliance ensures additional security restrictions

**Why This Is Justified**:
According to Chrome Web Store policies, broad permissions are acceptable when:
1. ✅ They are necessary for the extension's core purpose
2. ✅ The extension's purpose is clearly stated and singular
3. ✅ No narrower permission can achieve the same functionality
4. ✅ User-initiated actions trigger the permission's use

All four conditions are met for SVG Extractor Pro.

---

## Permissions We DON'T Request

To demonstrate our commitment to minimal permissions, here are permissions we could request but don't:

- ❌ `history` - We don't track browsing history
- ❌ `cookies` - We don't access user cookies
- ❌ `webRequest` - We don't monitor or modify network requests
- ❌ `bookmarks` - We don't access bookmarks
- ❌ `clipboardWrite` (for content script) - Only used in extension pages where it doesn't require permission
- ❌ `identity` - We don't access user identity or authentication
- ❌ `geolocation` - We don't access location data
- ❌ `notifications` - We don't send notifications
- ❌ `background` with persistent service worker - We use event-based service worker

## Data Privacy

All permissions are used in accordance with our [Privacy Policy](PRIVACY_POLICY.md):

- ✅ No personal data collection
- ✅ No data transmitted to external servers
- ✅ All processing happens locally
- ✅ No analytics or tracking
- ✅ No third-party data sharing

## Compliance Statement

SVG Extractor Pro complies with all Chrome Web Store Developer Program Policies:

1. **Single Purpose**: Extract and download SVG images from web pages
2. **Minimal Permissions**: Only requests permissions necessary for core functionality
3. **Limited Use**: All permissions used only for stated purpose
4. **No Remote Code**: Manifest V3 compliant, no remote code execution
5. **User Control**: All actions require explicit user interaction

## Verification

The extension is **open source**. You can verify that all permissions are used as described:

- GitHub Repository: [https://github.com/ruslanlap/SVG-Extractor-Firefox-and-Chrome-add-on](https://github.com/ruslanlap/SVG-Extractor-Firefox-and-Chrome-add-on)
- Review all code to confirm permissions usage
- No obfuscated code (except third-party libraries like JSZip)

## Summary Table

| Permission | Required? | Why | Alternative? |
|------------|-----------|-----|--------------|
| `activeTab` | ✅ Yes | Scan current page for SVGs | No - most minimal permission for page access |
| `storage` | ✅ Yes | Store preferences and temp data locally | No - needed for user settings and data passing |
| `downloads` | ✅ Yes | Download SVG files | No - core feature requires this |
| `tabs` | ✅ Yes | Manage results tab efficiently | No - needed for tab management features |
| `scripting` | ✅ Yes | Inject content script (MV3 requirement) | No - required for Manifest V3 |
| `<all_urls>` | ✅ Yes | Extract SVGs from any website user visits | No - users need flexibility to use on any site |

---

**Last Updated**: November 21, 2025

For questions about permissions, please see our [Privacy Policy](PRIVACY_POLICY.md) or open an issue on [GitHub](https://github.com/ruslanlap/SVG-Extractor-Firefox-and-Chrome-add-on/issues).
