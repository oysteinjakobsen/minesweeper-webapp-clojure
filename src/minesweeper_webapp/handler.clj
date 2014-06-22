(ns minesweeper-webapp.handler
  (:use compojure.core)
  (:use minesweeper.core)
  (:use minesweeper.util)
  (:require [compojure.handler :as handler]
            [compojure.route :as route]
            [cheshire.core :as json]))

(defn anonymize-state
  "Anonymizes the state so that the client don't see the mines."
  [square]
  (let [a (replace {'mine 'untouched, 'sea 'untouched, 'flagged-mine 'flagged, 'wrongly-flagged-mine 'flagged} square)]
    (if (= (second a) 'untouched)
      (assoc a 2 0)
      a)))

(defn square-as-vector
  "Returns the board square at the given coordinate as a vector containing row index, coordindate state and number of adjacent mines."
  [board coord]
  [(first (coordinate-to-index coord))
   coord 
   (coord board) 
   (number-of-adjacent-mines coord board)])

(defn restructure-board
  "Restructures the board to make it easy to handle by the JavaScript client."
  [board]
  {:state (:board-state board)
   :seconds (time-in-seconds (:start-time board))
   :squares (map (fn [row] (map #(zipmap [:coord :state :mines] (anonymize-state (vec (rest %)))) row))   
                 (vals (group-by #(first %)
                                 (map #(square-as-vector board %)
                                      (board-coordinates (:width board) (:height board))))))})

(defn create-board-response
  "Creates a JSON REST response based on the given request and new board. Board is stored on the session."
  [request board]
  {:body (json/generate-string (restructure-board board))
   :headers {"Content-Type" "application/json"}
   :session (assoc (:session request) :board board)})

(defn create-new-board
  "REST handler that creates and returns a new board of given size and number of mines."
  [request]
  (let [width (:width (:route-params request))
        height (:height (:route-params request))
        number-of-mines (:number-of-mines (:route-params request))
        board (apply new-board (map read-string [width height number-of-mines]))]
    (create-board-response request board)))

(defn move
  "REST handler that performs the given action on the given coordinate and returns the updated board."
  [request]
  (let [coordinate (keyword (:coordinate (:route-params request)))
        action (keyword (:action (:route-params request)))
        board (:board (:session request))
        new-board (do-move board coordinate action)]
    (create-board-response request new-board)))

(defroutes app-routes
  (GET "/new/:width/:height/:number-of-mines" request (create-new-board request))
  (GET "/move/:coordinate/:action" request (move request))
  (route/resources "/")
  (route/not-found "Not Found"))

(def app 
  (handler/site app-routes))
