"""Shared utilities and demo data for Encrypt application."""
from datetime import datetime

from .models import (
    AIResponse,
    Bookmark,
    Filing,
    PriceBar,
    ResearchNote,
    SearchResult,
    ShellState,
    SourceDocument,
    TabState,
    Transcript,
    WatchlistItem,
    Workspace,
)

__all__ = [
    "ShellState",
    "SourceDocument",
    "WatchlistItem",
    "Workspace",
    "SearchResult",
    "AIResponse",
    "TabState",
    "Filing",
    "Transcript",
    "PriceBar",
    "Bookmark",
    "ResearchNote",
    "demo_shell_state",
    "demo_search_results",
    "demo_source_documents",
    "demo_tickers",
    "demo_headlines",
    "demo_filings",
    "demo_transcripts",
    "vectorize_text",
]


# Demo data
demo_shell_state = ShellState(
    version=1,
    active_workspace_id="main",
    active_tab_ids=["tab-dashboard", "tab-search"],
    tabs=[
        TabState(
            id="tab-dashboard",
            workspace_id="main",
            title="Dashboard",
            url="encrypt://dashboard",
            partition="persist:main-dashboard",
            pinned=True,
        ),
        TabState(
            id="tab-search",
            workspace_id="main",
            title="Search",
            url="encrypt://search",
            partition="persist:main-search",
            pinned=False,
        ),
        TabState(
            id="tab-research",
            workspace_id="main",
            title="Research",
            url="encrypt://research",
            partition="persist:main-research",
            pinned=False,
        ),
    ],
    workspaces=[
        Workspace(id="main", name="Main", active_ticker="NVDA"),
        Workspace(id="macro", name="Macro", active_ticker="SPY"),
    ],
    bookmarks=[Bookmark(id="bm-1", title="NVDA 10-Q", url="https://www.sec.gov", symbols=["NVDA"])],
    watchlist=[],
    notes=[],
    recent_queries=[],
    recent_activities=[],
    ai_draft="",
    selected_ticker="NVDA",
    panes=[
        {"id": "main", "title": "Main", "flex": 1, "tabs": ["tab-dashboard"]},
        {"id": "side", "title": "Side", "flex": 0.3, "tabs": ["tab-search", "tab-research"]},
    ],
)

demo_search_results = [
    SearchResult(
        id="1",
        title="MSFT vs AAPL: Earnings comparison",
        type="filing",
        summary="Microsoft and Apple continue to diverge on cloud and consumer hardware growth.",
        symbols=["MSFT", "AAPL"],
        source="SEC",
        source_url="https://www.sec.gov",
        published_at=datetime.now().isoformat(),
        relevance=0.95,
    ),
    SearchResult(
        id="2",
        title="Tech Sector Analysis Report",
        type="report",
        summary="The technology sector continues to show strong growth.",
        symbols=["QQQ", "XLK"],
        source="Bloomberg",
        source_url="https://www.bloomberg.com",
        published_at=datetime.now().isoformat(),
        relevance=0.87,
    ),
]

demo_tickers = [
    WatchlistItem(
        id="1",
        workspace_id="main",
        symbol="NVDA",
        label="NVIDIA",
        created_at=datetime.now().isoformat(),
        pinned=True,
        price=950.10,
        change=18.25,
        change_percent=1.96,
    ),
    WatchlistItem(
        id="2",
        workspace_id="main",
        symbol="BTC",
        label="Bitcoin",
        created_at=datetime.now().isoformat(),
        price=68420.00,
        change=820.00,
        change_percent=1.21,
    ),
    WatchlistItem(
        id="3",
        workspace_id="main",
        symbol="MSFT",
        label="Microsoft",
        created_at=datetime.now().isoformat(),
        price=405.00,
        change=5.25,
        change_percent=1.31,
    ),
]

demo_headlines = [
    SearchResult(
        id="h1",
        title="Fed Holds Rates Steady",
        type="news",
        summary="Federal Reserve decided to maintain current interest rates.",
        symbols=["SPY", "QQQ"],
        source="Reuters",
        source_url="https://www.reuters.com",
        published_at=datetime.now().isoformat(),
        relevance=0.92,
    ),
    SearchResult(
        id="h2",
        title="Market Reaches All-Time High",
        type="news",
        summary="S&P 500 closes at record high following positive earnings.",
        symbols=["SPY"],
        source="Bloomberg",
        source_url="https://www.bloomberg.com",
        published_at=datetime.now().isoformat(),
        relevance=0.88,
    ),
]

demo_filings = [
    Filing(
        id="f1",
        title="Apple Inc. 10-K Annual Report",
        form_type="10-K",
        ticker="AAPL",
        published_at=datetime.now().isoformat(),
    ),
    Filing(
        id="f2",
        title="Tesla Inc. 8-K Current Report",
        form_type="8-K",
        ticker="TSLA",
        published_at=datetime.now().isoformat(),
    ),
]

demo_transcripts = [
    Transcript(
        id="t1",
        title="Apple Q4 2024 Earnings Call Transcript",
        quarter="Q4 2024",
        ticker="AAPL",
    ),
]

demo_source_documents = [
    SourceDocument(
        id="doc-1",
        title="NVIDIA Q3 2024 10-Q Filing",
        content="Quarterly report for NVIDIA Corporation",
        ticker="NVDA",
        document_type="filing",
        created_at=datetime.now().isoformat(),
        source_url="https://www.sec.gov",
    ),
    SourceDocument(
        id="doc-2",
        title="Apple Inc. Q4 2024 Earnings Call",
        content="Earnings call transcript for Apple Inc.",
        ticker="AAPL",
        document_type="transcript",
        created_at=datetime.now().isoformat(),
        source_url="https://example.com",
    ),
]


def vectorize_text(text: str) -> list[float]:
    """
    Vectorize text for embeddings.
    
    This is a placeholder implementation that returns a mock vector.
    In production, this would use a real embedding model.
    
    Args:
        text: Text to vectorize
        
    Returns:
        List of floats representing the text embedding
    """
    # Placeholder: return a mock embedding vector
    return [0.1] * 384  # 384-dimensional mock vector
