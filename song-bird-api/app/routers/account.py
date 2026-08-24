from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.dependencies import get_current_user_id, supabase_admin

router = APIRouter(tags=["account"])


class DeleteAccountRequest(BaseModel):
    confirmation: str


@router.get("/me")
def get_current_account(
    user_id: str = Depends(get_current_user_id),
):
    return {
        "user_id": user_id,
        "message": "Authenticated Song Bird user.",
    }


@router.delete("/account", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    payload: DeleteAccountRequest,
    user_id: str = Depends(get_current_user_id),
):
    if payload.confirmation != "DELETE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Type "DELETE" exactly to permanently delete your account.',
        )

    try:
        supabase_admin.auth.admin.delete_user(user_id)
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not delete the account. Please try again.",
        ) from error