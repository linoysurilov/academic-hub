import httpx
from fastapi import APIRouter, HTTPException, status

from agents.task_agent import create_task_from_text
from schemas import AgentTaskRequest, AgentTaskResult

router = APIRouter(prefix="/agent", tags=["agents"])


@router.post("/tasks", response_model=AgentTaskResult, status_code=status.HTTP_201_CREATED)
async def run_task_agent(payload: AgentTaskRequest) -> AgentTaskResult:
    try:
        return await create_task_from_text(payload.text)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Tasks API error: {exc.response.status_code} {exc.response.text}",
        ) from exc
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Could not reach tasks API: {exc}",
        ) from exc
