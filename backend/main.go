package main

import (
	"fmt"
	"log"
	"net/http"
)

const dir = "../frontend/dist"
const addr = "127.0.0.1:3000"

func main() {
	fmt.Println("Hello World?")

	server := http.FileServer(http.Dir(dir))
	http.Handle("/", server)

	log.Printf("Listening on %s\n", addr)
	err := http.ListenAndServe(addr, nil)
	if err != nil {
		log.Fatal(err)
	}
}
