# minesweeper-webapp

A simple webapp built on the Minesweeper game core.

## Prerequisites

You will need [Leiningen][1] 1.7.0 or above installed.

[1]: https://github.com/technomancy/leiningen

The game core itself can be found on Github (https://github.com/oysteinjakobsen/minesweeper-clojure)
or on Clojars (https://clojars.org/oysteinj/minesweeper).

## Running

To start a web server for the application, run:

```
lein ring server
```

You can also run the uberjar, optionally passing a port number:

```
java -jar target/minesweeper-webapp-0.1.0-SNAPSHOT-standalone.jar 8080
```
