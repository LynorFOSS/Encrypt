from __future__ import annotations

from datetime import datetime, timezone

from pydantic_settings import BaseSettings
from sqlalchemy import DateTime, JSON, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker


class Settings(BaseSettings):
    database_url: str = "sqlite:///./encrypt.db"
    api_url: str = "http://localhost:8000"
    search_url: str = "http://localhost:8001"
    ai_url: str = "http://localhost:8002"


settings = Settings()


class Base(DeclarativeBase):
    pass


class AppStateRecord(Base):
    __tablename__ = "app_state"

    key: Mapped[str] = mapped_column(String(128), primary_key=True)
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class SourceDocumentRecord(Base):
    __tablename__ = "source_documents"

    id: Mapped[str] = mapped_column(String(128), primary_key=True)
    source_type: Mapped[str] = mapped_column(String(32), index=True)
    title: Mapped[str] = mapped_column(String(256), index=True)
    body: Mapped[str] = mapped_column(Text)
    symbols: Mapped[list] = mapped_column(JSON, default=list)
    url: Mapped[str] = mapped_column(Text)
    published_at: Mapped[str] = mapped_column(String(64), index=True)
    external_id: Mapped[str] = mapped_column(String(128), unique=True, index=True)


def create_engine_and_session() -> tuple[object, sessionmaker[Session]]:
    engine = create_engine(settings.database_url, future=True)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
    return engine, session_factory


def init_database(engine: object) -> None:
    Base.metadata.create_all(engine)
