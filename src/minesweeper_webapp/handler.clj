(ns minesweeper-webapp.handler
  (:use compojure.core)
  (:use minesweeper.core)
  (:use minesweeper.util)
  (:require [compojure.handler :as handler]
            [compojure.route :as route]
            [cheshire.core :as json]
            [ring.util.response :as response]
            [ring.adapter.jetty :as jetty])
  (:gen-class))

(defn square->map
  "??????"
  [[coordinate state mines]]
  {:coord coordinate :state state :mines mines})

(defn restructure-board-for-json
  "??????"
  [board]
  (assoc board :squares (map #(map square->map %) (:squares board))))

(defn- create-board-response
  "Creates a JSON REST response based on the given request and new board. Board is stored on the session."
  [request board]
  {:body (json/generate-string (restructure-board-for-json (restructure-board board)))
   :headers {"Content-Type" "application/json"
             "Cache-Control" "no-cache, no-store, must-revalidate"
             "Pragma" "no-cache"
             "Expires" "-1"}
   :session (assoc (:session request) :board board)})

(defn- create-new-board
  "REST handler that creates and returns a new board of given size and number of mines."
  [request]
  (let [width (:width (:route-params request))
        height (:height (:route-params request))
        number-of-mines (:number-of-mines (:route-params request))
        board (apply new-board (map read-string [width height number-of-mines]))]
    (create-board-response request board)))

(defn- move
  "REST handler that performs the given action on the given coordinate and returns the updated board."
  [request]
  (let [coordinate (keyword (:coordinate (:route-params request)))
        action (keyword (:action (:route-params request)))
        board (:board (:session request))
        new-board (merge-boards board (do-move board coordinate action))]
    (create-board-response request new-board)))

(defroutes app-routes
  (GET "/" [] (response/redirect "/index.html"))
  (GET "/new/:width/:height/:number-of-mines" request (create-new-board request))
  (GET "/move/:coordinate/:action" request (move request))
  (route/resources "/")
  (route/not-found "Not Found"))

(def app 
  (handler/site app-routes))

(defn -main
  [& [port]]
  (let [port (Integer. (or port (System/getenv "PORT") 5000))]
    (jetty/run-jetty #'app {:port port, :join? false})))
