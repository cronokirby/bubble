package main

import (
	"encoding/json"
	"flag"
	"log"
	"net/http"

	"github.com/go-chi/chi"
)

// The map of bubbles we use for our mock API
var bubbles = make(map[string]string)

// BubbleData represents the information we provide when looking up or modifying a bubble
type BubbleData struct {
	Bubble string
}

func lookupBubble(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	bubble, ok := bubbles[id]
	if !ok {
		w.WriteHeader(404)
		w.Write([]byte(`{"bubble": null}`))
		return
	}
	data := BubbleData{bubble}
	w.WriteHeader(200)
	json.NewEncoder(w).Encode(data)
}

func modifyBubble(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	decoder := json.NewDecoder(r.Body)
	var data BubbleData
	if err := decoder.Decode(&data); err != nil {
		http.Error(w, http.StatusText(400), 400)
		return
	}
	bubbles[id] = data.Bubble
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
	r.Get("/api/bubble/{id}", lookupBubble)
	r.Handle("/*", fileServer)

	log.Printf("Listening on %s\n", *addr)
	err := http.ListenAndServe(*addr, r)
	if err != nil {
		log.Fatal(err)
	}
}
