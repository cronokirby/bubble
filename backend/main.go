package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi"
)

type modifyBubbleT struct {
	Bubble string
}

func modifyBubble(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	decoder := json.NewDecoder(r.Body)
	var data modifyBubbleT
	if err := decoder.Decode(&data); err != nil {
		http.Error(w, http.StatusText(400), 400)
		return
	}
	fmt.Println(id, data)
	w.WriteHeader(200)
	w.Write([]byte("{}"))
}

func main() {
	dir := flag.String("dir", "../frontend/dist", "the directory for static assets")
	addr := flag.String("addr", "127.0.0.1:4000", "the address to listen on")
	flag.Parse()

	r := chi.NewRouter()

	fileServer := http.FileServer(http.Dir(*dir))
	r.Post("/api/bubble/{id}", modifyBubble)
	r.Handle("/*", fileServer)

	log.Printf("Listening on %s\n", *addr)
	err := http.ListenAndServe(*addr, r)
	if err != nil {
		log.Fatal(err)
	}
}
