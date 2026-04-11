import docker
import tempfile
import os
import time

try:
    client = docker.from_env()
except Exception as e:
    print(f"Warning: Docker not running or accessible. Sandbox execution will be mocked. {e}")
    client = None

def execute_code_in_sandbox(code: str, test_input: str, timeout_seconds: int = 3) -> dict:
    """
    Executes student Python code inside an isolated Docker container.
    """
    if not client:
        # Mock execution if Docker is not available
        return {"output": "Mock output. Docker is not running.", "error": "", "time_ms": 150}

    # Create a temporary directory to mount into the container
    with tempfile.TemporaryDirectory() as temp_dir:
        code_path = os.path.join(temp_dir, "submission.py")
        input_path = os.path.join(temp_dir, "input.txt")

        # Write student code and input data securely
        with open(code_path, "w", encoding="utf-8") as f:
            f.write(code)
        
        with open(input_path, "w", encoding="utf-8") as f:
            f.write(test_input)

        start_time = time.time()
        try:
            # Run the Python slim container
            container = client.containers.run(
                "python:3.9-slim",
                command='sh -c "cat /sandbox/input.txt | python /sandbox/submission.py"',
                volumes={temp_dir: {'bind': '/sandbox', 'mode': 'ro'}},
                working_dir="/sandbox",
                mem_limit="128m",                 # Restrict memory
                network_disabled=True,            # No internet access for security
                cpu_quota=50000,                  # Restrict CPU
                detach=True
            )
            
            # Wait for container to finish or timeout
            status = container.wait(timeout=timeout_seconds)
            
            # Capture stdout and stderr
            logs = container.logs().decode("utf-8")
            error = ""
            
            if status.get("StatusCode") != 0:
                error = logs
            
            # Cleanup
            container.remove(force=True)
            
            execution_time_ms = int((time.time() - start_time) * 1000)
            
            return {
                "output": logs if not error else "",
                "error": error,
                "time_ms": execution_time_ms
            }

        except docker.errors.ContainerError as e:
            return {"output": "", "error": str(e), "time_ms": timeout_seconds * 1000}
        except Exception as e:
            # Handle timeout or other unexpected errors
            try:
                container.remove(force=True)
            except:
                pass
            return {"output": "", "error": f"Execution failed: {str(e)}", "time_ms": timeout_seconds * 1000}
