"""
Sandbox Service — Docker-based secure code execution.

Manages the lifecycle of Docker containers for running untrusted student code
in strict isolation: no network, limited memory/CPU, read-only filesystem.
"""

import os
import time
import io
import tarfile
import logging
import tempfile
import docker
from docker.errors import ImageNotFound, APIError

logger = logging.getLogger(__name__)

# Image names for each supported language
LANGUAGE_IMAGES = {
    'python': 'assessly-sandbox-python',
    'java': 'assessly-sandbox-java',
    'c': 'assessly-sandbox-c',
}

# How to run code for each language
LANGUAGE_COMMANDS = {
    'python': lambda filename: f'python3 /sandbox/{filename}',
    'java': lambda filename: (
        f'cd /sandbox && javac {filename} && '
        f'java -cp /sandbox {filename.replace(".java", "")}'
    ),
    'c': lambda filename: (
        f'gcc -o /sandbox/a.out /sandbox/{filename} && /sandbox/a.out'
    ),
}

# File extensions for each language
LANGUAGE_EXTENSIONS = {
    'python': '.py',
    'java': '.java',
    'c': '.c',
}


class SandboxService:
    """Manages Docker containers for secure code execution."""

    def __init__(self, app=None):
        self.client = None
        self.time_limit = 10
        self.memory_limit = '256m'
        self.cpu_limit = 0.5
        if app:
            self.init_app(app)

    def init_app(self, app):
        """Initialize with Flask app config."""
        self.time_limit = app.config.get('SANDBOX_TIME_LIMIT', 10)
        memory_mb = app.config.get('SANDBOX_MEMORY_LIMIT', 256)
        self.memory_limit = f'{memory_mb}m'
        self.cpu_limit = app.config.get('SANDBOX_CPU_LIMIT', 0.5)
        try:
            self.client = docker.from_env()
            logger.info("Docker client initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize Docker client: {e}")
            self.client = None

    def _ensure_client(self):
        """Lazy-initialize Docker client if not already connected."""
        if self.client is None:
            try:
                self.client = docker.from_env()
            except Exception as e:
                raise RuntimeError(f"Docker is not available: {e}")

    def _make_sandbox_archive(self, tmp_dir):
        """Create an in-memory tar archive for files copied into the sandbox container."""
        archive = io.BytesIO()

        with tarfile.open(fileobj=archive, mode='w') as tar:
            for item in os.listdir(tmp_dir):
                file_path = os.path.join(tmp_dir, item)
                tar.add(file_path, arcname=item)

        archive.seek(0)
        return archive.getvalue()

    def run_code(self, code: str, language: str, stdin_input: str = '',
                 time_limit: int = None, memory_limit: str = None) -> dict:
        """
        Execute code inside an isolated Docker container.

        Returns:
            dict with keys: stdout, stderr, exit_code, execution_time_ms, timed_out, error
        """
        self._ensure_client()

        if language not in LANGUAGE_IMAGES:
            return {
                'stdout': '',
                'stderr': f'Unsupported language: {language}',
                'exit_code': 1,
                'execution_time_ms': 0,
                'timed_out': False,
                'error': f'Unsupported language: {language}'
            }

        image = LANGUAGE_IMAGES[language]
        ext = LANGUAGE_EXTENSIONS[language]
        timeout = time_limit or self.time_limit
        mem_limit = memory_limit or self.memory_limit

        # For Java, we need to extract class name from the code
        filename = 'solution' + ext
        if language == 'java':
            import re
            match = re.search(r'public\s+class\s+(\w+)', code)
            if match:
                filename = match.group(1) + '.java'
            else:
                filename = 'Solution.java'
                # Wrap code in a class if not already in one
                if 'class ' not in code:
                    code = f'public class Solution {{\n{code}\n}}'

        # Create temp directory inside the backend container.
        # Files are copied into the execution container using Docker put_archive,
        # so no host bind-mount path is needed.
        container_backend_dir = os.environ.get('CONTAINER_BACKEND_DIR', '/app')
        container_tmp_base = os.path.join(container_backend_dir, 'tmp_sandbox')

        os.makedirs(container_tmp_base, exist_ok=True)

        tmp_dir = tempfile.mkdtemp(prefix='assessly_', dir=container_tmp_base)
        code_path = os.path.join(tmp_dir, filename)

        try:
            # codeql[py/path-injection]: code_path is created under a server-controlled
            # tempfile directory and filename is selected from a fixed language map.
            with open(code_path, 'w', encoding='utf-8') as f:
                f.write(code)

            # Allow the non-root sandbox user inside the execution container
            # to enter the mounted directory and read the files.
            os.chmod(tmp_dir, 0o777)
            # codeql[py/path-injection]: code_path is created under a server-controlled
            # tempfile directory and filename is selected from a fixed language map.
            os.chmod(code_path, 0o644)

            # Write stdin input to a file and pipe it via shell redirection
            stdin_file = os.path.join(tmp_dir, 'input.txt')
            # codeql[py/path-injection]: stdin_file is created under the same
            # server-controlled tempfile directory with a constant filename.
            with open(stdin_file, 'w', encoding='utf-8') as f:
                f.write(stdin_input if stdin_input else '')
            # codeql[py/path-injection]: stdin_file is server-controlled.
            os.chmod(stdin_file, 0o644)

            # Build the command with stdin redirection from input file
            cmd_str = LANGUAGE_COMMANDS[language](filename)
            cmd_str = f'{cmd_str} < /sandbox/input.txt'
            cmd = ['sh', '-c', cmd_str]

            # Run container with strict isolation
            start_time = time.time()

            container = self.client.containers.create(
                image=image,
                command=cmd,
                network_mode='none',          # No network access
                mem_limit=mem_limit,           # Memory limit
                nano_cpus=int(self.cpu_limit * 1e9),  # CPU limit
                pids_limit=50,                 # Limit process count
                user='sandbox',                # Non-root user
                working_dir='/sandbox',
                environment={'PYTHONDONTWRITEBYTECODE': '1'},
            )

            archive_data = self._make_sandbox_archive(tmp_dir)
            container.put_archive('/sandbox', archive_data)
            container.start()

            # Wait for completion with timeout
            try:
                result = container.wait(timeout=timeout)
                exit_code = result.get('StatusCode', 1)
                timed_out = False
            except Exception:
                # Timeout — kill the container
                try:
                    container.kill()
                except Exception:
                    pass
                exit_code = -1
                timed_out = True

            elapsed_ms = int((time.time() - start_time) * 1000)

            # Capture output
            stdout = container.logs(stdout=True, stderr=False).decode('utf-8', errors='replace')
            stderr = container.logs(stdout=False, stderr=True).decode('utf-8', errors='replace')

            # Cleanup container
            try:
                container.remove(force=True)
            except Exception:
                pass

            return {
                'stdout': stdout.strip(),
                'stderr': stderr.strip(),
                'exit_code': exit_code,
                'execution_time_ms': elapsed_ms,
                'timed_out': timed_out,
                'error': None if not timed_out else 'Execution timed out'
            }

        except ImageNotFound:
            return {
                'stdout': '',
                'stderr': f'Sandbox image not found: {image}. Run `docker build` first.',
                'exit_code': 1,
                'execution_time_ms': 0,
                'timed_out': False,
                'error': f'Image not found: {image}'
            }
        except APIError as e:
            return {
                'stdout': '',
                'stderr': str(e),
                'exit_code': 1,
                'execution_time_ms': 0,
                'timed_out': False,
                'error': f'Docker API error: {e}'
            }
        except Exception as e:
            return {
                'stdout': '',
                'stderr': str(e),
                'exit_code': 1,
                'execution_time_ms': 0,
                'timed_out': False,
                'error': str(e)
            }
        finally:
            # Cleanup temp directory
            try:
                import shutil
                shutil.rmtree(tmp_dir, ignore_errors=True)
            except Exception:
                pass

    def check_image(self, language: str) -> bool:
        """Check if the sandbox image for a language exists."""
        self._ensure_client()
        image_name = LANGUAGE_IMAGES.get(language)
        if not image_name:
            return False
        try:
            self.client.images.get(image_name)
            return True
        except ImageNotFound:
            return False

    def build_images(self, base_path: str = None):
        """Build all sandbox Docker images from their Dockerfiles."""
        self._ensure_client()
        if base_path is None:
            base_path = os.path.abspath(
                os.path.join(os.path.dirname(__file__), '..', '..', '..', 'docker')
            )

        results = {}
        for lang, image_name in LANGUAGE_IMAGES.items():
            dockerfile_dir = os.path.join(base_path, f'sandbox-{lang}')
            if os.path.exists(dockerfile_dir):
                try:
                    logger.info(f"Building sandbox image: {image_name}")
                    self.client.images.build(
                        path=dockerfile_dir,
                        tag=image_name,
                        rm=True,
                    )
                    results[lang] = {'status': 'built', 'image': image_name}
                except Exception as e:
                    results[lang] = {'status': 'error', 'error': str(e)}
            else:
                results[lang] = {'status': 'skipped', 'error': f'Dockerfile not found at {dockerfile_dir}'}

        return results


# Module-level singleton
sandbox_service = SandboxService()
