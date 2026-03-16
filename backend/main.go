package main

import (
	"picasi/tools"

	"github.com/joho/godotenv"
	obm "github.com/tardigrade-sw/OBM"
)

func main() {
	godotenv.Load()
	err := obm.Init("picasi.db")
	if err != nil {
		panic(err)
	}
	defer obm.DBS["picasi.db"].Close()

	server := tools.NewServer()
	err = server.Serve("localhost:8080")
	if err != nil {
		panic(err)
	}
}
