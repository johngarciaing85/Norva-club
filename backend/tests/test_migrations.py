import os
import subprocess
import sys

import pytest
from sqlalchemy import create_engine, text


@pytest.fixture(scope="module")
def alembic_env():
    env = os.environ.copy()
    env["DATABASE_URL"] = os.environ.get(
        "DATABASE_URL",
        "postgresql+psycopg://norva_dev:change_me_in_production@localhost:5434/norva_test",
    )
    return env


@pytest.fixture(autouse=True, scope="module")
def _clean_db_for_migrations(alembic_env):
    """Drop all tables and enums so Alembic starts from a clean state."""
    url = alembic_env["DATABASE_URL"]
    eng = create_engine(url)
    with eng.begin() as conn:
        conn.execute(text(
            "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
        ))
    eng.dispose()
    yield
    eng = create_engine(url)
    with eng.begin() as conn:
        conn.execute(text(
            "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
        ))
    eng.dispose()


def _run_alembic(args: list[str], env: dict) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, "-m", "alembic"] + args,
        cwd=os.path.join(os.path.dirname(__file__), ".."),
        env=env,
        capture_output=True,
        text=True,
        check=False,
    )


def test_upgrade_head(alembic_env):
    result = _run_alembic(["upgrade", "head"], alembic_env)
    assert result.returncode == 0, f"upgrade head failed:\n{result.stderr}"


def test_downgrade_base(alembic_env):
    result = _run_alembic(["downgrade", "base"], alembic_env)
    assert result.returncode == 0, f"downgrade base failed:\n{result.stderr}"


def test_upgrade_after_downgrade(alembic_env):
    result = _run_alembic(["upgrade", "head"], alembic_env)
    assert result.returncode == 0, f"re-upgrade head failed:\n{result.stderr}"
