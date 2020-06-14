package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/websocket"
)

// defines webcoked read and write buffer
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// used to parse json from the client
type Payload struct {
	ClientPayload []string `json:"payload"`
}

// gets the message from client
// calcualtes and send it back to the client
func reader(conn *websocket.Conn) {
	for {
		// gets the message type, the message and error object
		messageType, clientRawMessage, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}

		// converting raw bytes to JSON
		var clientJsonMessage Payload
		json.Unmarshal([]byte(string(clientRawMessage)), &clientJsonMessage)
		log.Println(len(clientJsonMessage.ClientPayload))

		// calucaltes the result
		var result float64
		result = 0
		for i := 0; i < len(clientJsonMessage.ClientPayload); i++ {
			if clientJsonMessage.ClientPayload[i] == "+" {
				firstNumber, _ := strconv.ParseFloat(clientJsonMessage.ClientPayload[i-1], 64)
				secondNumber, _ := strconv.ParseFloat(clientJsonMessage.ClientPayload[i+1], 64)
				if i > 1 {
					result += secondNumber
				} else {
					result += firstNumber + secondNumber
				}
			}
		}

		// send it back to the client
		if err := conn.WriteJSON(result); err != nil {
			log.Println(err, messageType)
			return
		}
	}
}

// accepts clients connections
func wsEndpoint(w http.ResponseWriter, r *http.Request) {
	// accepting clients from all origin to avoid CORS while testing
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
	}
	log.Println("Client Connected")
	reader(ws)
}

// handles socket routes
func setupRoutes() {
	http.HandleFunc("/ws", wsEndpoint)
}

// setup routes on port 8080
func main() {
	setupRoutes()
	log.Fatal(http.ListenAndServe(":8080", nil))
}
