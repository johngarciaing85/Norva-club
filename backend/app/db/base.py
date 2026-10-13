from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import all model modules so they register with Base.metadata.
# Must be at the bottom to avoid circular imports.
import app.modules.audit.models as _audit  # noqa: F401
import app.modules.auth.models as _auth  # noqa: F401
import app.modules.catalog.models as _catalog  # noqa: F401
import app.modules.inventory.models as _inventory  # noqa: F401
import app.modules.sales_docs.models as _sales_docs  # noqa: F401
