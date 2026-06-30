package main

import (
    "log"
    "{module}/actions"
)

func main() {
    log.Fatal(actions.App().Serve())
}
