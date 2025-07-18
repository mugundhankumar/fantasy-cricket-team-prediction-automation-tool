from fastapi import Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
import logging

logger = logging.getLogger(__name__)

async def error_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global error handler middleware"""
    error_response = {
        "success": False,
        "error": str(exc),
        "path": request.url.path
    }
    
    if isinstance(exc, SQLAlchemyError):
        logger.error(f"Database error: {exc}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                **error_response,
                "error": "Database error occurred"
            }
        )
    
    if isinstance(exc, ValueError):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=error_response
        )
    
    logger.error(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response
    )
