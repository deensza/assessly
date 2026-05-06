"""
Sandbox Service — Code execution with Docker or subprocess fallback.

When Docker is available, runs code in isolated containers.
When Docker is unavailable (e.g. Azure App Service), falls back to
subprocess-based execution with basic resource limits.
"""

import os
import sys
import time
import io
import tarfile
import tempfile
import subprocess
import logging

logger = logging.getLogger(__name__)

# ---------- Docker-based constants ----------
LANGUAGE_IMAGES = {
    'python': 'assessly-sandbox-python',
    'java': 'assessly-sandbox-java',
    'c': 'assessly-sandbox-c',
}

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

LANGUAGE_EXTENSIONS = {
    'python': '.py',
    'java': '.java',
    'c': '.c',
}


class SandboxService:
    """Manages code execution — Docker containers or subprocess fallback."""

    def __init__(self, app=None):
        self.client = None          # Docker client (None if unavailable)
        self.docker_available = False
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
            import docker as docker_mod
            self.client = docker_mod.from_env()
            self.client.ping()
            self.docker_available = True
            logger.info("Docker client initialized successfully.")
        except Exception as e:
            logger.warning(f"Docker not available, using subprocess fallback: {e}")
            self.client = None
            self.docker_available = False

    # ------------------------------------------------------------------ #
    #  Public API                                                         #
    # ------------------------------------------------------------------ #
    def run_code(self, code: str, language: str, stdin_input: str = '',
                 time_limit: int = None, memory_limit: str = None) -> dict:
        """
        Execute code and return result dict.

        Returns:
            dict with keys: stdout, stderr, exit_code, execution_time_ms,
                            timed_out, error
        """
        if language not in LANGUAGE_EXTENSIONS:
            return self._error_result(f'Unsupported language: {language}')

        if self.docker_available and self.client is not None:
            return self._run_docker(code, language, stdin_input,
                                    time_limit, memory_limit)
        else:
            return self._run_subprocess(code, language, stdin_input,
                                        time_limit)

    # ------------------------------------------------------------------ #
    #  Subprocess fallback (Azure / no-Docker environments)              #
    # ------------------------------------------------------------------ #
    def _run_subprocess(self, code: str, language: str,
                        stdin_input: str = '', time_limit: int = None) -> dict:
        """Run code using subprocess — no Docker needed."""
        timeout = time_limit or self.time_limit
        ext = LANGUAGE_EXTENSIONS[language]

        try:
            with tempfile.TemporaryDirectory(prefix='assessly_') as tmpdir:
                # Write source file
                if language == 'java':
                    import re
                    match = re.search(r'public\s+class\s+(\w+)', code)
                    filename = (match.group(1) + '.java') if match else 'Solution.java'
                    if 'class ' not in code:
                        code = f'public class Solution {{\n{code}\n}}'
                else:
                    filename = 'solution' + ext

                src_path = os.path.join(tmpdir, filename)
                with open(src_path, 'w', encoding='utf-8') as f:
                    f.write(code)

                # Build command
                if language == 'python':
                    cmd = [sys.executable, src_path]
                elif language == 'java':
                    # Compile
                    comp = subprocess.run(
                        ['javac', src_path],
                        capture_output=True, text=True, timeout=30, cwd=tmpdir
                    )
                    if comp.returncode != 0:
                        return {
                            'stdout': '',
                            'stderr': comp.stderr,
                            'exit_code': comp.returncode,
                            'execution_time_ms': 0,
                            'timed_out': False,
                            'error': 'Compilation failed'
                        }
                    class_name = filename.replace('.java', '')
                    cmd = ['java', '-cp', tmpdir, class_name]
                elif language == 'c':
                    out_path = os.path.join(tmpdir, 'a.out')
                    comp = subprocess.run(
                        ['gcc', '-o', out_path, src_path],
                        capture_output=True, text=True, timeout=30
                    )
                    if comp.returncode != 0:
                        return {
                            'stdout': '',
                            'stderr': comp.stderr,
                            'exit_code': comp.returncode,
                            'execution_time_ms': 0,
                            'timed_out': False,
                            'error': 'Compilation failed'
                        }
                    cmd = [out_path]
                else:
                    return self._error_result(f'Unsupported language: {language}')

                # Run
                start = time.time()
                try:
                    proc = subprocess.run(
                        cmd,
                        input=stdin_input,
                        capture_output=True,
                        text=True,
                        timeout=timeout,
                        cwd=tmpdir,
                    )
                    elapsed = int((time.time() - start) * 1000)
                    return {
                        'stdout': proc.stdout.strip(),
                        'stderr': proc.stderr.strip(),
                        'exit_code': proc.returncode,
                        'execution_time_ms': elapsed,
                        'timed_out': False,
                        'error': None,
                    }
                except subprocess.TimeoutExpired:
                    elapsed = int((time.time() - start) * 1000)
                    return {
                        'stdout': '',
                        'stderr': 'Execution timed out',
                        'exit_code': -1,
                        'execution_time_ms': elapsed,
                        'timed_out': True,
                        'error': 'Execution timed out',
                    }
        except Exception as e:
            logger.error(f"Subprocess execution error: {e}")
            return self._error_result(str(e))

    # ------------------------------------------------------------------ #
    #  Docker-based execution (original)                                  #
    # ------------------------------------------------------------------ #
    def _run_docker(self, code: str, language: str, stdin_input: str = '',
                    time_limit: int = None, memory_limit: str = None) -> dict:
        """Execute code inside an isolated Docker container."""
        from docker.errors import ImageNotFound, APIError

        image = LANGUAGE_IMAGES[language]
        ext = LANGUAGE_EXTENSIONS[language]
        timeout = time_limit or self.time_limit
        mem_limit = memory_limit or self.memory_limit

        filename = 'solution' + ext
        if language == 'java':
            import re
            match = re.search(r'public\s+class\s+(\w+)', code)
            if match:
                filename = match.group(1) + '.java'
            else:
                filename = 'Solution.java'
                if 'class ' not in code:
                    code = f'public class Solution {{\n{code}\n}}'

        container = None
        try:
            archive_data = self._make_sandbox_archive({
                filename: code,
                'input.txt': stdin_input or '',
            })

            cmd_str = LANGUAGE_COMMANDS[language](filename)
            cmd_str = f'{cmd_str} < /sandbox/input.txt'
            cmd = ['sh', '-c', cmd_str]

            start_time = time.time()

            container = self.client.containers.create(
                image=image,
                command=cmd,
                network_mode='none',
                mem_limit=mem_limit,
                nano_cpus=int(self.cpu_limit * 1e9),
                pids_limit=50,
                user='sandbox',
                working_dir='/sandbox',
                environment={'PYTHONDONTWRITEBYTECODE': '1'},
            )

            container.put_archive('/sandbox', archive_data)
            container.start()

            try:
                result = container.wait(timeout=timeout)
                exit_code = result.get('StatusCode', 1)
                timed_out = False
            except Exception:
                try:
                    container.kill()
                except Exception:
                    pass
                exit_code = -1
                timed_out = True

            elapsed_ms = int((time.time() - start_time) * 1000)

            stdout = container.logs(stdout=True, stderr=False).decode('utf-8', errors='replace')
            stderr = container.logs(stdout=False, stderr=True).decode('utf-8', errors='replace')

            return {
                'stdout': stdout.strip(),
                'stderr': stderr.strip(),
                'exit_code': exit_code,
                'execution_time_ms': elapsed_ms,
                'timed_out': timed_out,
                'error': None if not timed_out else 'Execution timed out'
            }

        except ImageNotFound:
            return self._error_result(f'Sandbox image not found: {image}')
        except APIError as e:
            return self._error_result(f'Docker API error: {e}')
        except Exception as e:
            return self._error_result(str(e))
        finally:
            if container:
                try:
                    container.remove(force=True)
                except Exception:
                    pass

    # ------------------------------------------------------------------ #
    #  Helpers                                                            #
    # ------------------------------------------------------------------ #
    def _make_sandbox_archive(self, files):
        """Create an in-memory tar archive."""
        archive = io.BytesIO()
        with tarfile.open(fileobj=archive, mode='w') as tar:
            for archive_name, content in files.items():
                data = content.encode('utf-8')
                info = tarfile.TarInfo(name=archive_name)
                info.size = len(data)
                info.mode = 0o644
                tar.addfile(info, io.BytesIO(data))
        archive.seek(0)
        return archive.getvalue()

    @staticmethod
    def _error_result(msg: str) -> dict:
        return {
            'stdout': '',
            'stderr': msg,
            'exit_code': 1,
            'execution_time_ms': 0,
            'timed_out': False,
            'error': msg,
        }

    def check_image(self, language: str) -> bool:
        """Check if the sandbox image for a language exists."""
        if not self.docker_available:
            return False
        image_name = LANGUAGE_IMAGES.get(language)
        if not image_name:
            return False
        try:
            self.client.images.get(image_name)
            return True
        except Exception:
            return False

    def build_images(self, base_path: str = None):
        """Build all sandbox Docker images from their Dockerfiles."""
        if not self.docker_available:
            return {lang: {'status': 'skipped', 'error': 'Docker not available'}
                    for lang in LANGUAGE_IMAGES}
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
                    self.client.images.build(path=dockerfile_dir, tag=image_name, rm=True)
                    results[lang] = {'status': 'built', 'image': image_name}
                except Exception as e:
                    results[lang] = {'status': 'error', 'error': str(e)}
            else:
                results[lang] = {'status': 'skipped',
                                 'error': f'Dockerfile not found at {dockerfile_dir}'}
        return results


# Module-level singleton
sandbox_service = SandboxService()
