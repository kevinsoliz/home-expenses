from fastapi import FastAPI

app = FastAPI(title="home-expenses API")


@app.get("/")
def read_root():
    return {"status": "ok"}
