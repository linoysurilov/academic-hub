from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    status: str = Field(default="pending", min_length=1, max_length=50)


class TaskStatusUpdate(BaseModel):
    status: str = Field(min_length=1, max_length=50)


class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    status: str
    created_at: datetime


class AgentTaskRequest(BaseModel):
    text: str = Field(min_length=1)


class AgentTaskResult(BaseModel):
    agent: str
    parsed_title: str
    parsed_description: str | None
    task: TaskRead
