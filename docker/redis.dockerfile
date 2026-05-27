FROM redis:7.2-alpine
EXPOSE 6379
CMD ["redis-server", "--appendonly", "yes", "--maxmemory", "25mb", "--maxmemory-policy", "allkeys-lru"]
