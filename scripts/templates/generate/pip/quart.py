from quart import Quart
app = Quart(__name__)
@app.get('/')
async def index():
    return 'Hello from Runspace Quart sandbox'
