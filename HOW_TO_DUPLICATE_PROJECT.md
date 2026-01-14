# How to Duplicate Your Project

## Quick Method (Automated)

Run the duplication script:

```bash
cd /Users/namandeepsinghnayyar/project
./duplicate-project.sh
```

Follow the prompts to name your new project (e.g., `project-v2`, `project-experimental`)

---

## Manual Method

### Step 1: Copy the Project

```bash
cd /Users/namandeepsinghnayyar
cp -R project project-v2
# Or name it whatever you want: project-experimental, inventory-v2, etc.
```

### Step 2: Clean Up Heavy Files

```bash
cd project-v2

# Remove virtual environments (we'll recreate them)
rm -rf backend/venv
rm -rf frontend/node_modules
rm -rf frontend/.next

# Remove cache files
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null
find . -name "*.pyc" -delete
find . -name ".DS_Store" -delete
```

### Step 3: Set Up New Environment

```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

---

## What Gets Copied

✅ **Copied:**
- All source code (Python, TypeScript, React)
- Configuration files (package.json, requirements.txt, etc.)
- Database migrations
- Documentation
- Scripts (START-SERVERS.sh, etc.)

❌ **NOT Copied (for speed):**
- `venv/` - Virtual environment (will be recreated)
- `node_modules/` - Node packages (will be reinstalled)
- `.next/` - Next.js build cache (will be regenerated)
- `__pycache__/` - Python cache files
- `.DS_Store` - macOS system files

---

## Using Your Duplicate Project

### Option 1: Run Independently (Recommended)

```bash
cd project-v2
./START-SERVERS.sh
```

Runs on same ports (8000, 3000) - **make sure original project is stopped!**

### Option 2: Run Both Projects Simultaneously

You'll need to change ports for one of them:

**For project-v2, edit:**

1. **Backend** (`backend/app/main.py` or startup command):
   ```bash
   uvicorn app.main:app --port 8001  # Changed from 8000
   ```

2. **Frontend** (`frontend/.env.local`):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8001
   ```
   
   And in `package.json` or startup command:
   ```bash
   npm run dev -- -p 3001  # Changed from 3000
   ```

---

## Opening in Cursor

### Open New Project:
```bash
cursor /Users/namandeepsinghnayyar/project-v2
```

### Open Both Projects:
You can open both in separate Cursor windows:
```bash
# Window 1
cursor /Users/namandeepsinghnayyar/project

# Window 2 (new window)
cursor /Users/namandeepsinghnayyar/project-v2
```

---

## Project Comparison

### Original Project (`project`):
- ✅ Working, stable version
- ✅ Don't modify (unless you know what you're doing)
- ✅ Use for production/testing current features

### New Project (`project-v2` or whatever you named it):
- 🧪 Experimental version
- 🧪 Safe to break and try new things
- 🧪 Can revert any time (just delete it)

---

## Tips

1. **Keep Original Safe**: Don't modify the original project while experimenting
2. **Name Clearly**: Use descriptive names like `project-v2`, `project-experimental`, `inventory-test`
3. **Git (Optional)**: If you want version control, initialize git in the new project:
   ```bash
   cd project-v2
   git init
   git add .
   git commit -m "Initial commit - duplicated from project"
   ```
4. **Delete When Done**: If experiments go wrong, just delete the duplicate:
   ```bash
   rm -rf /Users/namandeepsinghnayyar/project-v2
   ```

---

## Quick Reference

```bash
# Duplicate project
./duplicate-project.sh

# Use new project
cd ../project-v2
./START-SERVERS.sh

# Stop servers
./STOP-SERVERS.sh

# Open in Cursor
cursor .

# Delete if needed
cd ..
rm -rf project-v2
```

---

**You now have a safe space to experiment! 🎉**
