import os
import sys
import socket
import json
os.environ["DJANGO_SETTINGS_MODULE"] = "settings"

class Node_Socket(object):
    def __init__(self):
        self.sock = socket.socket(
            socket.AF_INET, socket.SOCK_STREAM)
            
    def connect(self, host, port):
        self.sock.connect((host, port))

    def recieve_loop(self):
        while 1:
            data = self.sock.recv(512)
            print data
            self.sock.send(data)
            

def create_tcp_server():
    node_server = Node_Socket()
    node_server.connect('localhost', 8124)
    node_server.recieve_loop()
    print "ok"

if __name__ == '__main__':
    create_tcp_server()