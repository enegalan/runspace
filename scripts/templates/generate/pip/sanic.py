from sanic import Sanic
from sanic.response import text
app = Sanic('RunspaceSanicSandbox')
@app.get('/')
async def index(request):
    return text('Hello from Runspace Sanic sandbox')
