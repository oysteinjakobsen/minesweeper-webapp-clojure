# minesweeper-webapp

A simple webapp built on the Minesweeper game core.

## Prerequisites

You will need [Leiningen][1] 1.7.0 or above installed.

[1]: https://github.com/technomancy/leiningen

The game core itself can be found on Github (https://github.com/oysteinjakobsen/minesweeper-clojure)
or on Clojars (https://clojars.org/oysteinj/minesweeper).

## Running

To start a web server for the application (port 3000), run:

```
lein ring server
```

You can also run the uberjar (default port is 8080):

```
java -jar target/minesweeper-webapp-1.0.0-SNAPSHOT-standalone.jar
```

Add **--help** for details about possible command line parameters.

Note that if you have Neo4j installed, you can enable the Hall-of-Fame functionality with the **--hof** parameter.
