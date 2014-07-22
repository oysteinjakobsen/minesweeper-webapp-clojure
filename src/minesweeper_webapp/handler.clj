(ns minesweeper-webapp.handler
  (:use compojure.core)
  (:use minesweeper.core)
  (:use minesweeper.util)
  (:use minesweeper.hof)
  (:require [clojure.string :as string]
            [compojure.handler :as handler]
            [compojure.route :as route]
            [cheshire.core :as json]
            [ring.util.response :as response]
            [ring.middleware.json :as middleware]
            [ring.adapter.jetty :as jetty]
            [clojure.tools.cli :refer [parse-opts]])
  (:gen-class))

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
  [{{:keys [nick]} :session :as request} board updates-only?]
  (->
    (restructured-board board updates-only?)
    (assoc :hof @use-hof)
    (assoc :nick nick)
    (create-json-response)
    (non-cached-response)
    (store-in-session request {:board board})))

(defn- create-new-board
  "REST handler that creates and returns a new board of given size and number of mines."
  [{{:keys [width height number-of-mines]} :route-params :as request}]
  (create-board-response 
    request
    (apply new-board (map read-string [width height number-of-mines]))
    {:updates-only? false}))

(defn- move
  "REST handler that performs the given action on the given coordinate and returns the updated board."
  [{{:keys [coordinate action]} :route-params {:keys [board]} :session :as request}]
  (create-board-response
    request
    (apply do-move board (map keyword [coordinate action]))
    {:updates-only? true}))

(defn- get-hof
  "REST handler that returns Hall of Fame for given board size and number of mines."
  [{{:keys [width height number-of-mines]} :route-params}]
  (->
    (apply get-hall-of-fame (map read-string [width height number-of-mines])) 
    (create-json-response)
    (non-cached-response)))

(defn- post-result
  "Adds the result to Hall-of-Fame. Nick is posted and board is taken from session."
  [{body :body {:keys [board]} :session :as request}]
  (let [nick (get body "nick")]
    (->
      (when (and
               (= (game-over? board) :won)
               (not (empty? nick)))
         (add-result! board nick))
      (create-json-response)
      (store-in-session request {:nick nick}))))

(defroutes app-routes
  (GET "/" [] (response/redirect "/index.html"))
  (GET "/new/:width/:height/:number-of-mines" request (create-new-board request))
  (GET "/move/:coordinate/:action" request (move request))
  (GET "/hof/:width/:height/:number-of-mines" request (get-hof request))
  (POST "/result" request (post-result request))
  (route/resources "/")
  (route/not-found "Not Found"))

(def app 
  (->
    (handler/site app-routes)
    (middleware/wrap-json-body)))

(def ^{:private true, :const true} cli-options
  "Definitions of command line options."
  [["-p" "--port PORT" "Port number"
    :default 8080
    :parse-fn #(Integer/parseInt %)
    :validate [#(< 0 % 0x10000) "Must be a number between 0 and 65536"]]
   [nil "--hof" "Enable Hall of Fame (requires Neo4J)"
    :id :use-hof
    :default false]
   [nil "--neo4j URL" "Neo4j connection url"
    :default @connection-string
    :id :neo4j-url]
   ["-h" "--help" "Show usage"]])

(defn- usage 
  "Displays *nix style usage information."
  [options-summary]
  (str
    "Webapp version of the Minesweeper game.\n\n"
    "Usage: [options]\n\n"
    "Options:\n"
    options-summary))

(defn -main
  [& args]
  (let [{:keys [options arguments errors summary]} (parse-opts args cli-options)]
    (cond
      (:help options) (println (usage summary))
      errors (println (string/join \newline errors))
      true (do
             (reset! use-hof (:use-hof options))
             (reset! connection-string (:neo4j-url options))
             (jetty/run-jetty #'app {:port (:port options), :join? false})))))