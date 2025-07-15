# Build stage
FROM oven/bun:1 as builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Set environment variables (non-sensitive)
ENV VITE_SUPABASE_URL=https://mopakysykyknaagzybxl.supabase.co
ENV VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vcGFreXN5a3lrbmFhZ3p5YnhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1OTY3ODgsImV4cCI6MjA2ODE3Mjc4OH0.UPHB0DM_cocwQimkMMsS5WrWTmVxaKaXf_m2K6o7Vu4

# Build the app
RUN bun run build

# Production stage
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 
