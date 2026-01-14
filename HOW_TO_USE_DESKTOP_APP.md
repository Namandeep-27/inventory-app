# How to Use Your Desktop App

## ✅ Mac Desktop App Created!

Your app is ready at: `Inventory App.app`

---

## 🚀 How to Use

### Option 1: Double-Click (Easiest)

1. **Find the app:**
   - Look for `Inventory App.app` in your project folder
   
2. **Double-click it:**
   - A terminal window will open
   - It will automatically:
     - Start the backend server (port 8000)
     - Start the frontend server (port 3000)
     - Open your browser to http://localhost:3000

3. **Use your app:**
   - Your browser will open automatically
   - Start using the inventory system!

4. **To stop:**
   - Close the terminal window
   - Or press `Ctrl+C` in the terminal

---

## 📦 How to Share with Others

### Step 1: Compress the App

Open Terminal in your project folder and run:

```bash
zip -r Inventory-App-Mac.zip "Inventory App.app"
```

This creates `Inventory-App-Mac.zip`

### Step 2: Share the Zip File

- Send `Inventory-App-Mac.zip` to anyone
- They extract it
- They double-click `Inventory App.app`
- Done! ✅

---

## ⚠️ Important Notes

### Before Sharing:

**The recipient needs:**
1. **Python 3.8+** installed
2. **Node.js 18+** installed  
3. **npm** installed

**They also need to:**
1. Extract the zip file
2. Keep `Inventory App.app` in the same folder as:
   - `backend/` folder
   - `frontend/` folder

**Or better yet:** Share the entire project folder (backend + frontend + app)

### Complete Sharing (Recommended):

```bash
# Create a complete package
zip -r Inventory-System-Complete.zip \
  "Inventory App.app" \
  backend/ \
  frontend/ \
  README.md \
  QUICKSTART.md
```

This includes everything needed!

---

## 🔧 Troubleshooting

### "Backend directory not found"

**Fix:** Make sure `Inventory App.app` is in the same folder as `backend` and `frontend`

### "Virtual environment not found"

**Fix:** Run this first:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### "Frontend not found"

**Fix:** Make sure `frontend` folder exists in the same directory as the app

### App won't open

**Fix:** Mac might block it. Right-click → Open → Click "Open"

---

## 🎯 Quick Test

Try it now:

1. Double-click `Inventory App.app`
2. Wait for servers to start (about 5-10 seconds)
3. Browser should open automatically
4. You should see your inventory system!

---

## 💡 Alternative: Cloud Deployment

If sharing with others who don't have Python/Node.js, consider **cloud deployment** instead:

See: `QUICK_SHARE_GUIDE.md` for cloud deployment instructions (just send a URL - no installation needed!)

---

## 📝 Files Created

- ✅ `Inventory App.app` - Your Mac desktop app
- ✅ Ready to use!
- ✅ Ready to share!

Enjoy your desktop app! 🎉
