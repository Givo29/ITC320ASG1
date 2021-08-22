#!/usr/bin/python
import sys, os
PORT = 8080

import http.server

os.chdir(os.path.dirname(__file__))
http.server.test(HandlerClass=http.server.SimpleHTTPRequestHandler,port=PORT,bind="")
print ("Serving at port", PORT)
start_server() #If you want cgi, set cgi to True e.g. start_server(cgi=True)
        

 
 