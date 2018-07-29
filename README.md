![Houdoku Header](/res/houdoku_header.png)

[![GitHub release](https://img.shields.io/github/release/xgi/houdoku.svg)](https://github.com/xgi/houdoku/releases) 
[![Build Status](https://travis-ci.org/xgi/houdoku.svg?branch=master)](https://travis-ci.org/xgi/houdoku)

Houdoku is a manga reader and library manager for the desktop.

---

# Features

* Supports popular manga aggregators, including MangaDex, MangaHere, MangaSee, and more
([see full list](https://github.com/xgi/houdoku/blob/master/supported_sources.txt)).
* Customizable reader interface with optional dark/night mode.
* Browse and manage your library with tagging and filtering support.

---

![Screenshots](/res/screenshots.png)

---

# Download

Download Houdoku from [the releases page](https://github.com/xgi/houdoku/releases).

Windows users are encouraged to download the provided .exe, whereas users on other operating 
systems should download the .jar. Both options require a sufficient Java installation with JRE 
version 8 or later.

The client can typically be run by simply double clicking the file. Alternatively, you may start 
the client via the command line:
```bash
$ java -jar houdoku-x.y.z.jar
```

# Dependencies

Running Houdoku requires Java (JRE) 8 or later.

The project makes use of the following 3rd-party libraries, which are bundled with the application:

* JSoup 1.11.3 -- Parse HTML documents
* OkHttp3 3.10.0 -- Make HTTP requests
* Gson 2.8.4 -- Object serialization
* AppDirs 1.0.1 -- Determine OS-specific data directories
* slf4j-simple (SimpleLogger) 1.7.25 -- Logging
* JUnit 4.12 -- Unit testing
* Mockito 2.19.1 -- Mocks for unit testing

Libraries are downloaded from the Maven Central Repository -- see this project's [pom.xml](https://github.com/xgi/houdoku/blob/master/pom.xml).

# License

[MIT License](https://github.com/xgi/houdoku/blob/master/LICENSE.txt)