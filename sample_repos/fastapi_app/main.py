from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.get("/api/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id, "name": f"Item {item_id}"}

@app.post("/api/items")
async def create_item(item: Item):
    return {"item": item, "message": "Item created successfully"}

@app.get("/api/calculate")
async def calculate(x: int, y: int):
    return {"sum": x + y, "product": x * y}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)