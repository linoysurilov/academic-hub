import re

import httpx

from config import TASKS_API_URL
from schemas import AgentTaskResult, TaskCreate, TaskRead

AGENT_NAME = "task_agent"

_LABELED = re.compile(
    r"(?is)^\s*(?:title|כותרת)\s*[:\-–]\s*(.+?)\s*(?:description|תיאור)\s*[:\-–]\s*(.+)\s*$"
)


def parse_task_text(text: str) -> TaskCreate:
    """Extract a task title and optional description from free-form text."""
    raw = text.strip()
    if not raw:
        raise ValueError("Task text is empty")

    labeled = _LABELED.match(raw)
    if labeled:
        title = _clip_title(labeled.group(1))
        description = labeled.group(2).strip() or None
        return TaskCreate(title=title, description=description)

    lines = [line.strip() for line in raw.splitlines() if line.strip()]
    if len(lines) >= 2:
        return TaskCreate(title=_clip_title(lines[0]), description="\n".join(lines[1:]))

    single = lines[0]
    for separator in (" — ", " – ", " - ", ": "):
        if separator in single:
            left, right = single.split(separator, 1)
            left, right = left.strip(), right.strip()
            if left and right and len(left) <= 120:
                return TaskCreate(title=_clip_title(left), description=right)

    if len(single) > 255:
        return TaskCreate(title=_clip_title(single), description=single[255:].strip() or None)

    return TaskCreate(title=single, description=None)


def _clip_title(value: str) -> str:
    title = " ".join(value.strip().split())
    if not title:
        raise ValueError("Could not extract a task title")
    return title[:255]


async def create_task_from_text(text: str) -> AgentTaskResult:
    parsed = parse_task_text(text)
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(TASKS_API_URL, json=parsed.model_dump())
        response.raise_for_status()

    task = TaskRead.model_validate(response.json())
    return AgentTaskResult(
        agent=AGENT_NAME,
        parsed_title=parsed.title,
        parsed_description=parsed.description,
        task=task,
    )
