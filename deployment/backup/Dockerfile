FROM alpine:3.20

# Install PostgreSQL client, rclone, and supporting tools
RUN apk add --no-cache \
	postgresql16-client \
	curl \
	bash \
	tzdata \
	ca-certificates \
	&& curl -fsSL https://downloads.rclone.org/rclone-current-linux-amd64.zip -o /tmp/rclone.zip \
	&& unzip /tmp/rclone.zip -d /tmp \
	&& mv /tmp/rclone-*-linux-amd64/rclone /usr/local/bin/rclone \
	&& chmod +x /usr/local/bin/rclone \
	&& rm -rf /tmp/rclone* \
	# Install supercronic (production-grade cron for containers)
	&& SUPERCRONIC_URL="https://github.com/aptible/supercronic/releases/download/v0.2.29/supercronic-linux-amd64" \
	&& curl -fsSL "$SUPERCRONIC_URL" -o /usr/local/bin/supercronic \
	&& chmod +x /usr/local/bin/supercronic \
	&& apk del curl

# Create backup directories
RUN mkdir -p /backups /config /app

WORKDIR /app

COPY backup.sh /app/backup.sh
COPY crontab /app/crontab

RUN chmod +x /app/backup.sh

# Default timezone: Asia/Ho_Chi_Minh (UTC+7, so 2 AM local = 19:00 UTC previous day)
ENV TZ=Asia/Ho_Chi_Minh

CMD ["supercronic", "/app/crontab"]
