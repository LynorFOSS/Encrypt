"""Shared data models for Encrypt application."""
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TabState(BaseModel):
    """Tab state model."""
    model_config = ConfigDict(populate_by_name=True)
    
    id: str
    workspace_id: str = Field(alias="workspaceId")
    title: str
    url: str
    partition: str
    pinned: bool


class Workspace(BaseModel):
    """Workspace model."""
    model_config = ConfigDict(populate_by_name=True)
    
    id: str
    name: str
    active_ticker: str = Field(alias="activeTicker")


class Pane(BaseModel):
    """Pane model."""
    model_config = ConfigDict(populate_by_name=True)
    
    id: str
    title: str
    flex: float
    tabs: list[str]


class Bookmark(BaseModel):
    """Bookmark model."""
    model_config = ConfigDict(populate_by_name=True)
    
    id: str
    title: str
    url: str
    symbols: list[str]


class WatchlistItem(BaseModel):
    """Watchlist item model."""
    model_config = ConfigDict(populate_by_name=True)
    
    id: str
    workspace_id: str = Field(alias="workspaceId")
    symbol: str
    label: str
    created_at: str = Field(alias="createdAt")
    pinned: Optional[bool] = None
    price: Optional[float] = None
    change: Optional[float] = None
    change_percent: Optional[float] = Field(alias="changePercent", default=None)


class ResearchNote(BaseModel):
    """Research note model."""
    model_config = ConfigDict(populate_by_name=True)
    
    id: str
    workspace_id: str = Field(alias="workspaceId")
    title: str
    body: str
    tags: list[str]
    source_ids: list[str] = Field(alias="sourceIds")
    updated_at: str = Field(alias="updatedAt")
    topic: Optional[str] = None
    content: Optional[str] = None
    created_at: Optional[str] = Field(alias="createdAt", default=None)


class ShellState(BaseModel):
    """Shell state model."""
    model_config = ConfigDict(populate_by_name=True)
    
    version: int
    active_workspace_id: str = Field(alias="activeWorkspaceId")
    active_tab_ids: list[str] = Field(alias="activeTabIds")
    tabs: list[TabState]
    workspaces: list[Workspace]
    bookmarks: list[Bookmark]
    watchlist: list[WatchlistItem]
    notes: list[ResearchNote]
    recent_queries: list[str] = Field(alias="recentQueries")
    recent_activities: list[str] = Field(alias="recentActivities")
    ai_draft: str = Field(alias="aiDraft")
    panes: list[Pane] = Field(default_factory=list)
    selected_ticker: Optional[str] = Field(alias="selectedTicker", default=None)
    selected_note_id: Optional[str] = Field(alias="selectedNoteId", default=None)


class SearchResult(BaseModel):
    """Search result model."""
    model_config = ConfigDict(populate_by_name=True)
    
    id: str
    title: str
    summary: str = Field(default="")
    source_type: str = Field(alias="sourceType", default="news")
    symbols: list[str] = Field(default_factory=list)
    source: str = Field(default="")
    source_url: str = Field(alias="sourceUrl", default="")
    url: str = Field(default="")  # Alternative name for source_url
    published_at: str = Field(alias="publishedAt", default="")
    type: str = Field(default="news")  # For compatibility with demo data
    relevance: float = Field(default=0.0)
    # Additional fields used by search
    score: float = Field(default=0.0)
    facets: Optional[dict[str, str]] = Field(default=None)


class Filing(BaseModel):
    """Filing model."""
    model_config = ConfigDict(populate_by_name=True)
    
    id: str
    title: str
    form_type: str = Field(alias="formType", default="")
    ticker: str
    published_at: str = Field(alias="publishedAt", default="")
    accession: str = Field(default="")
    highlights: list[str] = Field(default_factory=list)
    url: str = Field(default="")


class Transcript(BaseModel):
    """Transcript model."""
    model_config = ConfigDict(populate_by_name=True)
    
    id: str
    title: str
    quarter: str
    ticker: str
    snippets: list[str] = Field(default_factory=list)
    url: str = Field(default="")
    published_at: str = Field(alias="publishedAt", default="")


class PriceBar(BaseModel):
    """Price bar model."""
    model_config = ConfigDict(populate_by_name=True)
    
    ts: str
    open: float
    high: float
    low: float
    close: float
    volume: Optional[int] = None


class AIResponse(BaseModel):
    """AI response model."""
    model_config = ConfigDict(populate_by_name=True)
    
    id: str
    question: str
    answer: str
    citations: list[str]
    confidence: float


class SourceDocument(BaseModel):
    """Source document model."""
    model_config = ConfigDict(populate_by_name=True)
    
    id: str
    title: str
    body: str = Field(alias="content")
    source_type: str = Field(alias="sourceType", default="news")
    symbols: list[str] = Field(default_factory=list)
    published_at: str = Field(alias="publishedAt", default="")
    url: str = Field(alias="sourceUrl", default="")
    ticker: Optional[str] = None
    created_at: Optional[str] = Field(alias="createdAt", default=None)
