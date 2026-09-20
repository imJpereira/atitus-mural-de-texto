import os
from tornado.web import Application, RequestHandler, StaticFileHandler

# Dicionario em memoria q guarda o estado das sala / quando reinicia o servidor o texto se perde
rooms = {}

class HomeHandler(RequestHandler):
    def get(self):
        self.render("home.html")

class SalaHandler(RequestHandler):
    def get(self, sala):
        if sala not in rooms:
            rooms[sala] = ""
        print(rooms)  
        self.render("editor.html", sala=sala)

def criar_app():
    caminho_static = os.path.join(os.path.dirname(__file__), "static")
    caminho_templates = os.path.join(os.path.dirname(__file__), "templates")

    return Application([
        # Rota para a página inicial
        (r"/", HomeHandler),
        
        # Rota das salas
        (r"/([a-zA-Z0-9_-]{1,50})", SalaHandler),
        
        # Rota pros arquivos estáticos (CSS, JS)
        (r"/static/(.*)", StaticFileHandler, {"path": caminho_static}),
    ], 
    template_path=caminho_templates) # Informa o tornado onde buscar os arquivos HTML