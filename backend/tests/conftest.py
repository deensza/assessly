import os
import pytest

# Set before create_app so TestingConfig picks up SQLite instead of PostgreSQL
os.environ.setdefault("TEST_DATABASE_URL", "sqlite:///:memory:")

from app import create_app, db as _db  # noqa: E402


@pytest.fixture(scope="session")
def app():
    test_app = create_app("testing")
    with test_app.app_context():
        _db.create_all()
        yield test_app
        _db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()
