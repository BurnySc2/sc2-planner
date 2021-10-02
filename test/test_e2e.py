from test.tester_helper import find_next_free_port, get_website_address, kill_processes, start_frontend_dev_server
from typing import Optional, Set

import pytest
from pytest_benchmark.fixture import BenchmarkFixture

# see https://github.com/seleniumbase/SeleniumBase
# https://seleniumbase.io/
from seleniumbase import BaseCase

# Set in setup_module()
FRONTEND_ADDRESS = ''
# Remember which node processes to close
NEWLY_CREATED_NODE_PROCESSES: Set[int] = set()


def setup_module():
    """ Setup module can stay here because each new connection doesn't require a restart of frontend server """
    # pylint: disable=W0603
    global FRONTEND_ADDRESS
    """
    See https://docs.pytest.org/en/6.2.x/xunit_setup.html
    """
    port = find_next_free_port()
    FRONTEND_ADDRESS = get_website_address(port)
    start_frontend_dev_server(port, NEWLY_CREATED_NODE_PROCESSES)


def teardown_module():
    # Stop frontend server
    kill_processes(NEWLY_CREATED_NODE_PROCESSES)
    NEWLY_CREATED_NODE_PROCESSES.clear()


class MyTestClass(BaseCase):
    def test_frontend_server_available(self):
        self.open(FRONTEND_ADDRESS)
        self.assert_element('#SCV')
        self.assert_element('#Marine')
        self.assert_element('#CommandCenter')
        self.assert_element('#TerranInfantryWeaponsLevel1')
        # TODO loop over all actions, units, structures and upgrades that should be available for terran

    def test_protoss_page_loads(self):
        self.open(FRONTEND_ADDRESS)
        self.assert_element('#SCV')
        self.assert_element('#Marine')
        # Load protoss page
        self.click('#protoss')
        self.assert_element('#Probe')
        self.assert_element('#Zealot')
        self.assert_element('#Nexus')
        self.assert_element('#ProtossGroundWeaponsLevel1')

    def test_zerg_page_loads(self):
        self.open(FRONTEND_ADDRESS)
        self.assert_element('#SCV')
        self.assert_element('#Marine')
        # Load protoss page
        self.click('#zerg')
        self.assert_element('#Drone')
        self.assert_element('#Zergling')
        self.assert_element('#Hatchery')
        self.assert_element('#ZergMeleeWeaponsLevel1')


class MyBenchClass(BaseCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.benchmark: Optional[BenchmarkFixture] = None

    @pytest.fixture(autouse=True)
    def setup_benchmark(self, benchmark):
        """
        Assign the benchmark to a class variable
        For more info see https://pytest-benchmark.readthedocs.io/en/latest/usage.html
        https://github.com/ionelmc/pytest-benchmark/blob/master/tests/test_with_testcase.py
        """
        self.benchmark = benchmark

    def basic_site_display(self):
        """ Check if HOME site is visible """
        self.open(FRONTEND_ADDRESS)
        self.assert_element('#SCV')
        self.assert_element('#Marine')
        self.assert_element('#CommandCenter')
        self.assert_element('#TerranInfantryWeaponsLevel1')
        # TODO in a new benchmark check how long it takes to click multiple buttons and create a fresh/example build order

    def test_bench_basic_site_display(self):
        """ Benchmark how fast the site loads """
        self.benchmark(self.basic_site_display)


if __name__ == '__main__':
    setup_module()
    test_class = MyTestClass()
    test_class.test_frontend_server_available()
    teardown_module()
