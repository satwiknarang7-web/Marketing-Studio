"""Generated and uploaded images, exposed as URLs for the template editor.

Generations are stored in the database as base64 data URIs, which is fine for
showing a result once but far too heavy to embed in a template document or an
exported design. Every generator also writes the real file to disk, so this
lists those files and hands back `/data/...` URLs instead.
"""

import os
import re
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, File, HTTPException, Query, UploadFile

router = APIRouter(prefix="/assets", tags=["Assets"])

IMAGE_DIR = os.path.join("data", "images")
UPLOAD_DIR = os.path.join("data", "uploads")

ALLOWED_EXTS = {".png", ".jpg", ".jpeg", ".webp"}
MAX_UPLOAD_BYTES = 12 * 1024 * 1024

# Intermediate frames written by the video pipeline; not user-facing assets.
TEMP_PREFIX = "temp_"

_SAFE_NAME = re.compile(r"^[A-Za-z0-9._-]+$")


def _dimensions(path: str) -> tuple[int | None, int | None]:
    try:
        from PIL import Image

        with Image.open(path) as im:
            return im.width, im.height
    except Exception:
        return None, None


def _collect(directory: str, url_prefix: str, source: str) -> list[dict]:
    if not os.path.isdir(directory):
        return []

    out: list[dict] = []
    for name in os.listdir(directory):
        if name.startswith(TEMP_PREFIX):
            continue
        if os.path.splitext(name)[1].lower() not in ALLOWED_EXTS:
            continue
        path = os.path.join(directory, name)
        if not os.path.isfile(path):
            continue

        stat = os.stat(path)
        width, height = _dimensions(path)
        out.append(
            {
                "url": f"{url_prefix}/{name}",
                "filename": name,
                "source": source,
                "bytes": stat.st_size,
                "width": width,
                "height": height,
                "created_at": datetime.fromtimestamp(
                    stat.st_mtime, tz=timezone.utc
                ).isoformat(),
            }
        )
    return out


@router.get("/images")
async def list_images(limit: int = Query(60, ge=1, le=300)):
    """Every image available to drop into a template, newest first."""
    items = _collect(IMAGE_DIR, "/data/images", "generated") + _collect(
        UPLOAD_DIR, "/data/uploads", "upload"
    )
    items.sort(key=lambda i: i["created_at"], reverse=True)
    return items[:limit]


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Bring in a logo, a product shot, or anything else the team already has."""
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext or 'unknown'}'. Use PNG, JPG or WebP.",
        )

    contents = await file.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File is {len(contents) // 1024 // 1024}MB; the limit is "
            f"{MAX_UPLOAD_BYTES // 1024 // 1024}MB.",
        )
    if not contents:
        raise HTTPException(status_code=400, detail="The file is empty.")

    # Verify it really is an image rather than trusting the extension.
    try:
        from io import BytesIO

        from PIL import Image

        with Image.open(BytesIO(contents)) as im:
            im.verify()
    except Exception:
        raise HTTPException(status_code=400, detail="That file is not a readable image.")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    name = f"{uuid.uuid4()}{ext}"
    path = os.path.join(UPLOAD_DIR, name)
    with open(path, "wb") as f:
        f.write(contents)

    width, height = _dimensions(path)
    return {
        "url": f"/data/uploads/{name}",
        "filename": name,
        "source": "upload",
        "bytes": len(contents),
        "width": width,
        "height": height,
        "created_at": datetime.now(tz=timezone.utc).isoformat(),
    }


@router.delete("/images/{filename}")
async def delete_upload(filename: str):
    """Remove an uploaded asset. Generated images are managed from History."""
    if not _SAFE_NAME.match(filename):
        raise HTTPException(status_code=400, detail="Unexpected filename.")

    base = os.path.abspath(UPLOAD_DIR)
    path = os.path.abspath(os.path.join(base, filename))
    if os.path.commonpath([base, path]) != base:
        raise HTTPException(status_code=400, detail="Refusing to delete outside uploads.")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="No such upload.")

    os.remove(path)
    return {"status": "deleted", "filename": filename}
