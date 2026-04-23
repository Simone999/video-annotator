"""Export artifact API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db import get_db_session
from app.services import ExportNotFoundError, get_export_artifact_path

router = APIRouter(prefix="/exports")

type DbSession = Annotated[Session, Depends(get_db_session)]


@router.get("/{export_id}")
def download_export_artifact(export_id: str, session: DbSession) -> FileResponse:
    """Download one persisted export artifact by stable export id."""
    try:
        artifact_path = get_export_artifact_path(session=session, export_id=export_id)
    except ExportNotFoundError as error:
        raise HTTPException(status_code=404, detail="Export not found") from error

    return FileResponse(
        path=artifact_path,
        media_type="application/zip",
        filename=f"{export_id}.zip",
    )
