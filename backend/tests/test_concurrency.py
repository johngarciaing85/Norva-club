import uuid
from concurrent.futures import ThreadPoolExecutor

from sqlalchemy.orm import Session

from app.core.errors import InsufficientStockError
from app.modules.catalog.models import (
    Availability,
    Category,
    Product,
    ProductStatus,
    ProductVariant,
    Size,
    SizeGroup,
)
from app.modules.inventory.models import MovementReason
from app.modules.inventory.service import StockChange, adjust_stock, set_stock_bulk


def test_concurrent_stock_decrement(db_committed, engine):
    """Two threads decrement stock=1 simultaneously; only one succeeds."""
    session = db_committed

    cat = Category(
        name="Conc", slug=f"conc-{uuid.uuid4().hex[:8]}", description="",
        size_type=SizeGroup.ropa,
    )
    session.add(cat)
    session.flush()

    size = Size(label="M", size_group=SizeGroup.ropa, sort_order=0)
    session.add(size)
    session.flush()

    prod = Product(
        name="Conc Prod", slug=f"conc-prod-{uuid.uuid4().hex[:8]}", description="",
        price_cop=10000, category_id=cat.id, status=ProductStatus.publicado,
        availability=Availability.inmediata,
    )
    session.add(prod)
    session.flush()

    variant = ProductVariant(product_id=prod.id, size_id=size.id, stock=1)
    session.add(variant)
    session.commit()
    variant_id = variant.id

    results: list[str] = []

    def try_decrement():
        s = Session(bind=engine)
        try:
            adjust_stock(s, variant_id, -1, MovementReason.venta, note="concurrency test")
            s.commit()
            return "ok"
        except InsufficientStockError:
            s.rollback()
            return "insufficient"
        except Exception:  # noqa: BLE001
            s.rollback()
            return "error"
        finally:
            s.close()

    with ThreadPoolExecutor(max_workers=2) as pool:
        futures = [pool.submit(try_decrement) for _ in range(2)]
        results = [f.result() for f in futures]

    assert results.count("ok") == 1, f"Expected exactly one success, got: {results}"
    assert results.count("insufficient") == 1, f"Expected one failure, got: {results}"

    session.expire_all()
    variant = session.get(ProductVariant, variant_id)
    assert variant.stock == 0


def test_set_stock_bulk_locks_rows(db_committed, engine):
    """set_stock_bulk uses FOR UPDATE so concurrent adjust_stock sees the new stock."""
    session = db_committed

    cat = Category(
        name="BulkLock", slug=f"bulklock-{uuid.uuid4().hex[:8]}", description="",
        size_type=SizeGroup.ropa,
    )
    session.add(cat)
    session.flush()

    size = Size(label="M", size_group=SizeGroup.ropa, sort_order=0)
    session.add(size)
    session.flush()

    prod = Product(
        name="BulkLock Prod", slug=f"bulklock-p-{uuid.uuid4().hex[:8]}", description="",
        price_cop=10000, category_id=cat.id, status=ProductStatus.publicado,
        availability=Availability.inmediata,
    )
    session.add(prod)
    session.flush()

    variant = ProductVariant(product_id=prod.id, size_id=size.id, stock=5)
    session.add(variant)
    session.commit()
    variant_id = variant.id

    import threading

    barrier = threading.Barrier(2, timeout=5)

    def bulk_set():
        s = Session(bind=engine)
        try:
            barrier.wait()
            set_stock_bulk(s, [StockChange(variant_id=variant_id, new_stock=10)])
            s.commit()
            return "ok"
        except Exception:  # noqa: BLE001
            s.rollback()
            return "error"
        finally:
            s.close()

    def adjust_after():
        s = Session(bind=engine)
        try:
            barrier.wait()
            adjust_stock(s, variant_id, -3, MovementReason.venta)
            s.commit()
            return "ok"
        except Exception:  # noqa: BLE001
            s.rollback()
            return "error"
        finally:
            s.close()

    with ThreadPoolExecutor(max_workers=2) as pool:
        f_bulk = pool.submit(bulk_set)
        f_adjust = pool.submit(adjust_after)
        r_bulk = f_bulk.result(timeout=10)
        r_adjust = f_adjust.result(timeout=10)

    assert r_bulk == "ok"
    assert r_adjust == "ok"

    session.expire_all()
    variant = session.get(ProductVariant, variant_id)
    # bulk sets to 10, adjust does -3: order determines final stock
    # bulk last → 10; adjust last → 7
    assert variant.stock in (7, 10)
