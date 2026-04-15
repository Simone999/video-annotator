"""Background job API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db_session
from app.schemas import JobCancelResponse, JobStatusResponse
from app.services import JobNotFoundError, get_job_status, request_job_cancellation

router = APIRouter(prefix="/jobs")

type DbSession = Annotated[Session, Depends(get_db_session)]


@router.get("/{job_id}", response_model=JobStatusResponse)
def get_job(job_id: str, session: DbSession) -> JobStatusResponse:
    """Return one persisted background job payload."""
    try:
        job_status = get_job_status(session=session, job_id=job_id)
    except JobNotFoundError as error:
        raise HTTPException(status_code=404, detail="Job not found") from error

    return JobStatusResponse(
        job_id=job_status.job_id,
        type=job_status.type,
        status=job_status.status,
        progress_current=job_status.progress_current,
        progress_total=job_status.progress_total,
        result=job_status.result_json,
        error_message=job_status.error_message,
    )


@router.post(
    "/{job_id}/cancel",
    response_model=JobCancelResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def cancel_job(job_id: str, session: DbSession) -> JobCancelResponse:
    """Request cancellation for one persisted background job."""
    try:
        cancel_result = request_job_cancellation(session=session, job_id=job_id)
    except JobNotFoundError as error:
        raise HTTPException(status_code=404, detail="Job not found") from error

    return JobCancelResponse(job_id=cancel_result.job_id, status=cancel_result.status)
