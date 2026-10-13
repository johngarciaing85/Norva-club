from datetime import UTC, datetime

from app.modules.catalog.models import (
    Availability,
    Category,
    Product,
    ProductImage,
    ProductStatus,
    ProductVariant,
    Size,
    SizeGroup,
)


def _seed(db):
    cat = Category(
        name="Ropa", slug="ropa", description="Ropa test",
        size_type=SizeGroup.ropa, sort_order=1, is_active=True,
    )
    cat_inactive = Category(
        name="Oculta", slug="oculta", description="No activa",
        size_type=SizeGroup.ropa, sort_order=2, is_active=False,
    )
    db.add_all([cat, cat_inactive])
    db.flush()

    size_m = Size(label="M", size_group=SizeGroup.ropa, sort_order=3)
    size_l = Size(label="L", size_group=SizeGroup.ropa, sort_order=4)
    db.add_all([size_m, size_l])
    db.flush()

    now = datetime.now(UTC)

    pub1 = Product(
        name="Pub One", slug="pub-one", description="Published",
        price_cop=50000, category_id=cat.id, status=ProductStatus.publicado,
        availability=Availability.inmediata, inventory_updated_at=now,
    )
    pub2 = Product(
        name="Pub Two", slug="pub-two", description="Published 2",
        price_cop=80000, category_id=cat.id, status=ProductStatus.publicado,
        availability=Availability.bajo_confirmacion, inventory_updated_at=now,
    )
    draft = Product(
        name="Draft", slug="draft-prod", description="Draft",
        price_cop=30000, category_id=cat.id, status=ProductStatus.borrador,
        availability=Availability.inmediata,
    )
    archived = Product(
        name="Archived", slug="archived-prod", description="Archived",
        price_cop=40000, category_id=cat.id, status=ProductStatus.archivado,
        availability=Availability.inmediata,
    )
    db.add_all([pub1, pub2, draft, archived])
    db.flush()

    db.add(ProductImage(product_id=pub1.id, url="https://example.com/img.jpg", alt="Front", sort_order=0))
    db.add(ProductVariant(product_id=pub1.id, size_id=size_m.id, stock=5))
    db.add(ProductVariant(product_id=pub1.id, size_id=size_l.id, stock=3))
    db.add(ProductVariant(product_id=pub2.id, size_id=size_m.id, stock=2))
    db.flush()

    return cat


class TestListCategories:
    def test_returns_active_only(self, client, db):
        _seed(db)
        resp = client.get("/categories")
        assert resp.status_code == 200
        data = resp.json()
        slugs = [c["slug"] for c in data]
        assert "ropa" in slugs
        assert "oculta" not in slugs

    def test_category_shape(self, client, db):
        _seed(db)
        resp = client.get("/categories")
        cat = resp.json()[0]
        assert set(cat.keys()) == {"id", "slug", "name", "description", "sizeType"}
        assert cat["sizeType"] == "ropa"


class TestListProducts:
    def test_returns_published_only(self, client, db):
        _seed(db)
        resp = client.get("/products")
        assert resp.status_code == 200
        data = resp.json()
        slugs = [p["slug"] for p in data["products"]]
        assert "pub-one" in slugs
        assert "pub-two" in slugs
        assert "draft-prod" not in slugs
        assert "archived-prod" not in slugs

    def test_filter_by_category(self, client, db):
        _seed(db)
        resp = client.get("/products", params={"category": "ropa"})
        data = resp.json()
        assert data["total"] == 2
        for p in data["products"]:
            assert p["categorySlug"] == "ropa"

    def test_pagination(self, client, db):
        _seed(db)
        resp = client.get("/products", params={"page": 1, "page_size": 1})
        data = resp.json()
        assert len(data["products"]) == 1
        assert data["total"] == 2
        assert data["page"] == 1
        assert data["page_size"] == 1

    def test_product_shape(self, client, db):
        _seed(db)
        resp = client.get("/products")
        p = resp.json()["products"][0]
        expected_keys = {
            "id", "slug", "name", "description", "price", "categoryId",
            "categorySlug", "sizeType", "variants", "images", "availability",
            "inventoryUpdatedAt",
        }
        assert set(p.keys()) == expected_keys


class TestGetProduct:
    def test_returns_published(self, client, db):
        _seed(db)
        resp = client.get("/products/pub-one")
        assert resp.status_code == 200
        data = resp.json()
        assert data["slug"] == "pub-one"
        assert data["price"] == 50000
        assert len(data["variants"]) == 2
        assert len(data["images"]) == 1

    def test_inventory_updated_at_is_iso8601_utc(self, client, db):
        _seed(db)
        resp = client.get("/products/pub-one")
        ts = resp.json()["inventoryUpdatedAt"]
        assert "T" in ts
        assert ts.endswith(("+00:00", "Z"))

    def test_size_guide_present_when_set(self, client, db):
        from app.modules.catalog.models import Product

        _seed(db)
        prod = db.query(Product).filter_by(slug="pub-one").one()
        prod.size_guide = "S: 50cm | M: 55cm | L: 60cm"
        db.flush()
        resp = client.get("/products/pub-one")
        assert resp.json()["sizeGuide"] == "S: 50cm | M: 55cm | L: 60cm"

    def test_size_guide_null_when_not_set(self, client, db):
        _seed(db)
        resp = client.get("/products/pub-one")
        assert resp.json()["sizeGuide"] is None

    def test_draft_returns_404(self, client, db):
        _seed(db)
        resp = client.get("/products/draft-prod")
        assert resp.status_code == 404
        assert resp.json()["error"]["code"] == "not_found"

    def test_archived_returns_404(self, client, db):
        _seed(db)
        resp = client.get("/products/archived-prod")
        assert resp.status_code == 404

    def test_nonexistent_returns_404(self, client, db):
        resp = client.get("/products/no-existe")
        assert resp.status_code == 404
        assert resp.json()["error"]["code"] == "not_found"


    def test_detail_includes_size_guide_key(self, client, db):
        _seed(db)
        resp = client.get("/products/pub-one")
        assert "sizeGuide" in resp.json()
        resp_list = client.get("/products")
        for p in resp_list.json()["products"]:
            assert "sizeGuide" not in p


class TestErrorFormat:
    def test_404_format(self, client, db):
        resp = client.get("/products/no-existe")
        body = resp.json()
        assert "error" in body
        assert "code" in body["error"]
        assert "message" in body["error"]
