# 🌐 Deploy to GitHub Pages

## Quick Setup Instructions

To make your Tumble Guys game publicly playable, follow these steps:

### Option 1: Enable GitHub Pages (Recommended)

1. **Merge the feature branch to main:**
   - Go to: https://github.com/jennyrodenhouse/tumbleguys
   - Create a Pull Request from `claude/3d-obstacle-game-d8cFq` to `main`
   - Merge the Pull Request

2. **Enable GitHub Pages:**
   - Go to your repository: https://github.com/jennyrodenhouse/tumbleguys
   - Click on **Settings** (top menu)
   - Scroll down to **Pages** (left sidebar)
   - Under **Source**, select `main` branch
   - Select `/ (root)` folder
   - Click **Save**

3. **Access your game:**
   - Your game will be live at: **https://jennyrodenhouse.github.io/tumbleguys/**
   - It may take a few minutes to deploy

### Option 2: Use GitHub Pages from Feature Branch

1. **Enable GitHub Pages:**
   - Go to: https://github.com/jennyrodenhouse/tumbleguys/settings/pages
   - Under **Source**, select `claude/3d-obstacle-game-d8cFq` branch
   - Select `/ (root)` folder
   - Click **Save**

2. **Access your game:**
   - Your game will be live at: **https://jennyrodenhouse.github.io/tumbleguys/**

### Verification

Once deployed, GitHub will show a message:
> ✅ Your site is published at https://jennyrodenhouse.github.io/tumbleguys/

### Sharing Your Game

Share this URL with anyone:
```
https://jennyrodenhouse.github.io/tumbleguys/
```

No installation required - just click and play! 🎮

---

## Troubleshooting

**Game not loading?**
- Wait 2-3 minutes after enabling Pages
- Check that the branch is correctly selected in Settings
- Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)

**404 Error?**
- Ensure GitHub Pages is enabled in Settings
- Verify the correct branch is selected
- Check that index.html is in the root folder

**Need to update the game?**
- Just push new commits to the deployed branch
- GitHub Pages will automatically rebuild and deploy
