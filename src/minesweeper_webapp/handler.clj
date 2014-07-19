(ns minesweeper-webapp.handler
  (:use compojure.core)
  (:use minesweeper.core)
  (:use minesweeper.util)
  (:use minesweeper.hof)
  (:require [compojure.handler :as handler]
            [compojure.route :as route]
            [cheshire.core :as json]
            [ring.util.response :as response]
            [ring.adapter.jetty :as jetty])
  (:gen-class))

(defn square->map
  "??????"
  [[coordinate state mines]]
  {:coord coordinate :state state :mines (if (= state 'questioned) "?" mines)})

(defn restructure-board-for-json
  "??????"
  [board]
  (assoc board :squares (map #(map square->map %) (:squares board))))

(defn create-json-response
  [response]
  {:body (json/generate-string response)
   :headers {"Content-Type" "application/json"}})

(defn store-in-session
  [response request map-to-be-stored]
  (assoc response :session (merge (:session request) map-to-be-stored)))

(defn non-cached-response
  "Adds caching headers to the response in order to prevent browser caching."
  [{:keys [headers] :as response}]
  (assoc response 
         :headers (assoc headers
                         "Cache-Control" "no-cache, no-store, must-revalidate"
                         "Pragma" "no-cache"
                         "Expires" "-1")))

(defn- create-board-response
  "Creates a JSON REST response based on the given request and new board. Board is stored on the session."
  [request board]
  (->
    (restructure-board-for-json (restructure-board board))
    (create-json-response)
    (non-cached-response)
    (store-in-session request {:board board})))

(defn- create-new-board
  "REST handler that creates and returns a new board of given size and number of mines."
  [{{:keys [width height number-of-mines]} :route-params :as request}]
  (create-board-response 
    request
    (apply new-board (map read-string [width height number-of-mines]))))

(defn- move
  "REST handler that performs the given action on the given coordinate and returns the updated board."
  [{{:keys [coordinate action]} :route-params {:keys [board]} :session :as request}]
  (create-board-response
    request
    (apply do-move board (map keyword [coordinate action]))))

(defn- get-hof
  "REST handler that returns Hall of Fame for given board size and number of mines."
  [{{:keys [width height number-of-mines]} :route-params}]
  (->
    (apply get-hall-of-fame (map read-string [width height number-of-mines])) 
    (create-json-response)
    (non-cached-response)))

(defroutes app-routes
  (GET "/" [] (response/redirect "/index.html"))
  (GET "/new/:width/:height/:number-of-mines" request (create-new-board request))
  (GET "/move/:coordinate/:action" request (move request))
  (GET "/hof/:width/:height/:number-of-mines" request (get-hof request))
  (route/resources "/")
  (route/not-found "Not Found"))

(def app 
  (handler/site app-routes))

(defn -main
  [& [port]]
  (let [port (Integer. (or port (System/getenv "PORT") 5000))]
    (jetty/run-jetty #'app {:port port, :join? false})))
