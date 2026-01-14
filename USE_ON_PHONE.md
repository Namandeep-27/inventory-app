# How to Use the App on Your Phone

## Quick Setup (2 minutes)

### Step 1: Configure for Phone Access

Run this script to automatically configure your app:
```bash
./setup-phone-access.sh
```

This will:
- Find your Mac's IP address
- Update the frontend to connect to your Mac's backend
- Show you the URL to use on your phone

### Step 2: Start the Servers

**Terminal 1 - Backend:**
```bash
./start-backend.sh
```
Wait until you see: `Uvicorn running on http://0.0.0.0:8000`

**Terminal 2 - Frontend:**
```bash
./start-frontend.sh
```
Wait until you see: `Ready on http://localhost:3000`

### Step 3: Open on Your Phone

**On your phone's browser, go to:**
```
http://YOUR_MAC_IP:3000
```

**Your Mac's IP is:** `192.168.1.173` (run `./setup-phone-access.sh` to get current IP)

So open: `http://192.168.1.173:3000`

---

## Why "No Data" Appears

If you see the app but no data, it's because:
- The frontend was trying to connect to `localhost:8000`
- On your phone, `localhost` means the phone itself, not your Mac
- **Solution:** Run `./setup-phone-access.sh` to fix this!

---

## Troubleshooting

**Still no data after running setup script?**
1. Make sure both servers are running (check both terminals)
2. Restart the frontend server after running the setup script:
   ```bash
   # Stop frontend (Ctrl+C), then:
   ./start-frontend.sh
   ```
3. On your phone, refresh the page (pull down to refresh)
4. Check browser console on phone for errors (if possible)

**Can't connect at all?**
- Make sure both devices are on the **same WiFi network**
- Check Mac's firewall settings
- Verify the IP address is correct: `ifconfig | grep "inet " | grep -v 127.0.0.1`

**IP address changed?**
- Just run `./setup-phone-access.sh` again
- Restart the frontend server

---

## Better Option: Cloud Deployment

For a more reliable solution that works from anywhere:
- See `DEPLOY.md` for cloud deployment instructions
- Takes ~10 minutes
- Works from any network, not just your WiFi
- Share with others easily
