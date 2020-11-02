package main

import (
	"flag"
	"log"
	"net/http"
)

func main() {
	dir := flag.String("dir", "../frontend/dist", "the directory for static assets")
	addr := flag.String("addr", "127.0.0.1:4000", "the address to listen on")
	flag.Parse()

	server := http.FileServer(http.Dir(*dir))
	http.Handle("/", server)

	log.Printf("Listening on %s\n", *addr)
	err := http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Fatal(err)
	}
}
