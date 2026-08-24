from __future__ import annotations

from collections import Counter
from math import sqrt
from typing import Dict, List, Optional

import numpy as np
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(tags=["recommendations"])

AUDIO_FEATURES = [
    "danceability",
    "energy",
    "acousticness",
    "instrumentalness",
    "liveness",
    "valence",
    "tempo",
    "durationMs",
    "loudness",
]


class AudioProfile(BaseModel):
    danceability: float = 0
    energy: float = 0
    acousticness: float = 0
    instrumentalness: float = 0
    liveness: float = 0
    valence: float = 0
    tempo: float = 0
    durationMs: float = 0
    loudness: float = 0


class ArtistCandidate(BaseModel):
    spotifyId: str
    name: str
    genres: List[str] = Field(default_factory=list)
    broadFamily: str = ""
    country: str = ""
    region: str = ""
    language: str = ""
    popularity: float = 50
    discoveryScore: float = 50
    noveltyScore: float = 50
    audioProfile: AudioProfile


class RecommendationPreferences(BaseModel):
    energy: float = 0.65
    discovery: float = 0.70
    familiarity: float = 0.45
    languageOpenness: float = 0.80
    popularityCeiling: float = 0.75
    regionWeights: Dict[str, float] = Field(default_factory=dict)
    countryWeights: Dict[str, float] = Field(default_factory=dict)


class RecommendationRequest(BaseModel):
    artists: List[ArtistCandidate]
    likedArtistIds: List[str] = Field(default_factory=list)
    dislikedArtistIds: List[str] = Field(default_factory=list)
    preferences: RecommendationPreferences
    limit: int = 10


def normalize_audio_vector(profile: AudioProfile) -> np.ndarray:
    values = np.array(
        [
            profile.danceability,
            profile.energy,
            profile.acousticness,
            profile.instrumentalness,
            profile.liveness,
            profile.valence,
            profile.tempo / 250,
            profile.durationMs / 600000,
            (profile.loudness + 60) / 60,
        ],
        dtype=float,
    )

    return np.clip(values, 0, 1)


def cosine_similarity(vector_a: np.ndarray, vector_b: np.ndarray) -> float:
    denominator = np.linalg.norm(vector_a) * np.linalg.norm(vector_b)

    if denominator == 0:
        return 0.0

    return float(np.dot(vector_a, vector_b) / denominator)


def average_vectors(vectors: List[np.ndarray]) -> np.ndarray:
    if not vectors:
        return np.zeros(len(AUDIO_FEATURES), dtype=float)

    return np.mean(vectors, axis=0)


def shared_genre_score(candidate: ArtistCandidate, liked_artists: List[ArtistCandidate]) -> float:
    if not liked_artists:
        return 0.5

    liked_genres = {
        genre.lower()
        for artist in liked_artists
        for genre in artist.genres
    }

    candidate_genres = {genre.lower() for genre in candidate.genres}

    if not candidate_genres:
        return 0.0

    shared = len(candidate_genres.intersection(liked_genres))
    return min(shared / max(len(candidate_genres), 1), 1.0)


def language_score(candidate: ArtistCandidate, liked_artists: List[ArtistCandidate], openness: float) -> float:
    if not liked_artists:
        return 0.5

    liked_languages = {
        artist.language.lower()
        for artist in liked_artists
        if artist.language
    }

    same_language = candidate.language.lower() in liked_languages

    if same_language:
        return 1.0

    return max(0.25, min(openness, 1.0))


def popularity_score(popularity: float, ceiling: float) -> float:
    preferred_max = max(1, ceiling * 100)

    if popularity <= preferred_max:
        return 1.0

    excess = popularity - preferred_max
    return max(0.1, 1 - (excess / 100))


def geography_score(candidate: ArtistCandidate, preferences: RecommendationPreferences) -> float:
    region_weight = preferences.regionWeights.get(candidate.region, 1.0)
    country_weight = preferences.countryWeights.get(candidate.country, 1.0)

    return max(0.0, min((region_weight + country_weight) / 4, 1.0))


def novelty_score(candidate: ArtistCandidate, preferences: RecommendationPreferences) -> float:
    novelty = candidate.noveltyScore / 100
    discovery_target = preferences.discovery

    return 1 - abs(novelty - discovery_target)


def audio_energy_score(candidate: ArtistCandidate, preferred_energy: float) -> float:
    difference = abs(candidate.audioProfile.energy - preferred_energy)
    return max(0.0, 1 - difference)


def build_explanations(
    candidate: ArtistCandidate,
    components: Dict[str, float],
    liked_artists: List[ArtistCandidate],
    preferences: RecommendationPreferences,
) -> List[str]:
    explanations = []

    if components["audio_similarity"] >= 0.75:
        explanations.append(
            "Its audio profile is strongly similar to artists you liked."
        )

    if components["genre_compatibility"] >= 0.5:
        explanations.append(
            "It shares genre signals with your liked artists."
        )

    if components["geography"] >= 0.6:
        explanations.append(
            f"{candidate.country} and {candidate.region} currently have positive discovery emphasis."
        )

    if components["language"] < 0.8 and preferences.languageOpenness >= 0.6:
        explanations.append(
            f"It introduces {candidate.language}-language listening while respecting your openness setting."
        )

    if components["novelty"] >= 0.75:
        explanations.append(
            "Its novelty level fits your current discovery target."
        )

    if components["popularity"] >= 0.8 and candidate.popularity < 75:
        explanations.append(
            "It offers a lower-popularity discovery option without being artificially obscure."
        )

    if not explanations:
        explanations.append(
            "It is a balanced match across your current audio, location, and discovery preferences."
        )

    return explanations[:3]


def calculate_metrics(recommendations: List[dict]) -> Dict[str, float]:
    if not recommendations:
        return {
            "genreCoverage": 0,
            "regionCoverage": 0,
            "languageCoverage": 0,
            "averagePopularity": 0,
            "artistConcentration": 0,
        }

    genre_set = {
        genre
        for artist in recommendations
        for genre in artist["genres"]
    }

    region_set = {artist["region"] for artist in recommendations if artist["region"]}
    language_set = {
        artist["language"]
        for artist in recommendations
        if artist["language"]
    }

    artist_counts = Counter(artist["name"] for artist in recommendations)
    largest_share = max(artist_counts.values()) / len(recommendations)

    return {
        "genreCoverage": round(len(genre_set) / len(recommendations), 3),
        "regionCoverage": round(len(region_set) / len(recommendations), 3),
        "languageCoverage": round(len(language_set) / len(recommendations), 3),
        "averagePopularity": round(
            sum(artist["popularity"] for artist in recommendations)
            / len(recommendations),
            2,
        ),
        "artistConcentration": round(largest_share, 3),
    }


@router.post("/recommendations")
def get_recommendations(payload: RecommendationRequest):
    artist_map = {artist.spotifyId: artist for artist in payload.artists}

    liked_artists = [
        artist_map[artist_id]
        for artist_id in payload.likedArtistIds
        if artist_id in artist_map
    ]

    disliked_ids = set(payload.dislikedArtistIds)
    liked_vectors = [
        normalize_audio_vector(artist.audioProfile)
        for artist in liked_artists
    ]

    taste_vector = average_vectors(liked_vectors)

    ranked = []

    for candidate in payload.artists:
        if candidate.spotifyId in disliked_ids:
            continue

        candidate_vector = normalize_audio_vector(candidate.audioProfile)

        audio_similarity = (
            cosine_similarity(candidate_vector, taste_vector)
            if liked_artists
            else candidate.discoveryScore / 100
        )

        components = {
            "audio_similarity": audio_similarity,
            "energy_fit": audio_energy_score(
                candidate,
                payload.preferences.energy,
            ),
            "genre_compatibility": shared_genre_score(
                candidate,
                liked_artists,
            ),
            "language": language_score(
                candidate,
                liked_artists,
                payload.preferences.languageOpenness,
            ),
            "geography": geography_score(
                candidate,
                payload.preferences,
            ),
            "novelty": novelty_score(candidate, payload.preferences),
            "popularity": popularity_score(
                candidate.popularity,
                payload.preferences.popularityCeiling,
            ),
        }

        final_score = (
            0.32 * components["audio_similarity"]
            + 0.12 * components["energy_fit"]
            + 0.16 * components["genre_compatibility"]
            + 0.10 * components["language"]
            + 0.12 * components["geography"]
            + 0.10 * components["novelty"]
            + 0.08 * components["popularity"]
        )

        ranked.append(
            {
                "spotifyId": candidate.spotifyId,
                "name": candidate.name,
                "genres": candidate.genres,
                "country": candidate.country,
                "region": candidate.region,
                "language": candidate.language,
                "popularity": candidate.popularity,
                "score": round(final_score * 100, 2),
                "components": {
                    key: round(value, 3)
                    for key, value in components.items()
                },
                "explanations": build_explanations(
                    candidate,
                    components,
                    liked_artists,
                    payload.preferences,
                ),
            }
        )

    ranked.sort(key=lambda item: item["score"], reverse=True)

    recommendations = ranked[: max(1, min(payload.limit, 30))]

    return {
        "recommendations": recommendations,
        "metrics": calculate_metrics(recommendations),
    }