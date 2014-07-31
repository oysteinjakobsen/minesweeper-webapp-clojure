(defproject oysteinj/minesweeper-webapp "1.0.0-SNAPSHOT"
  :description "Simple webapp built on top of the Minesweeper game core."
  :url "http://github.com/oysteinjakobsen/minesweeper-webapp-clojure"
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [ring/ring-json "0.1.2"]
                 [compojure "1.1.6"]
                 [cheshire "4.0.3"]
                 [oysteinj/minesweeper "1.0.0-SNAPSHOT"]
                 [ring/ring-jetty-adapter "1.3.0"]
                 [org.clojure/tools.cli "0.3.1"]]
  :plugins [[lein-ring "0.8.10"]]
  :ring {:handler minesweeper-webapp.handler/app}
  :main minesweeper-webapp.handler
  :aot [minesweeper-webapp.handler]
  :profiles
  {:dev {:dependencies [[javax.servlet/servlet-api "2.5"]
                        [ring-mock "0.1.5"]]}})
