from __future__ import annotations

import secrets
from typing import Optional
from urllib.parse import urlencode

import requests
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse

from app.config import settings

router = APIRouter(tags=["spotify"])

SPOTIFY_ACCOUNTS_URL = "https://accounts.spotify.com"
SPOTIFY_API_URL = "https://api.spotify.com/v1"

# Local-development only:
# These dictionaries reset if FastAPI restarts.
spotify_sessions = {}
oauth_states = {}

SPOTIFY_SCOPES = "user-top-read user-read-private"


def spotify_get(access_token: str, path: str):
    response = requests.get(
        f"{SPOTIFY_API_URL}{path}",
        headers={
            "Authorization": f"Bearer {access_token}",
        },
        timeout=15,
    )

    if not response.ok:
        raise HTTPException(
            status_code=response.status_code,
            detail="Spotify data request failed.",
        )

    return response.json()


@router.get("/connect")
def connect_spotify(
    user_id: str = Query(...),
):
    state = secrets.token_urlsafe(32)
    oauth_states[state] = user_id

    query = urlencode(
        {
            "client_id": settings.spotify_client_id,
            "response_type": "code",
            "redirect_uri": settings.spotify_redirect_uri,
            "scope": SPOTIFY_SCOPES,
            "state": state,
            "show_dialog": "true",
        }
    )

    return RedirectResponse(
        f"{SPOTIFY_ACCOUNTS_URL}/authorize?{query}"
    )


@router.get("/callback")
def spotify_callback(
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
):
    if error:
        return RedirectResponse(
            f"{settings.frontend_origin}/account?spotify=denied"
        )

    if not code or not state or state not in oauth_states:
        return RedirectResponse(
            f"{settings.frontend_origin}/account?spotify=failed"
        )

    user_id = oauth_states.pop(state)

    token_response = requests.post(
        f"{SPOTIFY_ACCOUNTS_URL}/api/token",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": settings.spotify_redirect_uri,
        },
        auth=(
            settings.spotify_client_id,
            settings.spotify_client_secret,
        ),
        timeout=15,
    )

    if not token_response.ok:
        return RedirectResponse(
            f"{settings.frontend_origin}/account?spotify=token_failed"
        )

    token_data = token_response.json()
    access_token = token_data.get("access_token")

    if not access_token:
        return RedirectResponse(
            f"{settings.frontend_origin}/account?spotify=token_failed"
        )

    profile = spotify_get(access_token, "/me")

    top_artists = spotify_get(
        access_token,
        "/me/top/artists?limit=20&time_range=medium_term",
    )

    spotify_sessions[user_id] = {
        "spotify_user_id": profile.get("id"),
        "spotify_display_name": profile.get("display_name"),
        "top_artists": top_artists.get("items", []),
    }

    return RedirectResponse(
        f"{settings.frontend_origin}/account?spotify=connected"
    )


@router.get("/status")
def spotify_status(
    user_id: str = Query(...),
):
    connection = spotify_sessions.get(user_id)

    if not connection:
        return {
            "connected": False,
            "topArtists": [],
        }

    top_artists = []

    for artist in connection["top_artists"]:
        images = artist.get("images", [])
        image_url = images[0].get("url") if images else None

        top_artists.append(
            {
                "spotifyId": artist.get("id"),
                "name": artist.get("name"),
                "genres": artist.get("genres", []),
                "popularity": artist.get("popularity"),
                "imageUrl": image_url,
                "spotifyUrl": artist.get("external_urls", {}).get("spotify"),
            }
        )

    return {
        "connected": True,
        "spotifyUserId": connection["spotify_user_id"],
        "spotifyDisplayName": connection["spotify_display_name"],
        "topArtists": top_artists,
    }