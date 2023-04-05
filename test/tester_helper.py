import os
import signal
import socket
import subprocess
import time
from pathlib import Path
from typing import Set

import psutil
from loguru import logger

WEBSITE_IP = 'http://localhost'


class Timeout:
    """
    Run something for a maximum limited time
    try:
        with Timeout(seconds=2):
            ...
    except TimeoutError:
    """
    def __init__(self, seconds=1, error_message='Timeout'):
        self.seconds = seconds
        self.error_message = error_message

    def handle_timeout(self, signum, frame):
        raise TimeoutError(self.error_message)

    def __enter__(self):
        signal.signal(signal.SIGALRM, self.handle_timeout)
        signal.alarm(self.seconds)

    def __exit__(self, type_, value, traceback):
        signal.alarm(0)


def get_pid(name: str) -> Set[int]:
    """ Return a list of PIDs of all processes with the exact given name. """
    process_pids = set()
    for proc in psutil.process_iter():
        if name == proc.name():
            pid = proc.pid
            process_pids.add(pid)
    return process_pids


def find_next_free_port(
    port: int = 10_000,
    max_port: int = 65_535,
    exclude_ports: Set[int] = None,
) -> int:
    if exclude_ports is None:
        exclude_ports = set()

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    while port <= max_port:
        if port in exclude_ports:
            port += 1
            continue
        try:
            sock.bind(('', port))
            sock.close()
            return port
        except OSError:
            port += 1
    raise OSError('No free ports')


def get_website_address(port: int) -> str:
    return f'{WEBSITE_IP}:{port}'


def generate_css_file():
    frontend_folder = Path(__file__).parent.parent
    index_css_path = frontend_folder / 'src' / 'index.css'

    # If it already exists, skip generation of file
    # pylint: disable=R1732
    if index_css_path.is_file():
        return

    # Start compilation of index.css
    _tailwind_css_process = subprocess.Popen(
        ['npm', 'run', 'tailwind:prod'],
        cwd=frontend_folder,
    )

    # Wait for tailwindcss to compile index.css file
    wait_seconds = 0
    while not index_css_path.is_file() and wait_seconds < 30:
        wait_seconds += 1
        time.sleep(1)


def start_frontend_dev_server(
    port: int,
    NEWLY_CREATED_PROCESSES: Set[int],
    backend_proxy: str = 'localhost:8000',
):
    env = os.environ.copy()
    # Set port for dev server
    env['PORT'] = str(port)
    # Don't open frontend in browser
    env['BROWSER'] = 'none'
    # Which ip and port to use when sending fetch requests to api
    # Only REACT_APP_ prefixed env variables will be forwarded to the app: console.log(process.env)
    # https://create-react-app.dev/docs/adding-custom-environment-variables
    env['REACT_APP_PROXY'] = f'http://{backend_proxy}'
    env['REACT_APP_WEBSOCKET'] = f'ws://{backend_proxy}'
    env['NODE_OPTIONS'] = '--openssl-legacy-provider'
    
    currently_running_node_processes = get_pid('node')

    # pylint: disable=R1732
    generate_css_file()

    frontend_folder = Path(__file__).parent.parent
    logger.info(
        f"Starting frontend on port {port}, using backend proxy {env['REACT_APP_PROXY']} and websocket address {env['REACT_APP_WEBSOCKET']}",
    )
    _ = subprocess.Popen(
        ['npx', 'react-scripts', 'start'],
        cwd=frontend_folder,
        env=env,
    )

    # Give it some time to create dev server and all (3?) node proccesses
    time.sleep(3)
    new_processes = get_pid('node') - currently_running_node_processes
    logger.info(f'New node processes: {new_processes}')
    NEWLY_CREATED_PROCESSES |= new_processes


def kill_processes(processes: Set[int]):
    # Soft kill
    for pid in processes:
        logger.info(f'Killing {pid}')
        os.kill(pid, signal.SIGTERM)
    time.sleep(.1)

    # Force kill
    for pid in processes:
        logger.info(f'Force killing {pid}')
        try:
            os.kill(pid, signal.SIGKILL)
        except ProcessLookupError:
            pass


if __name__ == '__main__':
    free_frontend_port = find_next_free_port()
    start_frontend_dev_server(free_frontend_port, set())
    while 1:
        time.sleep(1)
