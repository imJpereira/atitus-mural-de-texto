import tornado.ioloop
from servidor import criar_app

if __name__ == "__main__":
    app = criar_app()
    porta = 8080
    
    app.listen(porta)
    print(f"Servidor rodando em http://localhost:{porta}")
    
    tornado.ioloop.IOLoop.current().start()