package main

import (
	"flag"
	"log"
	"net/http"

	"github.com/go-chi/chi"
)

func main() {
	dir := flag.String("dir", "../frontend/dist", "the directory for static assets")
	addr := flag.String("addr", "127.0.0.1:4000", "the address to listen on")
	flag.Parse()

	r := chi.NewRouter()

	server := http.FileServer(http.Dir(*dir))
	r.Get("/*", server.ServeHTTP)

	log.Printf("Listening on %s\n", *addr)
	err := http.ListenAndServe(*addr, r)
	if err != nil {
		log.Fatal(err)
	}
}
