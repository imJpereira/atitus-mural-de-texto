import os
import json
from tornado.web import Application, RequestHandler, StaticFileHandler
import tornado.websocket
from tornado.ioloop import IOLoop

rooms = {}

class HomeHandler(RequestHandler):
    def get(self):
        self.render("home.html")

class SalaHandler(RequestHandler):
    def get(self, sala):
        if sala not in rooms:
            rooms[sala] = {"text": "", "clients": set()}
        print(rooms)  
        self.render("editor.html", sala=sala)

class RoomSocket(tornado.websocket.WebSocketHandler):
    def open(self, sala):
        if sala not in rooms:
            rooms[sala] = {"text": "", "clients": set()}

        timer = rooms[sala].pop("timer", None)
        if timer:
            IOLoop.current().remove_timeout(timer)

        self.sala = sala
        rooms[sala]["clients"].add(self)
        
        mensagem_init = {
            "type": "init",
            "text": rooms[sala]["text"]
        }
        self.write_message(json.dumps(mensagem_init))

    def on_message(self, message):
        try:
            dados = json.loads(message)
            if dados.get("type") == "update":
                novo_texto = dados.get("text", "")
                rooms[self.sala]["text"] = novo_texto
                for cliente in rooms[self.sala]["clients"]:
                    if cliente != self:  
                        cliente.write_message(message) #
        except json.JSONDecodeError:
            print("Mensagem inválida recebida.")    

    def on_close(self):
        if hasattr(self, 'sala') and self.sala in rooms:
            rooms[self.sala]["clients"].discard(self)
            if not rooms[self.sala]["clients"]:
                rooms[self.sala]["timer"] = IOLoop.current().call_later(30, rooms.pop, self.sala, None)

    def check_origin(self, origin):
        return True        

def criar_app():
    caminho_static = os.path.join(os.path.dirname(__file__), "static")
    caminho_templates = os.path.join(os.path.dirname(__file__), "templates")

    return Application([
        # Rota para a página inicial
        (r"/", HomeHandler),

        # Rota do WebSocket
        (r"/ws/([a-zA-Z0-9_-]{1,50})", RoomSocket),
        
        # Rota das salas
        (r"/([a-zA-Z0-9_-]{1,50})", SalaHandler),
        
        # Rota pros arquivos estáticos (CSS, JS)
        (r"/static/(.*)", StaticFileHandler, {"path": caminho_static}),
    ], 
    template_path=caminho_templates) 