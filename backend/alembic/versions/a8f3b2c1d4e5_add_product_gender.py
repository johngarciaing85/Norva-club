"""add_product_gender

Revision ID: a8f3b2c1d4e5
Revises: 21ed4376186f
Create Date: 2026-10-26 00:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'a8f3b2c1d4e5'
down_revision: str | Sequence[str] | None = '21ed4376186f'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    gender_type = sa.Enum('dama', 'caballero', 'unisex', name='gender_type')
    gender_type.create(op.get_bind(), checkfirst=True)
    op.add_column(
        'products',
        sa.Column('gender', gender_type, nullable=False, server_default='unisex'),
    )


def downgrade() -> None:
    op.drop_column('products', 'gender')
    sa.Enum(name='gender_type').drop(op.get_bind(), checkfirst=True)
