#!/bin/bash

# Setup script for PM2, Nginx, and Let's Encrypt SSL
# Run this script as root or with sudo

set -e

echo "=== Hyro Website Deployment Setup ==="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

# Update system packages
echo -e "${YELLOW}Updating system packages...${NC}"
apt update && apt upgrade -y

# Install Node.js (if not already installed)
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Installing Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
else
    echo -e "${GREEN}Node.js already installed${NC}"
fi

# Install Bun (if not already installed)
if ! command -v bun &> /dev/null; then
    echo -e "${YELLOW}Installing Bun...${NC}"
    curl -fsSL https://bun.com/install | bash
    echo -e "${GREEN}Bun installed successfully${NC}"
else
    echo -e "${GREEN}Bun already installed${NC}"
fi

# Add Bun to PATH for this script session
export PATH="$HOME/.bun/bin:$PATH" 

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Installing PM2...${NC}"
    npm install -g pm2
    echo -e "${GREEN}PM2 installed successfully${NC}"
else
    echo -e "${GREEN}PM2 already installed${NC}"
fi

# Configure PM2 to start on system boot
echo -e "${YELLOW}Configuring PM2 to start on system boot...${NC}"
pm2 startup systemd -u root --hp /root --service-name pm2-root || true
echo -e "${GREEN}PM2 startup configured${NC}"

# Install Nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Installing Nginx...${NC}"
    apt install -y nginx
    systemctl enable nginx
    echo -e "${GREEN}Nginx installed successfully${NC}"
else
    echo -e "${GREEN}Nginx already installed${NC}"
fi

# Install Certbot
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Installing Certbot...${NC}"
    apt install -y certbot python3-certbot-nginx
    echo -e "${GREEN}Certbot installed successfully${NC}"
else
    echo -e "${GREEN}Certbot already installed${NC}"
fi

# Create logs directory
echo -e "${YELLOW}Creating logs directory...${NC}"
mkdir -p /root/hyro/website/logs
chmod 755 /root/hyro/website/logs

# Copy Nginx configuration based on SSL certificate availability
echo -e "${YELLOW}Setting up Nginx configuration...${NC}"
SSL_CERT_PATH="/etc/letsencrypt/live/hyr0.xyz/fullchain.pem"
if [ -f "$SSL_CERT_PATH" ]; then
    echo -e "${GREEN}SSL certificates found - using production config with HTTPS redirect${NC}"
    cp /root/hyro/website/nginx-hyr0.xyz.conf.ssl /etc/nginx/sites-available/hyr0.xyz
else
    echo -e "${YELLOW}SSL certificates not found - using HTTP-only config for setup${NC}"
    cp /root/hyro/website/nginx-hyr0.xyz.conf.no-ssl /etc/nginx/sites-available/hyr0.xyz
fi

# Create symlink if it doesn't exist
if [ ! -L /etc/nginx/sites-enabled/hyr0.xyz ]; then
    ln -s /etc/nginx/sites-available/hyr0.xyz /etc/nginx/sites-enabled/hyr0.xyz
fi

# Remove default Nginx site if it exists
if [ -L /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Test Nginx configuration
echo -e "${YELLOW}Testing Nginx configuration...${NC}"
if nginx -t 2>&1; then
    echo -e "${GREEN}Nginx configuration is valid${NC}"
else
    echo -e "${RED}Nginx configuration test failed${NC}"
    echo -e "${YELLOW}Please check the configuration file: /etc/nginx/sites-available/hyr0.xyz${NC}"
    exit 1
fi

# Start Nginx
systemctl restart nginx
echo -e "${GREEN}Nginx started${NC}"

# If SSL certificates don't exist, try to obtain them with certbot
if [ ! -f "$SSL_CERT_PATH" ]; then
    echo -e "${YELLOW}Attempting to obtain SSL certificates with certbot...${NC}"
    echo -e "${YELLOW}Make sure your domain hyr0.xyz points to this server's IP address${NC}"
    
    # Use email from environment variable or default
    CERTBOT_EMAIL="${CERTBOT_EMAIL:-admin@hyr0.xyz}"
    
    # Run certbot in non-interactive mode (will fail gracefully if domain doesn't point here)
    # Note: certbot will modify nginx config, but we'll overwrite it with our clean config
    if certbot certonly --nginx -d hyr0.xyz -d www.hyr0.xyz \
        --non-interactive \
        --agree-tos \
        --email "$CERTBOT_EMAIL" \
        --keep-until-expiring 2>&1; then
        
        # Check if certificates were created
        if [ -f "$SSL_CERT_PATH" ]; then
            echo -e "${GREEN}SSL certificates obtained successfully!${NC}"
            echo -e "${YELLOW}Switching to production SSL configuration...${NC}"
            cp /root/hyro/website/nginx-hyr0.xyz.conf.ssl /etc/nginx/sites-available/hyr0.xyz
            
            # Test and reload nginx
            if nginx -t 2>&1; then
                systemctl reload nginx
                echo -e "${GREEN}Production SSL configuration activated${NC}"
            else
                echo -e "${RED}SSL configuration test failed${NC}"
                echo -e "${YELLOW}Reverting to HTTP-only config...${NC}"
                cp /root/hyro/website/nginx-hyr0.xyz.conf.no-ssl /etc/nginx/sites-available/hyr0.xyz
                nginx -t && systemctl reload nginx
            fi
        fi
    else
        echo -e "${YELLOW}Certbot failed - this is normal if:${NC}"
        echo -e "${YELLOW}  - The domain doesn't point to this server yet${NC}"
        echo -e "${YELLOW}  - Port 80 is not accessible from the internet${NC}"
        echo -e "${YELLOW}  - DNS hasn't propagated yet${NC}"
        echo ""
        echo -e "${YELLOW}You can run certbot manually later:${NC}"
        echo -e "${YELLOW}  certbot --nginx -d hyr0.xyz -d www.hyr0.xyz${NC}"
        echo -e "${YELLOW}Then run this script again to switch to SSL configuration${NC}"
    fi
fi

# Build the Next.js application
echo -e "${YELLOW}Building Next.js application...${NC}"
cd /root/hyro/website
bun install
bun run build

# Start application with PM2
echo -e "${YELLOW}Starting application with PM2...${NC}"
cd /root/hyro/website

# Stop and delete existing instance if it exists
if pm2 list | grep -q "hyro-website"; then
    echo -e "${YELLOW}Stopping existing hyro-website instance...${NC}"
    pm2 delete hyro-website || true
fi

# Start the application
pm2 start ecosystem.config.cjs
echo -e "${GREEN}Application started with PM2${NC}"

# Save PM2 process list for persistence across reboots
echo -e "${YELLOW}Saving PM2 process list...${NC}"
pm2 save
echo -e "${GREEN}PM2 process list saved${NC}"

# Show PM2 status
echo -e "${YELLOW}PM2 Status:${NC}"
pm2 status

echo ""
echo -e "${GREEN}=== Setup Complete ===${NC}"
echo ""
if [ -f "$SSL_CERT_PATH" ]; then
    echo -e "${GREEN}SSL is configured and active!${NC}"
else
    echo "Next steps:"
    echo "1. Make sure your domain hyr0.xyz points to this server's IP address"
    echo "2. Run this script again to automatically obtain SSL certificates:"
    echo "   ./setup-deployment.sh"
    echo "   (Or manually: certbot --nginx -d hyr0.xyz -d www.hyr0.xyz)"
    echo ""
fi
echo "Application is now running with PM2 and will start automatically on server reboot."
echo ""
echo "PM2 Management Commands:"
echo "  - View status: pm2 status"
echo "  - View logs: pm2 logs hyro-website"
echo "  - Restart: pm2 restart hyro-website"
echo "  - Stop: pm2 stop hyro-website"
echo "  - Monitor: pm2 monit"
echo ""
echo "Other logs:"
echo "  - Nginx logs: tail -f /var/log/nginx/error.log"
echo ""

