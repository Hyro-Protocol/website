# Deployment Guide for hyr0.xyz

This guide covers deploying the Next.js + Payload CMS website using PM2, Nginx, and Let's Encrypt SSL.

## Prerequisites

- Ubuntu/Debian Linux server
- Domain name (hyr0.xyz) pointing to your server's IP address
- Root or sudo access
- Node.js 20+ installed (will be installed by setup script)

## Quick Setup

1. **Run the setup script:**
   ```bash
   sudo bash /root/hyro/website/setup-deployment.sh
   ```

2. **Configure environment variables:**
   Create a `.env` file in `/root/hyro/website/` with:
   ```env
   PAYLOAD_SECRET=your-secret-key-here
   DATABASE_URI=file:./site-test.db
   NODE_ENV=production
   PORT=3000
   ```
   Generate a secure `PAYLOAD_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

3. **Ensure DNS is configured:**
   Make sure `hyr0.xyz` and `www.hyr0.xyz` point to your server's IP address.

4. **Obtain SSL certificate:**
   ```bash
   certbot --nginx -d hyr0.xyz -d www.hyr0.xyz
   ```
   Follow the prompts. Certbot will automatically update the Nginx configuration.

5. **Start the application with PM2:**
   ```bash
   cd /root/hyro/website
   pm2 start ecosystem.config.js
   pm2 save
   ```

6. **Verify everything is running:**
   ```bash
   pm2 status
   pm2 logs hyro-website
   ```

## Manual Setup (Alternative)

If you prefer to set up manually:

### 1. Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
npm install -g pm2
pm2 startup systemd -u root --hp /root

# Install Nginx
apt install -y nginx

# Install Certbot
apt install -y certbot python3-certbot-nginx
```

### 2. Configure Nginx

```bash
# Copy configuration
cp /root/hyro/website/nginx-hyr0.xyz.conf /etc/nginx/sites-available/hyr0.xyz

# Create symlink
ln -s /etc/nginx/sites-available/hyr0.xyz /etc/nginx/sites-enabled/hyr0.xyz

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

### 3. Build and Start Application

```bash
cd /root/hyro/website

# Install dependencies
npm install

# Build the application
npm run build

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
```

### 4. Configure SSL

```bash
certbot --nginx -d hyr0.xyz -d www.hyr0.xyz
```

## PM2 Management

### Common Commands

```bash
# View status
pm2 status

# View logs
pm2 logs hyro-website

# Restart application
pm2 restart hyro-website

# Stop application
pm2 stop hyro-website

# Delete from PM2
pm2 delete hyro-website

# Monitor resources
pm2 monit

# Save current process list
pm2 save
```

### Auto-restart on Reboot

PM2 startup is configured during setup. To verify:
```bash
pm2 startup
```

## Nginx Management

```bash
# Test configuration
nginx -t

# Reload configuration
systemctl reload nginx

# Restart Nginx
systemctl restart nginx

# View error logs
tail -f /var/log/nginx/error.log

# View access logs
tail -f /var/log/nginx/access.log
```

## SSL Certificate Renewal

Let's Encrypt certificates expire every 90 days. Certbot sets up automatic renewal, but you can test it:

```bash
# Test renewal
certbot renew --dry-run

# Manual renewal
certbot renew
```

## Troubleshooting

### Application won't start

1. Check PM2 logs:
   ```bash
   pm2 logs hyro-website --lines 50
   ```

2. Verify environment variables are set correctly

3. Check if port 3000 is available:
   ```bash
   netstat -tulpn | grep 3000
   ```

### Nginx 502 Bad Gateway

1. Check if the application is running:
   ```bash
   pm2 status
   ```

2. Verify the application is listening on port 3000:
   ```bash
   curl http://localhost:3000
   ```

3. Check Nginx error logs:
   ```bash
   tail -f /var/log/nginx/error.log
   ```

### SSL Certificate Issues

1. Verify DNS is pointing correctly:
   ```bash
   dig hyr0.xyz
   ```

2. Check certificate status:
   ```bash
   certbot certificates
   ```

3. Ensure port 80 is open for Let's Encrypt verification

## File Structure

```
/root/hyro/website/
├── ecosystem.config.js      # PM2 configuration
├── nginx-hyr0.xyz.conf      # Nginx configuration
├── setup-deployment.sh      # Automated setup script
├── .env                     # Environment variables (create this)
└── logs/                    # PM2 logs directory
```

## Security Notes

- Keep `PAYLOAD_SECRET` secure and never commit it to version control
- Regularly update system packages: `apt update && apt upgrade -y`
- Monitor PM2 logs for errors
- Set up firewall rules (UFW) if needed:
  ```bash
  ufw allow 22/tcp
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw enable
  ```

## Updating the Application

1. Pull latest changes:
   ```bash
   cd /root/hyro/website
   git pull  # if using git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Rebuild:
   ```bash
   npm run build
   ```

4. Restart with PM2:
   ```bash
   pm2 restart hyro-website
   ```

