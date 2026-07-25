package main

import (
	"log"
	"{goModule}/actions"
)

func main() {
	log.Fatal(actions.App().Serve())
}
