# Colosseum Frontend Deployment Guide

This document provides instructions for deploying the Colosseum frontend to production environments.

## Deployment Options

### Option 1: Container Deployment (Recommended)

#### Prerequisites
- Docker installed
- Access to a container registry (Docker Hub, GitHub Container Registry, etc.)

#### Steps

1. **Build the Docker image**
   ```bash
   docker build -t colosseum-frontend:latest .
   ```

2. **Run the container locally to test**
   ```bash
   docker run -p 3000:3000 --env-file .env colosseum-frontend:latest
   ```

3. **Push to a container registry**
   ```bash
   # Tag the image
   docker tag colosseum-frontend:latest your-registry/colosseum-frontend:latest
   
   # Push to registry
   docker push your-registry/colosseum-frontend:latest
   ```

4. **Deploy to your hosting platform** (e.g., Kubernetes, AWS ECS, Azure Container Apps)

### Option 2: Static Hosting (Vercel/Netlify)

Vercel and Netlify are optimized for Next.js applications and offer simple deployment workflows.

#### Prerequisites
- Vercel or Netlify account
- Git repository with your code

#### Steps for Vercel

1. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)

2. **Import your project in Vercel**
   - Connect to your Git provider
   - Select the repository
   - Configure build settings (if needed)
   - Add environment variables from `.env.example`

3. **Deploy**
   - Vercel will automatically build and deploy your application
   - You can configure custom domains in the Vercel dashboard

#### Steps for Netlify

1. **Push your code to a Git repository**

2. **Import your project in Netlify**
   - Connect to your Git provider
   - Select the repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Add environment variables from `.env.example`

3. **Deploy**
   - Netlify will automatically build and deploy your application

## Environment Variables Configuration

For any deployment method, ensure you set up these environment variables:

1. **API and Backend URLs**
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
   - `NEXT_PUBLIC_BACKEND_URL`: Your backend URL

2. **Authentication**
   - `NEXT_PUBLIC_JWT_SECRET`: Your JWT secret key

3. **Stripe Integration**
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

Refer to `.env.example` for all required variables.

## Production Build

To create a production build locally:

```bash
# Install dependencies
npm ci

# Build the application
npm run build

# Start the production server
npm start
```

## Continuous Deployment

For continuous deployment, configure your CI/CD pipeline to:

1. Install dependencies with `npm ci`
2. Run tests (if applicable)
3. Build the application with `npm run build`
4. Deploy using your preferred method

## Troubleshooting Common Deployment Issues

### API Connection Issues
- Ensure CORS is properly configured on the backend
- Verify environment variables are set correctly
- Check network rules allowing frontend to backend communication

### Build Failures
- Ensure Node.js version is compatible (v16+)
- Check for missing dependencies
- Verify that all configuration files are properly formatted

### Performance Optimization
- Enable caching headers in your hosting provider
- Consider using a CDN for static assets
- Implement image optimization using Next.js Image component

## Monitoring and Analytics

Consider adding:

1. **Performance monitoring** with tools like Sentry or New Relic
2. **Usage analytics** with Google Analytics or similar
3. **Status monitoring** to alert on downtime

## Security Considerations

1. Ensure all environment variables are properly set in your hosting platform
2. Never commit sensitive information to your repository
3. Set up proper Content Security Policy (CSP) headers
4. Implement rate limiting for API requests
5. Use HTTPS for all connections
