FROM python:3.11-slim

# Create non-root user for security
RUN groupadd -r sandbox && useradd -r -g sandbox -d /home/sandbox -s /bin/bash sandbox

# Create workspace directory
RUN mkdir -p /sandbox && chown sandbox:sandbox /sandbox

# Set working directory
WORKDIR /sandbox

# Switch to non-root user
USER sandbox

# Default command (will be overridden at runtime)
CMD ["python3", "-c", "print('sandbox ready')"]
