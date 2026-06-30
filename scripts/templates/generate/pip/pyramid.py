from pyramid.config import Configurator
from pyramid.response import Response

def hello_world(request):
    return Response('Hello from Runspace Pyramid sandbox')

if __name__ == '__main__':
    with Configurator() as config:
        config.add_route('hello', '/')
        config.add_view(hello_world, route_name='hello')
        app = config.make_wsgi_app()
    from waitress import serve
    serve(app, host='127.0.0.1', port=8080)
