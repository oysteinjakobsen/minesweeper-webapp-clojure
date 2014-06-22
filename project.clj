(defproject minesweeper-webapp "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [ring/ring-json "0.1.2"]
                 [compojure "1.1.6"]
                 [cheshire "4.0.3"]
                 [minesweeper "1.0.0-SNAPSHOT"]]
  :plugins [[lein-ring "0.8.10"]]
  :local-repo "/dev/maven-repo"
  :ring {:handler minesweeper-webapp.handler/app}
  :profiles
  {:dev {:dependencies [[javax.servlet/servlet-api "2.5"]
                        [ring-mock "0.1.5"]]}})
