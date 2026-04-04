# Claude Code + Higgsfield

A step-by-step guide to automating AI image generation. No keyboard switching, no repeated settings, no copy-pasting between tabs.

---

## Overview

Claude Code is an AI assistant that runs in your terminal. Combined with Playwright MCP, a tool that gives Claude control over a real browser, it can open Higgsfield, set your settings, type prompts, and generate images entirely on its own.

You define your workflow once in a file called `CLAUDE.md`. Claude reads it automatically every session. That's it.

---

## Requirements

- Mac or Windows
- VS Code or Cursor
- Chrome installed
- A Higgsfield account
- Node.js (we'll install this)

## Setup

### Step 1: Install Node.js (Mac)

Node.js is required to run Claude Code and Playwright. Install Homebrew first if you don't have it, then use it to install Node.

```bash
# Install Homebrew (Mac package manager)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Verify both work
node --version
npm --version
```

### Step 2: Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

Then start it:

```bash
claude
```

### Step 3: Install Playwright MCP

This is the critical piece. Playwright MCP gives Claude the ability to control a real browser, clicking, typing, and navigating, without you touching the keyboard.

```bash
claude mcp add playwright npx '@playwright/mcp@latest'
```

You should see:

```
Added stdio MCP server playwright with command: npx @playwright/mcp@latest to local config
```

Restart Claude, then verify it's active:

```bash
exit
claude
```

```
/mcp
```

You should see `playwright` listed. If it's missing, re-run the install command and restart.

**Why a separate browser?** Playwright opens its own controlled browser window, not your personal Chrome. This is normal and expected.

### Step 4: Create Your Project Folder

```
my-project/
├── CLAUDE.md
├── SESSION-RESUME.md
├── images/
├── videos/
├── reference/
└── output/
```

### Step 5: Create Your CLAUDE.md

This is the most important file in your project. Claude reads it automatically at the start of every session. It defines your tools, settings, workflow, and rules so you never have to repeat yourself.

```markdown
# My Higgsfield Workflow

## Tools
Image generation: Higgsfield NanoBanana 2
Video generation: Higgsfield Cinema Studio

## Default Settings
Aspect ratio: 9:16
Image count: 8
Quality: 2K unlimited ON
Extra free gens: OFF

## Workflow
1. Navigate to higgsfield.ai/image/nano_banana_2
2. Confirm settings before generating
3. For each prompt:
   a. Clear prompt bar via JS
   b. Take screenshot to verify bar is empty
   c. Type prompt slowly
   d. Click Generate
   e. Clear bar via JS again
   f. Wait 7 seconds
   g. Repeat
4. Save outputs to /images/YYYY-MM-DD/

## Rules
- Always clear the prompt bar via JS before typing. Never skip this step.
- Always screenshot after clearing to confirm it's empty
- Never skip settings confirmation
- Go straight to generating, no prompt previews.
```

Customize this to match your own workflow and style preferences.

---

## The Prompt Bar Fix

**This is the most important thing in this guide.** When running batches, the Higgsfield prompt bar doesn't clear properly between generations. Text from the previous prompt bleeds into the next one. Claude types into a dirty field and the whole batch breaks.

The fix is to always clear the prompt bar via JavaScript before typing a new prompt. This resets the contenteditable field properly and fires the input event so Higgsfield registers the change.

```javascript
const editor = document.querySelector('[id="hf:tour-image-prompt"] [contenteditable]')
  || document.querySelector('[contenteditable="true"]');

editor.innerHTML = '<p><br></p>';
editor.dispatchEvent(new Event('input', { bubbles: true }));
```

The full per-prompt workflow is:

1. Run the JS clear snippet above
2. Take a screenshot and visually confirm the bar is empty
3. If not empty, clear again and re-verify
4. Type the prompt with `slowly: true`
5. Click Generate
6. Run the JS clear immediately after Generate
7. Wait 7 seconds
8. Repeat for the next prompt

Add this workflow to your CLAUDE.md so Claude never skips it.

---

## Crash Recovery

Claude Code sessions can crash mid-batch. Without a recovery file, you lose track of where you were and have to start over. The fix is a `SESSION-RESUME.md` file in your project folder.

Keep it updated as you go. If Claude crashes, just say:

**Recovery command:** "Read SESSION-RESUME.md and continue from where we left off."

Example structure:

```markdown
# Session Resume

## Model
NanoBanana 2, URL: higgsfield.ai/image/nano_banana_2

## Settings
- Aspect ratio: 9:16
- 2K unlimited: ON
- Extra free gens: OFF

## Progress

| # | Description          | Status    |
|---|----------------------|-----------|
| 1 | [subject/character]  | Generated |
| 2 | [subject/character]  | Generated |
| 3 | [subject/character]  | Pending   |

## Next: #3
```

---

## Organizing Outputs

Tell Claude to save all outputs organized by date. Example folder structure:

```
images/
└── 2026-04-02/
    ├── char-01.png
    ├── char-02.png
    └── char-03.png
```

Add this to your CLAUDE.md rules: `Save all outputs to /images/YYYY-MM-DD/`

---

## Running Your First Workflow

Once everything is set up, open Claude Code in your project folder and run:

```
Generate a batch of UGC characters using NanoBanana 2.
9:16 aspect ratio, 8 images per prompt, 2K unlimited ON.
Follow the workflow in CLAUDE.md exactly.
```

Claude will open Higgsfield, confirm settings, run through each prompt using the JS clear method, and save outputs to your images folder.

---

## Common Issues

| Issue | Fix |
|-------|-----|
| `/mcp` doesn't show playwright | Re-run the install command and restart Claude |
| Claude opens a new browser window | Normal. Playwright uses its own controlled browser. |
| Claude generates too early | Add `Always wait for confirmation before generating` to CLAUDE.md |
| Prompt bar not clearing between prompts | The JS clear must be in your CLAUDE.md workflow. Claude skips it if it's not explicitly required. |
| Session crashed mid-batch | Use SESSION-RESUME.md and tell Claude to read it and continue. |

---

## The Core Idea

`CLAUDE.md` defines the rules. Playwright gives Claude hands. Together they turn Claude into your personal AI operator.

Instead of: Idea → manual prompts → generation

You get: **Idea → Claude → generation**

Define it once. Run it forever.
