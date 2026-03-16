module picasi

go 1.25.1

replace github.com/tardigrade-sw/OBM => ./OBM

require (
	github.com/joho/godotenv v1.5.1
	github.com/tardigrade-sw/OBM v0.0.0-00010101000000-000000000000
)

require (
	go.etcd.io/bbolt v1.4.3 // indirect
	golang.org/x/sys v0.29.0 // indirect
	google.golang.org/protobuf v1.36.9 // indirect
)
