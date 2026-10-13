"""CLI commands for seed data."""

import argparse
import sys
from datetime import UTC, datetime
from urllib.parse import quote

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
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


def _seed_sizes(session: Session) -> int:
    sizes_data = [
        ("XS", SizeGroup.ropa, 1),
        ("S", SizeGroup.ropa, 2),
        ("M", SizeGroup.ropa, 3),
        ("L", SizeGroup.ropa, 4),
        ("XL", SizeGroup.ropa, 5),
        ("XXL", SizeGroup.ropa, 6),
        ("36", SizeGroup.calzado, 1),
        ("37", SizeGroup.calzado, 2),
        ("38", SizeGroup.calzado, 3),
        ("39", SizeGroup.calzado, 4),
        ("40", SizeGroup.calzado, 5),
        ("41", SizeGroup.calzado, 6),
        ("42", SizeGroup.calzado, 7),
        ("43", SizeGroup.calzado, 8),
        ("44", SizeGroup.calzado, 9),
        ("Única", SizeGroup.unica, 1),
    ]
    count = 0
    for label, group, order in sizes_data:
        exists = session.scalar(
            select(Size).where(Size.label == label, Size.size_group == group)
        )
        if exists is None:
            session.add(Size(label=label, size_group=group, sort_order=order))
            count += 1
    session.flush()
    return count


def _placeholder(color: str, label: str) -> str:
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"'
        f' viewBox="0 0 400 500"><rect fill="{color}" width="400" height="500"/>'
        f'<text x="200" y="250" text-anchor="middle" dominant-baseline="middle"'
        f' fill="white" font-family="sans-serif" font-size="18">{label}</text></svg>'
    )
    return f"data:image/svg+xml,{quote(svg)}"


def _get_size(session: Session, label: str, group: SizeGroup) -> Size:
    size = session.scalar(
        select(Size).where(Size.label == label, Size.size_group == group)
    )
    if size is None:
        raise RuntimeError(f"Talla '{label}' ({group.value}) no encontrada. Ejecuta seed-sizes primero.")
    return size


def _seed_demo(session: Session) -> None:
    existing = session.scalar(select(func.count()).select_from(Category))
    if existing and existing > 0:
        print("Los datos de demostración ya existen. Omitiendo.")
        return

    cats = [
        Category(name="Camisetas", slug="camisetas", description="Camisetas oversize y streetwear", size_type=SizeGroup.ropa, sort_order=1),
        Category(name="Pantalones", slug="pantalones", description="Pantalones cargo y joggers", size_type=SizeGroup.ropa, sort_order=2),
        Category(name="Accesorios", slug="accesorios", description="Gorras, relojes y complementos", size_type=SizeGroup.unica, sort_order=3),
    ]
    for c in cats:
        session.add(c)
    session.flush()

    ropa_sizes = {label: _get_size(session, label, SizeGroup.ropa) for label in ["XS", "S", "M", "L", "XL", "XXL"]}
    unica_size = _get_size(session, "Única", SizeGroup.unica)

    now = datetime.now(UTC)

    products_data = [
        {
            "name": "Camiseta Oversize NÓRVA",
            "slug": "camiseta-oversize-norva",
            "description": "Camiseta oversize de algodón pesado con estampado frontal. Corte relajado y caída premium.",
            "price_cop": 89900,
            "category": cats[0],
            "status": ProductStatus.publicado,
            "availability": Availability.inmediata,
            "variants": {"XS": 3, "S": 5, "M": 0, "L": 8, "XL": 2, "XXL": 0},
            "images": [("#1a1a1a", "Oversize Front", "Camiseta Oversize NÓRVA vista frontal"), ("#2a2a2a", "Oversize Back", "Camiseta Oversize NÓRVA vista trasera")],
        },
        {
            "name": "Camiseta Básica Negra",
            "slug": "camiseta-basica-negra",
            "description": "Camiseta básica de corte regular en algodón 100%. Esencial para cualquier outfit.",
            "price_cop": 59900,
            "category": cats[0],
            "status": ProductStatus.archivado,
            "availability": Availability.bajo_confirmacion,
            "variants": {"XS": 0, "S": 0, "M": 0, "L": 0, "XL": 0, "XXL": 0},
            "images": [("#0d0d0d", "Básica Negra", "Camiseta Básica Negra")],
        },
        {
            "name": 'Camiseta "Move Different"',
            "slug": "camiseta-move-different",
            "description": "Edición limitada con el slogan de la marca estampado en la espalda.",
            "price_cop": 99900,
            "category": cats[0],
            "status": ProductStatus.publicado,
            "availability": Availability.inmediata,
            "variants": {"XS": 1, "S": 4, "M": 6, "L": 3, "XL": 0, "XXL": 1},
            "images": [("#333", "Move Different", "Camiseta Move Different")],
        },
        {
            "name": "Pantalón Cargo Urban",
            "slug": "pantalon-cargo-urban",
            "description": "Pantalón cargo con bolsillos laterales y corte recto. Tela resistente y cómoda.",
            "price_cop": 149900,
            "category": cats[1],
            "status": ProductStatus.publicado,
            "availability": Availability.inmediata,
            "variants": {"XS": 0, "S": 2, "M": 5, "L": 4, "XL": 1, "XXL": 0},
            "images": [("#3d3d3d", "Cargo Front", "Pantalón Cargo Urban vista frontal"), ("#4a4a4a", "Cargo Detail", "Pantalón Cargo Urban detalle bolsillo")],
        },
        {
            "name": "Jogger Essential",
            "slug": "jogger-essential",
            "description": "Jogger de felpa con puños elásticos. Ideal para un look casual urbano.",
            "price_cop": 119900,
            "category": cats[1],
            "status": ProductStatus.publicado,
            "availability": Availability.bajo_confirmacion,
            "variants": {"XS": 2, "S": 3, "M": 7, "L": 5, "XL": 3, "XXL": 1},
            "images": [("#555", "Jogger", "Jogger Essential")],
        },
        {
            "name": "Gorra Snapback NÓRVA",
            "slug": "gorra-snapback-norva",
            "description": "Gorra snapback con logo bordado. Talla única ajustable.",
            "price_cop": 49900,
            "category": cats[2],
            "status": ProductStatus.publicado,
            "availability": Availability.inmediata,
            "variants": {"Única": 12},
            "images": [("#222", "Snapback", "Gorra Snapback NÓRVA")],
        },
        {
            "name": "Reloj Minimal Black",
            "slug": "reloj-minimal-black",
            "description": "Reloj analógico con correa de cuero negro y esfera minimalista.",
            "price_cop": 189900,
            "category": cats[2],
            "status": ProductStatus.publicado,
            "availability": Availability.bajo_confirmacion,
            "variants": {"Única": 4},
            "images": [("#111", "Reloj", "Reloj Minimal Black")],
        },
        {
            "name": "Hoodie Oversized Gris",
            "slug": "hoodie-oversized-gris",
            "description": "Hoodie oversize de felpa gruesa con capucha doble. Comfort premium.",
            "price_cop": 159900,
            "category": cats[0],
            "status": ProductStatus.borrador,
            "availability": Availability.inmediata,
            "variants": {"XS": 0, "S": 1, "M": 3, "L": 2, "XL": 0, "XXL": 0},
            "images": [("#666", "Hoodie Front", "Hoodie Oversized Gris vista frontal"), ("#777", "Hoodie Back", "Hoodie Oversized Gris vista trasera")],
        },
    ]

    for pd in products_data:
        product = Product(
            name=pd["name"],
            slug=pd["slug"],
            description=pd["description"],
            price_cop=pd["price_cop"],
            category_id=pd["category"].id,
            status=pd["status"],
            availability=pd["availability"],
            inventory_updated_at=now,
        )
        session.add(product)
        session.flush()

        for i, (color, label, alt) in enumerate(pd["images"]):
            session.add(ProductImage(
                product_id=product.id,
                url=_placeholder(color, label),
                alt=alt,
                sort_order=i,
            ))

        for size_label, stock in pd["variants"].items():
            if size_label == "Única":
                size = unica_size
            else:
                size = ropa_sizes[size_label]
            session.add(ProductVariant(
                product_id=product.id,
                size_id=size.id,
                stock=stock,
            ))

    session.flush()


def main() -> None:
    parser = argparse.ArgumentParser(description="NÓRVA STYLE CLI")
    parser.add_argument("command", choices=["seed-sizes", "seed-demo"])
    args = parser.parse_args()

    session = SessionLocal()
    try:
        if args.command == "seed-sizes":
            count = _seed_sizes(session)
            session.commit()
            print(f"Tallas cargadas/verificadas: {count} nuevas")

        elif args.command == "seed-demo":
            if settings.ENVIRONMENT == "production":
                print("ERROR: seed-demo no puede ejecutarse en producción.")
                sys.exit(1)
            _seed_sizes(session)
            _seed_demo(session)
            session.commit()
            print("Datos de demostración cargados.")
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    main()
