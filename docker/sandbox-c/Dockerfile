FROM gcc:12-bookworm

# Create non-root user for security
RUN groupadd -r sandbox && useradd -r -g sandbox -d /home/sandbox -s /bin/bash sandbox

# Create workspace directory
RUN mkdir -p /sandbox && chown sandbox:sandbox /sandbox

# Set working directory
WORKDIR /sandbox

# Switch to non-root user
USER sandbox

# Default command
CMD ["gcc", "--version"]
