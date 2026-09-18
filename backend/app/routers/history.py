import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.sql import func
from app.models.database import get_db, Generation
from app.schemas.requests import HistoryListResponse, HistoryItem

router = APIRouter(prefix="/history", tags=["History"])

@router.get("", response_model=HistoryListResponse)
async def list_history(
    db: AsyncSession = Depends(get_db),
    type: str | None = None,
    search: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    query = select(Generation)
    if type:
        query = query.where(Generation.type == type)
    if search:
        query = query.where(Generation.prompt.ilike(f"%{search}%"))
        
    total_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(total_query)
    
    query = query.order_by(desc(Generation.created_at)).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    generations = result.scalars().all()
    
    items = []
    for gen in generations:
        items.append(HistoryItem(
            id=gen.id,
            type=gen.type,
            prompt=gen.prompt,
            result=json.loads(gen.result) if gen.result else {},
            model_used=gen.model_used,
            template=gen.template,
            created_at=gen.created_at
        ))
        
    return HistoryListResponse(items=items, total=total or 0, page=page, limit=limit)

@router.get("/{id}", response_model=HistoryItem)
async def get_history_item(id: str, db: AsyncSession = Depends(get_db)):
    gen = await db.get(Generation, id)
    if not gen:
        raise HTTPException(status_code=404, detail="Generation not found")
        
    return HistoryItem(
        id=gen.id,
        type=gen.type,
        prompt=gen.prompt,
        result=json.loads(gen.result) if gen.result else {},
        model_used=gen.model_used,
        template=gen.template,
        created_at=gen.created_at
    )

@router.delete("/{id}")
async def delete_history_item(id: str, db: AsyncSession = Depends(get_db)):
    gen = await db.get(Generation, id)
    if not gen:
        raise HTTPException(status_code=404, detail="Generation not found")
        
    await db.delete(gen)
    await db.commit()
    return {"status": "success", "message": "Deleted successfully"}
