# Colosseum Backend Deployment Guide

This document provides instructions for deploying the Colosseum backend to production environments.

## Deployment Options

### Option 1: Docker Deployment (Recommended)

#### Prerequisites
- Docker and Docker Compose installed
- Access to MongoDB and Redis (or use the provided docker-compose.yml)

#### Steps

1. **Prepare Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

2. **Build and Start Containers**
   ```bash
   docker-compose up -d
   ```

   This will start the backend service along with MongoDB and Redis containers.

3. **Monitor Logs**
   ```bash
   docker-compose logs -f app
   ```

### Option 2: Traditional Deployment

#### Prerequisites
- Node.js 18+ installed
- MongoDB instance
- Redis instance (optional but recommended)
- PM2 or similar process manager (recommended)

#### Steps

1. **Install PM2 globally** (if not already installed)
   ```bash
   npm install -g pm2
   ```

2. **Prepare Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

3. **Run the deployment script**
   ```bash
   ./deploy.sh
   ```

   This script will:
   - Install dependencies
   - Run tests (can be skipped with `--skip-tests`)
   - Start the application with PM2

4. **Configure PM2 to start on system boot**
   ```bash
   pm2 startup
   pm2 save
   ```

## Scaling Considerations

### Horizontal Scaling
For higher traffic loads, consider:
- Running multiple instances behind a load balancer
- Using sticky sessions if user state is maintained
- Migrating to a managed MongoDB service (MongoDB Atlas)
- Implementing Redis for session and cache management

### Configuration Guidelines

#### Environment Variables
Ensure the following environment variables are properly set:

```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_strong_secret_key
FRONTEND_URL=https://your-frontend-url.com
PORT=5000
```

#### Security Recommendations
1. Ensure your JWT_SECRET_KEY is a strong, unique value
2. Enable MongoDB authentication
3. Set up SSL/TLS for database connections
4. Configure proper firewall rules
5. Implement regular security audits

## Monitoring and Maintenance

### Monitoring
- Set up monitoring for application health
- Use tools like PM2 monitor, Prometheus, or cloud provider monitoring
- Set up alerts for critical issues

### Logging
- Logs are stored in rotating files
- Monitor log files for errors and suspicious activities
- Consider adding centralized logging (ELK stack, Graylog, etc.)

### Backup Strategy
- Schedule regular MongoDB backups
- Store backups securely offsite or in cloud storage
- Test restore procedures regularly

## Troubleshooting

### Common Issues

1. **Connection to MongoDB fails**
   - Check MongoDB connection string
   - Verify network connectivity and firewall rules
   - Ensure MongoDB service is running

2. **Application crashes on startup**
   - Check logs for specific error messages
   - Verify all environment variables are set correctly
   - Ensure required dependencies are installed

3. **High CPU or memory usage**
   - Check for memory leaks
   - Consider scaling resources
   - Optimize database queries
